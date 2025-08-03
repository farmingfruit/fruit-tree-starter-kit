import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { communicationWebhooks, messageRecipients, communicationPreferences } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import crypto from "crypto";

interface SendGridEvent {
  email: string;
  timestamp: number;
  'smtp-id': string;
  event: string;
  category?: string[];
  sg_event_id: string;
  sg_message_id: string;
  reason?: string;
  status?: string;
  url?: string;
  useragent?: string;
  ip?: string;
  response?: string;
}

export async function POST(
  request: NextRequest,
  { params }: { params: { churchId: string } }
) {
  try {
    const churchId = params.churchId;
    
    // Verify webhook signature (recommended for production)
    const signature = request.headers.get('x-twilio-signature');
    const body = await request.text();
    
    // TODO: Implement signature verification for security
    // const isValid = verifySignature(body, signature, webhookSecret);
    // if (!isValid) {
    //   return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    // }

    const events: SendGridEvent[] = JSON.parse(body);

    for (const event of events) {
      try {
        // Log webhook for debugging and compliance
        const webhookId = `wh_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(communicationWebhooks).values({
          id: webhookId,
          churchId,
          provider: 'sendgrid',
          eventType: event.event,
          providerEventId: event.sg_event_id,
          rawPayload: JSON.stringify(event),
          processed: false,
          createdAt: new Date(),
        });

        // Process the event
        await processEvent(churchId, event, webhookId);

        // Mark webhook as processed
        await db
          .update(communicationWebhooks)
          .set({
            processed: true,
            processedAt: new Date(),
          })
          .where(eq(communicationWebhooks.id, webhookId));

      } catch (error) {
        console.error('Error processing SendGrid event:', error);
        // Continue processing other events
      }
    }

    return NextResponse.json({ received: events.length });

  } catch (error) {
    console.error('Error processing SendGrid webhook:', error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}

async function processEvent(churchId: string, event: SendGridEvent, webhookId: string) {
  try {
    // Find the message recipient by email and provider message ID
    const recipient = await db
      .select()
      .from(messageRecipients)
      .where(
        and(
          eq(messageRecipients.email, event.email),
          eq(messageRecipients.providerMessageId, event.sg_message_id)
        )
      )
      .limit(1);

    if (!recipient[0]) {
      console.warn(`Recipient not found for email: ${event.email}, message: ${event.sg_message_id}`);
      return;
    }

    const recipientId = recipient[0].id;
    const updateData: any = {
      updatedAt: new Date(),
    };

    switch (event.event) {
      case 'delivered':
        updateData.status = 'delivered';
        updateData.deliveredAt = new Date(event.timestamp * 1000);
        break;

      case 'opened':
        updateData.status = 'opened';
        updateData.openedAt = new Date(event.timestamp * 1000);
        break;

      case 'click':
        updateData.status = 'clicked';
        if (!recipient[0].firstClickedAt) {
          updateData.firstClickedAt = new Date(event.timestamp * 1000);
        }
        break;

      case 'bounce':
        updateData.status = 'bounced';
        updateData.errorCode = event.status;
        updateData.errorMessage = event.reason;
        
        // Update member's communication preferences
        if (recipient[0].memberId) {
          await handleEmailBounce(recipient[0].memberId, event.reason || 'Bounced');
        }
        break;

      case 'dropped':
        updateData.status = 'failed';
        updateData.errorCode = event.status;
        updateData.errorMessage = event.reason;
        break;

      case 'deferred':
        // Email was temporarily deferred, don't change status
        break;

      case 'processed':
        updateData.status = 'sent';
        updateData.sentAt = new Date(event.timestamp * 1000);
        break;

      case 'unsubscribe':
      case 'group_unsubscribe':
        updateData.status = 'unsubscribed';
        
        // Update member's communication preferences
        if (recipient[0].memberId) {
          await handleEmailUnsubscribe(recipient[0].memberId, event.event);
        }
        break;

      case 'spamreport':
        updateData.status = 'spam';
        
        // Update member's communication preferences
        if (recipient[0].memberId) {
          await handleSpamReport(recipient[0].memberId);
        }
        break;

      default:
        console.log(`Unhandled SendGrid event type: ${event.event}`);
        return;
    }

    // Update the message recipient
    await db
      .update(messageRecipients)
      .set(updateData)
      .where(eq(messageRecipients.id, recipientId));

    // Update webhook with recipient reference
    await db
      .update(communicationWebhooks)
      .set({
        recipientId: recipientId,
      })
      .where(eq(communicationWebhooks.id, webhookId));

  } catch (error) {
    console.error('Error processing SendGrid event:', error);
    
    // Update webhook with error
    await db
      .update(communicationWebhooks)
      .set({
        processingError: error instanceof Error ? error.message : 'Unknown error',
      })
      .where(eq(communicationWebhooks.id, webhookId));
  }
}

async function handleEmailBounce(memberId: string, reason: string) {
  try {
    // Get or create communication preferences
    const existing = await db
      .select()
      .from(communicationPreferences)
      .where(eq(communicationPreferences.memberId, memberId))
      .limit(1);

    if (existing[0]) {
      // Update bounce count and last bounce date
      await db
        .update(communicationPreferences)
        .set({
          emailBounceCount: existing[0].emailBounceCount + 1,
          emailLastBounce: new Date(),
          // If hard bounce or too many soft bounces, opt them out
          emailOptIn: reason.toLowerCase().includes('permanent') || existing[0].emailBounceCount >= 3 ? false : existing[0].emailOptIn,
          updatedAt: new Date(),
        })
        .where(eq(communicationPreferences.memberId, memberId));
    } else {
      // Create new preferences record
      await db.insert(communicationPreferences).values({
        id: `pref_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        memberId,
        emailOptIn: !reason.toLowerCase().includes('permanent'), // Opt out for permanent bounces
        emailBounceCount: 1,
        emailLastBounce: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error handling email bounce:', error);
  }
}

async function handleEmailUnsubscribe(memberId: string, eventType: string) {
  try {
    // Get or create communication preferences
    const existing = await db
      .select()
      .from(communicationPreferences)
      .where(eq(communicationPreferences.memberId, memberId))
      .limit(1);

    if (existing[0]) {
      await db
        .update(communicationPreferences)
        .set({
          emailOptIn: false,
          emailUnsubscribedAt: new Date(),
          unsubscribeReason: eventType,
          updatedAt: new Date(),
        })
        .where(eq(communicationPreferences.memberId, memberId));
    } else {
      await db.insert(communicationPreferences).values({
        id: `pref_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        memberId,
        emailOptIn: false,
        emailUnsubscribedAt: new Date(),
        unsubscribeReason: eventType,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error handling email unsubscribe:', error);
  }
}

async function handleSpamReport(memberId: string) {
  try {
    // Automatically unsubscribe and mark as spam complaint
    const existing = await db
      .select()
      .from(communicationPreferences)
      .where(eq(communicationPreferences.memberId, memberId))
      .limit(1);

    if (existing[0]) {
      await db
        .update(communicationPreferences)
        .set({
          emailOptIn: false,
          emailUnsubscribedAt: new Date(),
          unsubscribeReason: 'spam_complaint',
          updatedAt: new Date(),
        })
        .where(eq(communicationPreferences.memberId, memberId));
    } else {
      await db.insert(communicationPreferences).values({
        id: `pref_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        memberId,
        emailOptIn: false,
        emailUnsubscribedAt: new Date(),
        unsubscribeReason: 'spam_complaint',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
  } catch (error) {
    console.error('Error handling spam report:', error);
  }
}

function verifySignature(payload: string, signature: string, secret: string): boolean {
  try {
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(payload, 'utf8')
      .digest('base64');
    
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );
  } catch (error) {
    return false;
  }
}