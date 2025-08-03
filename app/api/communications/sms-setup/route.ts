import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { communicationSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { SMSService } from "@/lib/sms-service";

interface SMSSetupRequest {
  areaCode?: string;
  smsAccountSid?: string;
  smsApiSecret?: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const churchId = await getUserChurchId(session.user.id);
    if (!churchId) {
      return NextResponse.json({ error: "Church not found" }, { status: 404 });
    }

    const body: SMSSetupRequest = await request.json();

    // Get existing settings
    const settings = await db
      .select()
      .from(communicationSettings)
      .where(eq(communicationSettings.churchId, churchId))
      .limit(1);

    if (!settings[0]) {
      return NextResponse.json({ 
        error: "Communication settings not found. Please configure basic settings first." 
      }, { status: 400 });
    }

    // Validate Twilio credentials
    if (!body.smsAccountSid || !body.smsApiSecret) {
      return NextResponse.json({ 
        error: "Twilio Account SID and Auth Token are required" 
      }, { status: 400 });
    }

    // Update settings with Twilio credentials first
    await db
      .update(communicationSettings)
      .set({
        smsAccountSid: body.smsAccountSid,
        smsApiSecret: body.smsApiSecret,
        updatedAt: new Date(),
      })
      .where(eq(communicationSettings.churchId, churchId));

    // Create SMS service instance
    const smsService = await SMSService.createForChurch(churchId);

    try {
      // Setup phone number
      const phoneResult = await smsService.setupPhoneNumber(churchId, body.areaCode);
      
      // Setup webhook
      const webhookResult = await smsService.setupWebhook(churchId, phoneResult.phoneNumber);

      if (!webhookResult.success) {
        return NextResponse.json({ 
          error: `Phone number acquired but webhook setup failed: ${webhookResult.error}` 
        }, { status: 500 });
      }

      // Update settings with phone number
      await db
        .update(communicationSettings)
        .set({
          smsPhoneNumber: phoneResult.phoneNumber,
          updatedAt: new Date(),
        })
        .where(eq(communicationSettings.churchId, churchId));

      return NextResponse.json({
        success: true,
        phoneNumber: phoneResult.phoneNumber,
        monthlyCost: phoneResult.cost,
        capabilities: phoneResult.capabilities,
        webhookUrl: webhookResult.webhookUrl,
      });

    } catch (error) {
      return NextResponse.json({ 
        error: `SMS setup failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error setting up SMS:', error);
    return NextResponse.json({ 
      error: "Failed to setup SMS" 
    }, { status: 500 });
  }
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

    const { searchParams } = new URL(request.url);
    const message = searchParams.get('message') || 'Test message';
    const recipientCount = parseInt(searchParams.get('recipientCount') || '1');

    // Get settings
    const settings = await db
      .select()
      .from(communicationSettings)
      .where(eq(communicationSettings.churchId, churchId))
      .limit(1);

    if (!settings[0] || !settings[0].smsAccountSid) {
      return NextResponse.json({ 
        error: "SMS not configured" 
      }, { status: 400 });
    }

    try {
      const smsService = await SMSService.createForChurch(churchId);
      const estimatedCost = smsService.estimateCost(message, recipientCount);

      return NextResponse.json({
        phoneNumber: settings[0].smsPhoneNumber,
        estimatedCost,
        recipientCount,
        messageLength: message.length,
        enableTwoWaySms: settings[0].enableTwoWaySms,
        autoReply: settings[0].smsAutoReply,
        quietHours: {
          start: settings[0].smsQuietHoursStart,
          end: settings[0].smsQuietHoursEnd,
        },
      });

    } catch (error) {
      return NextResponse.json({ 
        error: `Failed to get SMS info: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error getting SMS info:', error);
    return NextResponse.json({ 
      error: "Failed to get SMS information" 
    }, { status: 500 });
  }
}

async function getUserChurchId(userId: string): Promise<string | null> {
  // This would need to be implemented based on your user-church relationship
  return "church_1"; // Placeholder
}