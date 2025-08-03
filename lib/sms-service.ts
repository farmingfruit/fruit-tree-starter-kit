import { db } from "@/db/drizzle";
import { communicationSettings, smsConversations, smsMessages } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export interface SMSProvider {
  name: string;
  send: (params: SendSMSParams) => Promise<SMSResult>;
  setupPhoneNumber: (churchId: string, areaCode?: string) => Promise<PhoneNumberResult>;
  setupWebhook: (churchId: string, phoneNumber: string) => Promise<WebhookSetupResult>;
  estimateCost: (message: string, recipientCount: number) => number;
}

export interface SendSMSParams {
  to: string;
  from: string;
  message: string;
  mediaUrls?: string[];
}

export interface SMSResult {
  messageId: string;
  status: 'sent' | 'failed' | 'queued';
  cost?: number; // Cost in cents
  error?: string;
}

export interface PhoneNumberResult {
  phoneNumber: string;
  cost: number; // Monthly cost in cents
  capabilities: string[];
}

export interface WebhookSetupResult {
  webhookUrl: string;
  success: boolean;
  error?: string;
}

// Twilio provider implementation
class TwilioProvider implements SMSProvider {
  name = 'twilio';
  private accountSid: string;
  private authToken: string;
  private baseUrl: string;

  constructor(accountSid: string, authToken: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    this.baseUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}`;
  }

  private getAuthHeader(): string {
    return 'Basic ' + Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
  }

  async send(params: SendSMSParams): Promise<SMSResult> {
    try {
      const formData = new URLSearchParams({
        To: params.to,
        From: params.from,
        Body: params.message,
      });

      // Add media URLs if provided
      if (params.mediaUrls && params.mediaUrls.length > 0) {
        params.mediaUrls.forEach((url, index) => {
          formData.append(`MediaUrl`, url);
        });
      }

      const response = await fetch(`${this.baseUrl}/Messages.json`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return { 
          messageId: '', 
          status: 'failed', 
          error: error.message || 'Failed to send SMS' 
        };
      }

      const result = await response.json();
      return {
        messageId: result.sid,
        status: result.status === 'queued' ? 'queued' : 'sent',
        cost: result.price ? Math.abs(parseFloat(result.price) * 100) : undefined,
      };
    } catch (error) {
      return {
        messageId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async setupPhoneNumber(churchId: string, areaCode: string = '555'): Promise<PhoneNumberResult> {
    try {
      // First, search for available phone numbers
      const searchResponse = await fetch(
        `${this.baseUrl}/AvailablePhoneNumbers/US/Local.json?AreaCode=${areaCode}&SmsEnabled=true&VoiceEnabled=true`,
        {
          headers: {
            'Authorization': this.getAuthHeader(),
          },
        }
      );

      if (!searchResponse.ok) {
        throw new Error('Failed to search for available phone numbers');
      }

      const availableNumbers = await searchResponse.json();
      
      if (!availableNumbers.available_phone_numbers || availableNumbers.available_phone_numbers.length === 0) {
        throw new Error(`No phone numbers available in area code ${areaCode}`);
      }

      const selectedNumber = availableNumbers.available_phone_numbers[0];

      // Purchase the phone number
      const purchaseData = new URLSearchParams({
        PhoneNumber: selectedNumber.phone_number,
        SmsUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/${churchId}`,
        SmsMethod: 'POST',
        VoiceUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/voice/${churchId}`,
        VoiceMethod: 'POST',
      });

      const purchaseResponse = await fetch(`${this.baseUrl}/IncomingPhoneNumbers.json`, {
        method: 'POST',
        headers: {
          'Authorization': this.getAuthHeader(),
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: purchaseData,
      });

      if (!purchaseResponse.ok) {
        const error = await purchaseResponse.json();
        throw new Error(error.message || 'Failed to purchase phone number');
      }

      const purchaseResult = await purchaseResponse.json();

      return {
        phoneNumber: purchaseResult.phone_number,
        cost: 100, // $1.00 per month for most Twilio numbers
        capabilities: selectedNumber.capabilities,
      };
    } catch (error) {
      throw new Error(`Phone number setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async setupWebhook(churchId: string, phoneNumber: string): Promise<WebhookSetupResult> {
    try {
      // Find the phone number SID
      const numbersResponse = await fetch(`${this.baseUrl}/IncomingPhoneNumbers.json`, {
        headers: {
          'Authorization': this.getAuthHeader(),
        },
      });

      if (!numbersResponse.ok) {
        throw new Error('Failed to fetch phone numbers');
      }

      const numbersData = await numbersResponse.json();
      const phoneNumberRecord = numbersData.incoming_phone_numbers.find(
        (num: any) => num.phone_number === phoneNumber
      );

      if (!phoneNumberRecord) {
        throw new Error('Phone number not found in account');
      }

      // Update webhook URL
      const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/twilio/${churchId}`;
      const updateData = new URLSearchParams({
        SmsUrl: webhookUrl,
        SmsMethod: 'POST',
      });

      const updateResponse = await fetch(
        `${this.baseUrl}/IncomingPhoneNumbers/${phoneNumberRecord.sid}.json`,
        {
          method: 'POST',
          headers: {
            'Authorization': this.getAuthHeader(),
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: updateData,
        }
      );

      if (!updateResponse.ok) {
        const error = await updateResponse.json();
        throw new Error(error.message || 'Failed to update webhook');
      }

      return {
        webhookUrl,
        success: true,
      };
    } catch (error) {
      return {
        webhookUrl: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  estimateCost(message: string, recipientCount: number): number {
    // SMS segments: 160 chars for basic SMS, 70 for Unicode
    const hasUnicode = /[^\u0000-\u00ff]/.test(message);
    const segmentLength = hasUnicode ? 70 : 160;
    const segments = Math.ceil(message.length / segmentLength);
    
    // Twilio charges ~$0.0075 per SMS segment in the US
    const costPerSegment = 0.75; // 0.75 cents
    
    return Math.round(segments * recipientCount * costPerSegment);
  }
}

// SMS service factory
export class SMSService {
  private provider: SMSProvider;

  constructor(provider: SMSProvider) {
    this.provider = provider;
  }

  static async createForChurch(churchId: string): Promise<SMSService> {
    const settings = await db
      .select()
      .from(communicationSettings)
      .where(eq(communicationSettings.churchId, churchId))
      .limit(1);

    if (!settings[0]) {
      throw new Error('Communication settings not found for church');
    }

    const config = settings[0];
    
    switch (config.smsProvider) {
      case 'twilio':
        if (!config.smsAccountSid || !config.smsApiSecret) {
          throw new Error('Twilio credentials not configured');
        }
        return new SMSService(new TwilioProvider(config.smsAccountSid, config.smsApiSecret));
      
      default:
        throw new Error(`Unsupported SMS provider: ${config.smsProvider}`);
    }
  }

  async sendSMS(params: SendSMSParams): Promise<SMSResult> {
    return this.provider.send(params);
  }

  async setupPhoneNumber(churchId: string, areaCode?: string): Promise<PhoneNumberResult> {
    return this.provider.setupPhoneNumber(churchId, areaCode);
  }

  async setupWebhook(churchId: string, phoneNumber: string): Promise<WebhookSetupResult> {
    return this.provider.setupWebhook(churchId, phoneNumber);
  }

  estimateCost(message: string, recipientCount: number): number {
    return this.provider.estimateCost(message, recipientCount);
  }
}

// Two-way SMS conversation manager
export class SMSConversationManager {
  static async handleIncomingMessage(
    churchId: string,
    fromPhone: string,
    toPhone: string,
    message: string,
    mediaUrls?: string[]
  ): Promise<void> {
    try {
      // Find or create conversation
      let conversation = await db
        .select()
        .from(smsConversations)
        .where(
          and(
            eq(smsConversations.churchId, churchId),
            eq(smsConversations.memberPhone, fromPhone),
            eq(smsConversations.churchPhone, toPhone)
          )
        )
        .limit(1);

      if (!conversation[0]) {
        // Create new conversation
        const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(smsConversations).values({
          id: conversationId,
          churchId,
          memberPhone: fromPhone,
          churchPhone: toPhone,
          lastMessageAt: new Date(),
          messageCount: 1,
          unreadCount: 1,
        });
        
        conversation = [{ id: conversationId, churchId, memberPhone: fromPhone, churchPhone: toPhone }];
      } else {
        // Update existing conversation
        await db
          .update(smsConversations)
          .set({
            lastMessageAt: new Date(),
            messageCount: conversation[0].messageCount + 1,
            unreadCount: conversation[0].unreadCount + 1,
            updatedAt: new Date(),
          })
          .where(eq(smsConversations.id, conversation[0].id));
      }

      // Create SMS message record
      const messageId = `sms_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      await db.insert(smsMessages).values({
        id: messageId,
        conversationId: conversation[0].id,
        direction: 'inbound',
        content: message,
        fromPhone,
        toPhone,
        status: 'received',
        messageType: mediaUrls && mediaUrls.length > 0 ? 'media' : 'text',
        mediaUrls: mediaUrls ? JSON.stringify(mediaUrls) : null,
        createdAt: new Date(),
      });

      // Check for auto-reply
      await this.checkAutoReply(churchId, conversation[0].id, fromPhone, toPhone, message);
    } catch (error) {
      console.error('Error handling incoming SMS:', error);
    }
  }

  private static async checkAutoReply(
    churchId: string,
    conversationId: string,
    memberPhone: string,
    churchPhone: string,
    incomingMessage: string
  ): Promise<void> {
    try {
      // Get church settings
      const settings = await db
        .select()
        .from(communicationSettings)
        .where(eq(communicationSettings.churchId, churchId))
        .limit(1);

      if (!settings[0] || !settings[0].smsAutoReply || !settings[0].enableTwoWaySms) {
        return;
      }

      // Check if it's within quiet hours
      const now = new Date();
      const currentTime = now.toTimeString().substring(0, 5); // HH:MM format
      const quietStart = settings[0].smsQuietHoursStart || '21:00';
      const quietEnd = settings[0].smsQuietHoursEnd || '08:00';

      if (this.isQuietHours(currentTime, quietStart, quietEnd)) {
        return;
      }

      // Check for STOP keywords
      const stopKeywords = ['STOP', 'UNSUBSCRIBE', 'QUIT', 'END', 'CANCEL'];
      if (stopKeywords.some(keyword => 
        incomingMessage.toUpperCase().includes(keyword)
      )) {
        await this.handleUnsubscribe(churchId, memberPhone);
        return;
      }

      // Get conversation to check auto-reply timing
      const conversation = await db
        .select()
        .from(smsConversations)
        .where(eq(smsConversations.id, conversationId))
        .limit(1);

      if (!conversation[0] || !conversation[0].autoReplyEnabled) {
        return;
      }

      // Check if we've sent an auto-reply recently (within 1 hour)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      if (conversation[0].lastAutoReply && conversation[0].lastAutoReply > oneHourAgo) {
        return;
      }

      // Send auto-reply
      const smsService = await SMSService.createForChurch(churchId);
      const autoReplyResult = await smsService.sendSMS({
        to: memberPhone,
        from: churchPhone,
        message: settings[0].smsAutoReply,
      });

      if (autoReplyResult.status === 'sent' || autoReplyResult.status === 'queued') {
        // Record the auto-reply message
        const messageId = `sms_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(smsMessages).values({
          id: messageId,
          conversationId,
          direction: 'outbound',
          content: settings[0].smsAutoReply,
          fromPhone: churchPhone,
          toPhone: memberPhone,
          status: 'sent',
          isAutoReply: true,
          triggeredBy: 'incoming_message',
          providerMessageId: autoReplyResult.messageId,
          cost: autoReplyResult.cost,
          createdAt: new Date(),
        });

        // Update conversation auto-reply timestamp
        await db
          .update(smsConversations)
          .set({
            lastAutoReply: new Date(),
          })
          .where(eq(smsConversations.id, conversationId));
      }
    } catch (error) {
      console.error('Error sending auto-reply:', error);
    }
  }

  private static isQuietHours(currentTime: string, quietStart: string, quietEnd: string): boolean {
    const current = this.timeToMinutes(currentTime);
    const start = this.timeToMinutes(quietStart);
    const end = this.timeToMinutes(quietEnd);

    // Handle overnight quiet hours (e.g., 21:00 to 08:00)
    if (start > end) {
      return current >= start || current < end;
    }
    
    // Handle same-day quiet hours (e.g., 12:00 to 14:00)
    return current >= start && current < end;
  }

  private static timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private static async handleUnsubscribe(churchId: string, phoneNumber: string): Promise<void> {
    try {
      // Find member by phone number and update their SMS preferences
      const { members, communicationPreferences } = await import('@/db/schema');
      
      // This would need to be implemented based on your member lookup logic
      // For now, we'll just mark the conversation as archived
      await db
        .update(smsConversations)
        .set({
          status: 'archived',
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(smsConversations.churchId, churchId),
            eq(smsConversations.memberPhone, phoneNumber)
          )
        );
    } catch (error) {
      console.error('Error handling SMS unsubscribe:', error);
    }
  }

  static async sendReply(
    conversationId: string,
    message: string,
    adminUserId: string
  ): Promise<SMSResult> {
    try {
      // Get conversation details
      const conversation = await db
        .select()
        .from(smsConversations)
        .where(eq(smsConversations.id, conversationId))
        .limit(1);

      if (!conversation[0]) {
        throw new Error('Conversation not found');
      }

      // Send SMS
      const smsService = await SMSService.createForChurch(conversation[0].churchId);
      const result = await smsService.sendSMS({
        to: conversation[0].memberPhone,
        from: conversation[0].churchPhone,
        message,
      });

      if (result.status === 'sent' || result.status === 'queued') {
        // Record the message
        const messageId = `sms_${Date.now()}_${Math.random().toString(36).substring(7)}`;
        await db.insert(smsMessages).values({
          id: messageId,
          conversationId,
          direction: 'outbound',
          content: message,
          fromPhone: conversation[0].churchPhone,
          toPhone: conversation[0].memberPhone,
          status: 'sent',
          providerMessageId: result.messageId,
          cost: result.cost,
          createdAt: new Date(),
        });

        // Update conversation
        await db
          .update(smsConversations)
          .set({
            lastMessageAt: new Date(),
            messageCount: conversation[0].messageCount + 1,
            updatedAt: new Date(),
          })
          .where(eq(smsConversations.id, conversationId));
      }

      return result;
    } catch (error) {
      return {
        messageId: '',
        status: 'failed',
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}