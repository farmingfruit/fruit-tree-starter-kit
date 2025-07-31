/**
 * Progressive Recognition API - Confirm Match
 * 
 * This endpoint handles user confirmation of suggested matches.
 * When a user is shown a "Is this you?" prompt and confirms, this
 * endpoint processes that confirmation and links their submission.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { personProfiles, formSubmissions, profileMatchSuggestions } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { validateChurchAccess } from "@/lib/auth-wrapper";
import { adminActionRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

interface ConfirmMatchRequest {
  churchId: string;
  profileId: string;
  submissionId?: string;
  confirmed: boolean;
  userFeedback?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await adminActionRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: "Too many requests. Please try again later.",
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '600'
          }
        }
      );
    }

    // Parse request body
    const body: ConfirmMatchRequest = await request.json();
    const { churchId, profileId, submissionId, confirmed, userFeedback } = body;

    // Validate required fields
    if (!churchId || !profileId) {
      return NextResponse.json(
        { error: "Church ID and Profile ID are required" },
        { status: 400 }
      );
    }

    // Validate church access
    const hasAccess = await validateChurchAccess(churchId, request);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized access to church data" },
        { status: 403 }
      );
    }

    // Verify the profile exists and belongs to the church
    const profile = await db
      .select()
      .from(personProfiles)
      .where(
        and(
          eq(personProfiles.id, profileId),
          eq(personProfiles.churchId, churchId)
        )
      )
      .limit(1);

    if (!profile[0]) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      );
    }

    if (confirmed) {
      // User confirmed the match - update profile status
      await db
        .update(personProfiles)
        .set({
          profileStatus: 'verified',
          verifiedAt: new Date(),
          confidenceScore: Math.min(100, profile[0].confidenceScore + 10), // Boost confidence
          updatedAt: new Date()
        })
        .where(eq(personProfiles.id, profileId));

      // If there's a submission, link it to the profile
      if (submissionId) {
        await db
          .update(formSubmissions)
          .set({
            personProfileId: profileId,
            memberId: profile[0].memberId,
            familyId: profile[0].familyId,
            isVerified: true,
            updatedAt: new Date()
          })
          .where(
            and(
              eq(formSubmissions.id, submissionId),
              eq(formSubmissions.churchId, churchId)
            )
          );
      }

      // Log the confirmation for analytics
      await logRecognitionFeedback(churchId, profileId, 'confirmed', userFeedback);

      return NextResponse.json({
        success: true,
        message: "Match confirmed successfully",
        profile: {
          id: profile[0].id,
          firstName: profile[0].firstName,
          lastName: profile[0].lastName,
          email: profile[0].email,
          phone: profile[0].phone,
          status: 'verified'
        }
      });

    } else {
      // User rejected the match - lower confidence and create a new profile if needed
      await db
        .update(personProfiles)
        .set({
          confidenceScore: Math.max(0, profile[0].confidenceScore - 20), // Reduce confidence
          updatedAt: new Date()
        })
        .where(eq(personProfiles.id, profileId));

      // Log the rejection for analytics
      await logRecognitionFeedback(churchId, profileId, 'rejected', userFeedback);

      return NextResponse.json({
        success: true,
        message: "Match rejected. You can continue as a new visitor.",
        createNewProfile: true
      });
    }

  } catch (error) {
    console.error("Confirm match error:", error);
    
    return NextResponse.json(
      { error: "Internal server error during match confirmation" },
      { status: 500 }
    );
  }
}

/**
 * Log recognition feedback for analytics and machine learning
 */
async function logRecognitionFeedback(
  churchId: string,
  profileId: string,
  action: 'confirmed' | 'rejected',
  feedback?: string
): Promise<void> {
  try {
    // In a production system, this would log to an analytics service
    // or a dedicated feedback table for machine learning training
    console.log(`Recognition feedback - Church: ${churchId}, Profile: ${profileId}, Action: ${action}`, {
      feedback,
      timestamp: new Date().toISOString()
    });

    // You could also update a recognition_analytics table here
    // to track success rates and improve the algorithm over time
    
  } catch (error) {
    console.error('Error logging recognition feedback:', error);
    // Don't throw - feedback logging shouldn't break the main flow
  }
}