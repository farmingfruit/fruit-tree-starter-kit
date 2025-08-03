import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { communicationPreferences, members } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const memberId = params.memberId;

    // Get member information
    const member = await db
      .select({
        id: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        email: members.email,
      })
      .from(members)
      .where(eq(members.id, memberId))
      .limit(1);

    if (!member[0]) {
      return NextResponse.redirect(new URL('/unsubscribe/not-found', request.url));
    }

    // Check if already unsubscribed
    const preferences = await db
      .select()
      .from(communicationPreferences)
      .where(eq(communicationPreferences.memberId, memberId))
      .limit(1);

    const isAlreadyUnsubscribed = preferences[0] && !preferences[0].emailOptIn;

    // Return the unsubscribe page
    return NextResponse.redirect(
      new URL(`/unsubscribe/email?member=${encodeURIComponent(member[0].firstName + ' ' + member[0].lastName)}&email=${encodeURIComponent(member[0].email || '')}&already=${isAlreadyUnsubscribed}&id=${memberId}`, request.url)
    );

  } catch (error) {
    console.error('Error handling email unsubscribe:', error);
    return NextResponse.redirect(new URL('/unsubscribe/error', request.url));
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const memberId = params.memberId;
    const body = await request.json();
    const { reason, feedback } = body;

    // Get or create communication preferences
    const existing = await db
      .select()
      .from(communicationPreferences)
      .where(eq(communicationPreferences.memberId, memberId))
      .limit(1);

    if (existing[0]) {
      // Update existing preferences
      await db
        .update(communicationPreferences)
        .set({
          emailOptIn: false,
          emailUnsubscribedAt: new Date(),
          unsubscribeReason: reason || 'user_request',
          updatedAt: new Date(),
        })
        .where(eq(communicationPreferences.memberId, memberId));
    } else {
      // Create new preferences record
      await db.insert(communicationPreferences).values({
        id: `pref_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        memberId,
        emailOptIn: false,
        smsOptIn: false, // Default opt-out for new records
        emailUnsubscribedAt: new Date(),
        unsubscribeReason: reason || 'user_request',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }

    // Log the unsubscribe event for compliance
    await logUnsubscribeEvent(memberId, 'email', reason, feedback);

    return NextResponse.json({ 
      success: true, 
      message: 'Successfully unsubscribed from email communications' 
    });

  } catch (error) {
    console.error('Error processing email unsubscribe:', error);
    return NextResponse.json({ 
      error: 'Failed to process unsubscribe request' 
    }, { status: 500 });
  }
}

async function logUnsubscribeEvent(
  memberId: string, 
  type: 'email' | 'sms', 
  reason?: string, 
  feedback?: string
) {
  try {
    // In a real implementation, you might want to log this to a separate
    // audit table for compliance purposes
    console.log('Unsubscribe event:', {
      memberId,
      type,
      reason,
      feedback,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error logging unsubscribe event:', error);
  }
}