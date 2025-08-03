import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { communicationSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { DNSConfigGenerator } from "@/lib/email-service";
import { SMSService } from "@/lib/sms-service";

interface UpdateSettingsRequest {
  emailSubdomain?: string;
  emailFromName?: string;
  emailReplyTo?: string;
  emailSignature?: string;
  emailServiceProvider?: string;
  emailApiKey?: string;
  
  smsProvider?: string;
  smsApiKey?: string;
  smsApiSecret?: string;
  smsAccountSid?: string;
  enableTwoWaySms?: boolean;
  smsAutoReply?: string;
  smsQuietHoursStart?: string;
  smsQuietHoursEnd?: string;
  
  unsubscribeText?: string;
  privacyPolicyUrl?: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getUserChurchId(session.user.id);
    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const settings = await db
      .select()
      .from(communicationSettings)
      .where(eq(communicationSettings.churchId, churchId))
      .limit(1);

    if (!settings[0]) {
      // Create default settings
      const defaultSettings = {
        id: `comm_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        churchId,
        emailServiceProvider: 'sendgrid',
        smsProvider: 'twilio',
        enableTwoWaySms: true,
        smsQuietHoursStart: '21:00',
        smsQuietHoursEnd: '08:00',
        emailDailyLimit: 1000,
        smsDailyLimit: 500,
        emailMonthlyUsage: 0,
        smsMonthlyUsage: 0,
        enableUnsubscribeLink: true,
        unsubscribeText: 'Reply STOP to unsubscribe',
        dnsVerificationStatus: 'pending',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await db.insert(communicationSettings).values(defaultSettings);
      
      return NextResponse.json({
        ...defaultSettings,
        // Don't return sensitive fields
        emailApiKey: undefined,
        smsApiKey: undefined,
        smsApiSecret: undefined,
        emailWebhookSecret: undefined,
      });
    }

    return NextResponse.json({
      ...settings[0],
      // Don't return sensitive fields in GET requests
      emailApiKey: undefined,
      smsApiKey: undefined,
      smsApiSecret: undefined,
      emailWebhookSecret: undefined,
    });

  } catch (error) {
    console.error('Error fetching communication settings:', error);
    return NextResponse.json({ 
      error: "Failed to fetch settings" 
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getUserChurchId(session.user.id);
    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const body: UpdateSettingsRequest = await request.json();

    // Get existing settings
    const existingSettings = await db
      .select()
      .from(communicationSettings)
      .where(eq(communicationSettings.churchId, churchId))
      .limit(1);

    const updateData: any = {
      ...body,
      updatedAt: new Date(),
    };

    if (existingSettings[0]) {
      // Update existing settings
      await db
        .update(communicationSettings)
        .set(updateData)
        .where(eq(communicationSettings.churchId, churchId));
    } else {
      // Create new settings
      await db.insert(communicationSettings).values({
        id: `comm_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        churchId,
        ...updateData,
        createdAt: new Date(),
      });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating communication settings:', error);
    return NextResponse.json({ 
      error: "Failed to update settings" 
    }, { status: 500 });
  }
}

async function getUserChurchId(userId: string): Promise<string | null> {
  // This would need to be implemented based on your user-church relationship
  return "church_1"; // Placeholder
}