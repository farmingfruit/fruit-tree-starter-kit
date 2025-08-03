import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { messages, messageRecipients, members, communicationPreferences, communicationSettings } from "@/db/schema";
import { eq, and, inArray, or } from "drizzle-orm";
import { EmailService, EmailTemplateProcessor } from "@/lib/email-service";
import { SMSService } from "@/lib/sms-service";
import { auth } from "@/lib/auth";

interface SendMessageRequest {
  type: 'email' | 'sms';
  subject?: string; // Required for email
  content: string;
  recipientType: 'all_members' | 'active_members' | 'visitors' | 'custom_selection' | 'individual';
  recipientIds?: string[]; // For custom_selection and individual
  recipientFilter?: any; // JSON criteria for advanced filtering
  scheduledFor?: string; // ISO date string for scheduling
  fromName?: string;
  replyTo?: string;
  campaignId?: string;
  tags?: string[];
  notes?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: SendMessageRequest = await request.json();
    
    // Validate required fields
    if (!body.type || !body.content || !body.recipientType) {
      return NextResponse.json({ 
        error: "Missing required fields: type, content, recipientType" 
      }, { status: 400 });
    }

    if (body.type === 'email' && !body.subject) {
      return NextResponse.json({ 
        error: "Subject is required for email messages" 
      }, { status: 400 });
    }

    // Get user's church ID (assuming it's stored in user profile or derivable)
    // This would need to be implemented based on your auth structure
    const churchId = await getUserChurchId(session.user.id);
    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    // Get communication settings
    const settings = await db
      .select()
      .from(communicationSettings)
      .where(eq(communicationSettings.churchId, churchId))
      .limit(1);

    if (!settings[0]) {
      return NextResponse.json({ 
        error: "Communication settings not configured" 
      }, { status: 400 });
    }

    // Get recipients based on selection criteria
    const recipients = await getRecipients(churchId, body.recipientType, body.recipientIds, body.recipientFilter);
    
    if (recipients.length === 0) {
      return NextResponse.json({ 
        error: "No valid recipients found" 
      }, { status: 400 });
    }

    // Create message record
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const scheduledFor = body.scheduledFor ? new Date(body.scheduledFor) : null;
    
    await db.insert(messages).values({
      id: messageId,
      churchId,
      type: body.type,
      status: scheduledFor ? 'scheduled' : 'draft',
      subject: body.subject,
      content: body.content,
      fromName: body.fromName || settings[0].emailFromName || 'Church',
      fromEmail: body.type === 'email' ? `${body.fromName || 'church'}@${settings[0].emailSubdomain}` : undefined,
      fromPhone: body.type === 'sms' ? settings[0].smsPhoneNumber : undefined,
      replyTo: body.replyTo || settings[0].emailReplyTo,
      recipientType: body.recipientType,
      recipientCount: recipients.length,
      recipientFilter: body.recipientFilter ? JSON.stringify(body.recipientFilter) : null,
      scheduledFor,
      campaignId: body.campaignId,
      tags: body.tags ? JSON.stringify(body.tags) : null,
      notes: body.notes,
      createdBy: session.user.id,
      createdAt: new Date(),
    });

    // Create recipient records
    const recipientRecords = recipients.map(recipient => ({
      id: `rcpt_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      messageId,
      memberId: recipient.memberId,
      email: body.type === 'email' ? recipient.email : undefined,
      phone: body.type === 'sms' ? recipient.phone : undefined,
      firstName: recipient.firstName,
      lastName: recipient.lastName,
      status: 'pending' as const,
      mergeData: JSON.stringify(EmailTemplateProcessor.generateMergeData(recipient)),
      createdAt: new Date(),
    }));

    await db.insert(messageRecipients).values(recipientRecords);

    // If not scheduled, send immediately
    if (!scheduledFor) {
      const sendResult = await sendMessage(messageId, body.type, body.content, body.subject, settings[0], recipients);
      
      // Update message status
      await db
        .update(messages)
        .set({ 
          status: sendResult.success ? 'sent' : 'failed',
          sentAt: sendResult.success ? new Date() : undefined,
          deliveredCount: sendResult.deliveredCount,
          failedCount: sendResult.failedCount,
          actualCost: sendResult.totalCost,
        })
        .where(eq(messages.id, messageId));

      return NextResponse.json({
        messageId,
        status: sendResult.success ? 'sent' : 'failed',
        recipientCount: recipients.length,
        deliveredCount: sendResult.deliveredCount,
        failedCount: sendResult.failedCount,
        totalCost: sendResult.totalCost,
        errors: sendResult.errors,
      });
    }

    return NextResponse.json({
      messageId,
      status: 'scheduled',
      recipientCount: recipients.length,
      scheduledFor: scheduledFor.toISOString(),
    });

  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json({ 
      error: "Failed to send message" 
    }, { status: 500 });
  }
}

async function getUserChurchId(userId: string): Promise<string | null> {
  // This would need to be implemented based on your user-church relationship
  // For now, returning a placeholder
  // You might have a user_churches table or church info in the user record
  return "church_1"; // Placeholder
}

async function getRecipients(
  churchId: string, 
  recipientType: string, 
  recipientIds?: string[], 
  recipientFilter?: any
) {
  let query = db
    .select({
      memberId: members.id,
      email: members.email,
      phone: members.mobilePhone,
      firstName: members.firstName,
      lastName: members.lastName,
      preferredName: members.preferredName,
      membershipStatus: members.membershipStatus,
      communicationPrefs: communicationPreferences,
    })
    .from(members)
    .leftJoin(communicationPreferences, eq(members.id, communicationPreferences.memberId))
    .where(eq(members.churchId, churchId));

  // Apply recipient type filters
  switch (recipientType) {
    case 'active_members':
      query = query.where(eq(members.membershipStatus, 'Active'));
      break;
    case 'visitors':
      query = query.where(eq(members.membershipStatus, 'Visitor'));
      break;
    case 'custom_selection':
    case 'individual':
      if (recipientIds && recipientIds.length > 0) {
        query = query.where(inArray(members.id, recipientIds));
      } else {
        return []; // No specific recipients selected
      }
      break;
    // 'all_members' doesn't need additional filters
  }

  const results = await query;
  
  // Filter out recipients who have opted out
  return results.filter(recipient => {
    if (!recipient.email && !recipient.phone) return false;
    
    // Check communication preferences
    if (recipient.communicationPrefs) {
      if (recipient.communicationPrefs.emailUnsubscribedAt) return false;
      if (recipient.communicationPrefs.smsUnsubscribedAt) return false;
    }
    
    return true;
  });
}

async function sendMessage(
  messageId: string,
  type: 'email' | 'sms',
  content: string,
  subject: string | undefined,
  settings: any,
  recipients: any[]
) {
  let deliveredCount = 0;
  let failedCount = 0;
  let totalCost = 0;
  const errors: string[] = [];

  try {
    if (type === 'email') {
      const emailService = await EmailService.createForChurch(settings.churchId);
      
      for (const recipient of recipients) {
        if (!recipient.email) {
          failedCount++;
          continue;
        }

        try {
          const mergeData = EmailTemplateProcessor.generateMergeData(recipient);
          const personalizedContent = EmailTemplateProcessor.processTemplate(content, mergeData);
          const personalizedSubject = EmailTemplateProcessor.processTemplate(subject || '', mergeData);

          const result = await emailService.sendEmail({
            to: recipient.email,
            from: `${settings.emailFromName}@${settings.emailSubdomain}`,
            fromName: settings.emailFromName,
            replyTo: settings.emailReplyTo,
            subject: personalizedSubject,
            htmlContent: personalizedContent,
            trackingEnabled: true,
            unsubscribeLink: `${process.env.NEXT_PUBLIC_APP_URL}/unsubscribe/email/${recipient.memberId}`,
          });

          // Update recipient record
          await db
            .update(messageRecipients)
            .set({
              status: result.status === 'sent' ? 'sent' : 'failed',
              providerMessageId: result.messageId,
              personalizedContent,
              sentAt: result.status === 'sent' ? new Date() : undefined,
              errorMessage: result.error,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(messageRecipients.messageId, messageId),
                eq(messageRecipients.memberId, recipient.memberId)
              )
            );

          if (result.status === 'sent') {
            deliveredCount++;
          } else {
            failedCount++;
            if (result.error) errors.push(result.error);
          }
        } catch (error) {
          failedCount++;
          errors.push(`Failed to send to ${recipient.email}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    } else if (type === 'sms') {
      const smsService = await SMSService.createForChurch(settings.churchId);
      
      for (const recipient of recipients) {
        if (!recipient.phone) {
          failedCount++;
          continue;
        }

        try {
          const mergeData = EmailTemplateProcessor.generateMergeData(recipient);
          const personalizedContent = EmailTemplateProcessor.processTemplate(content, mergeData);

          const result = await smsService.sendSMS({
            to: recipient.phone,
            from: settings.smsPhoneNumber,
            message: personalizedContent,
          });

          // Update recipient record
          await db
            .update(messageRecipients)
            .set({
              status: result.status === 'sent' || result.status === 'queued' ? 'sent' : 'failed',
              providerMessageId: result.messageId,
              personalizedContent,
              sentAt: result.status === 'sent' || result.status === 'queued' ? new Date() : undefined,
              errorMessage: result.error,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(messageRecipients.messageId, messageId),
                eq(messageRecipients.memberId, recipient.memberId)
              )
            );

          if (result.status === 'sent' || result.status === 'queued') {
            deliveredCount++;
            if (result.cost) totalCost += result.cost;
          } else {
            failedCount++;
            if (result.error) errors.push(result.error);
          }
        } catch (error) {
          failedCount++;
          errors.push(`Failed to send to ${recipient.phone}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }
    }

    return {
      success: deliveredCount > 0,
      deliveredCount,
      failedCount,
      totalCost,
      errors,
    };
  } catch (error) {
    return {
      success: false,
      deliveredCount,
      failedCount,
      totalCost,
      errors: [`Send operation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
    };
  }
}