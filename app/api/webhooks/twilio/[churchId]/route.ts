import { NextRequest, NextResponse } from "next/server";
import { SMSConversationManager } from "@/lib/sms-service";
import { db } from "@/db/drizzle";
import { communicationWebhooks } from "@/db/schema";

export async function POST(
  request: NextRequest,
  { params }: { params: { churchId: string } }
) {
  try {
    const churchId = params.churchId;
    const formData = await request.formData();
    
    // Extract Twilio webhook data
    const from = formData.get('From') as string;
    const to = formData.get('To') as string;
    const body = formData.get('Body') as string;
    const messageSid = formData.get('MessageSid') as string;
    const messageStatus = formData.get('MessageStatus') as string;
    const numMedia = parseInt(formData.get('NumMedia') as string || '0');
    
    // Extract media URLs if present
    const mediaUrls: string[] = [];
    for (let i = 0; i < numMedia; i++) {
      const mediaUrl = formData.get(`MediaUrl${i}`) as string;
      if (mediaUrl) {
        mediaUrls.push(mediaUrl);
      }
    }

    // Log webhook for debugging and compliance
    const webhookId = `wh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    await db.insert(communicationWebhooks).values({
      id: webhookId,
      churchId,
      provider: 'twilio',
      eventType: messageStatus || 'received',
      providerEventId: messageSid,
      rawPayload: JSON.stringify({
        From: from,
        To: to,
        Body: body,
        MessageSid: messageSid,
        MessageStatus: messageStatus,
        NumMedia: numMedia,
        MediaUrls: mediaUrls,
        timestamp: new Date().toISOString(),
      }),
      processed: false,
      createdAt: new Date(),
    });

    // Handle incoming message (status webhooks vs new messages)
    if (body && from && to) {
      // This is a new incoming message
      await SMSConversationManager.handleIncomingMessage(
        churchId,
        from,
        to,
        body,
        mediaUrls.length > 0 ? mediaUrls : undefined
      );
    } else if (messageStatus && messageSid) {
      // This is a status update webhook
      await handleStatusUpdate(churchId, messageSid, messageStatus);
    }

    // Mark webhook as processed
    await db
      .update(communicationWebhooks)
      .set({
        processed: true,
        processedAt: new Date(),
      })
      .where(eq(communicationWebhooks.id, webhookId));

    // Respond with TwiML (required by Twilio for SMS webhooks)
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );

  } catch (error) {
    console.error('Error processing Twilio webhook:', error);
    
    // Still return success to Twilio to avoid retries
    return new NextResponse(
      '<?xml version="1.0" encoding="UTF-8"?><Response></Response>',
      {
        status: 200,
        headers: {
          'Content-Type': 'text/xml',
        },
      }
    );
  }
}

async function handleStatusUpdate(churchId: string, messageSid: string, status: string) {
  try {
    const { messageRecipients, smsMessages } = await import('@/db/schema');
    const { eq } = await import('drizzle-orm');

    // Update message recipient status
    await db
      .update(messageRecipients)
      .set({
        status: mapTwilioStatus(status),
        deliveredAt: ['delivered', 'read'].includes(status) ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(messageRecipients.providerMessageId, messageSid));

    // Update SMS message status
    await db
      .update(smsMessages)
      .set({
        status: mapTwilioStatus(status),
        deliveredAt: ['delivered', 'read'].includes(status) ? new Date() : undefined,
        updatedAt: new Date(),
      })
      .where(eq(smsMessages.providerMessageId, messageSid));

  } catch (error) {
    console.error('Error updating message status:', error);
  }
}

function mapTwilioStatus(twilioStatus: string): string {
  switch (twilioStatus) {
    case 'queued':
    case 'accepted':
      return 'pending';
    case 'sending':
      return 'sent';
    case 'sent':
    case 'delivered':
      return 'delivered';
    case 'received':
      return 'received';
    case 'undelivered':
    case 'failed':
      return 'failed';
    case 'read':
      return 'delivered'; // We don't have a separate "read" status
    default:
      return 'pending';
  }
}