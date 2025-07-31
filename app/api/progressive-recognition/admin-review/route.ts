/**
 * Progressive Recognition API - Admin Review Queue
 * 
 * This endpoint provides admin functionality for reviewing and managing
 * profile matches that require human judgment. It includes operations for
 * viewing pending reviews, approving/rejecting matches, and merging profiles.
 */

import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { 
  adminReviewQueue, 
  profileMatchSuggestions, 
  personProfiles,
  members,
  families
} from "@/db/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";
import { validateChurchAccess } from "@/lib/auth-wrapper";
import { adminActionRateLimit } from "@/lib/rate-limit";
import crypto from "crypto";

interface AdminReviewRequest {
  churchId: string;
  action: 'list' | 'approve' | 'reject' | 'merge';
  reviewId?: string;
  mergeData?: {
    sourceProfileId: string;
    targetProfileId: string;
    keepData?: 'source' | 'target' | 'merge';
  };
}

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const churchId = url.searchParams.get('churchId');
    const status = url.searchParams.get('status') || 'pending';
    const limit = parseInt(url.searchParams.get('limit') || '20');
    const offset = parseInt(url.searchParams.get('offset') || '0');

    if (!churchId) {
      return NextResponse.json(
        { error: "Church ID is required" },
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

    // Get pending review items
    const reviewItems = await db
      .select({
        review: adminReviewQueue,
        suggestion: profileMatchSuggestions,
        sourceProfile: personProfiles,
        targetProfile: {
          id: sql`target_profile.id`,
          firstName: sql`target_profile.first_name`,
          lastName: sql`target_profile.last_name`,
          email: sql`target_profile.email`,
          phone: sql`target_profile.phone`
        }
      })
      .from(adminReviewQueue)
      .leftJoin(
        profileMatchSuggestions,
        eq(adminReviewQueue.itemId, profileMatchSuggestions.id)
      )
      .leftJoin(
        personProfiles,
        eq(profileMatchSuggestions.sourceProfileId, personProfiles.id)
      )
      .leftJoin(
        sql`person_profiles as target_profile`,
        sql`${profileMatchSuggestions.targetProfileId} = target_profile.id`
      )
      .where(
        and(
          eq(adminReviewQueue.churchId, churchId),
          eq(adminReviewQueue.status, status),
          eq(adminReviewQueue.itemType, 'profile_match')
        )
      )
      .orderBy(desc(adminReviewQueue.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select({ count: sql`count(*)` })
      .from(adminReviewQueue)
      .where(
        and(
          eq(adminReviewQueue.churchId, churchId),
          eq(adminReviewQueue.status, status),
          eq(adminReviewQueue.itemType, 'profile_match')
        )
      );

    return NextResponse.json({
      items: reviewItems.map(item => ({
        id: item.review.id,
        title: item.review.title,
        description: item.review.description,
        priority: item.review.priority,
        createdAt: item.review.createdAt,
        confidence: item.suggestion?.confidenceScore || 0,
        matchReasons: item.suggestion?.matchReasons ? JSON.parse(item.suggestion.matchReasons) : [],
        sourceProfile: {
          id: item.sourceProfile?.id,
          firstName: item.sourceProfile?.firstName,
          lastName: item.sourceProfile?.lastName,
          email: item.sourceProfile?.email,
          phone: item.sourceProfile?.phone
        },
        targetProfile: item.targetProfile ? {
          id: item.targetProfile.id,
          firstName: item.targetProfile.firstName,
          lastName: item.targetProfile.lastName,
          email: item.targetProfile.email,
          phone: item.targetProfile.phone
        } : null
      })),
      pagination: {
        total: Number(totalCount[0]?.count) || 0,
        limit,
        offset,
        hasMore: (offset + limit) < (Number(totalCount[0]?.count) || 0)
      }
    });

  } catch (error) {
    console.error("Admin review list error:", error);
    return NextResponse.json(
      { error: "Internal server error fetching review items" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await adminActionRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: "Too many admin actions. Please try again later.",
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

    const body: AdminReviewRequest = await request.json();
    const { churchId, action, reviewId, mergeData } = body;

    // Validate required fields
    if (!churchId || !action) {
      return NextResponse.json(
        { error: "Church ID and action are required" },
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

    switch (action) {
      case 'approve':
        return await approveMatch(churchId, reviewId!);
      
      case 'reject':
        return await rejectMatch(churchId, reviewId!);
      
      case 'merge':
        return await mergeProfiles(churchId, reviewId!, mergeData!);
      
      default:
        return NextResponse.json(
          { error: "Invalid action" },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error("Admin review action error:", error);
    return NextResponse.json(
      { error: "Internal server error during admin review action" },
      { status: 500 }
    );
  }
}

/**
 * Approve a profile match suggestion
 */
async function approveMatch(churchId: string, reviewId: string) {
  try {
    // Get the review item and associated suggestion
    const reviewData = await db
      .select({
        review: adminReviewQueue,
        suggestion: profileMatchSuggestions
      })
      .from(adminReviewQueue)
      .leftJoin(
        profileMatchSuggestions,
        eq(adminReviewQueue.itemId, profileMatchSuggestions.id)
      )
      .where(
        and(
          eq(adminReviewQueue.id, reviewId),
          eq(adminReviewQueue.churchId, churchId)
        )
      )
      .limit(1);

    if (!reviewData[0]) {
      return NextResponse.json(
        { error: "Review item not found" },
        { status: 404 }
      );
    }

    const { review, suggestion } = reviewData[0];

    if (!suggestion) {
      return NextResponse.json(
        { error: "Associated suggestion not found" },
        { status: 404 }
      );
    }

    // Update the suggestion as approved
    await db
      .update(profileMatchSuggestions)
      .set({
        reviewStatus: 'approved',
        reviewedAt: new Date(),
        processedAt: new Date(),
        processingResult: JSON.stringify({ action: 'approved', adminReviewId: reviewId })
      })
      .where(eq(profileMatchSuggestions.id, suggestion.id));

    // Update the review item as completed
    await db
      .update(adminReviewQueue)
      .set({
        status: 'completed',
        reviewedAt: new Date(),
        reviewAction: 'approved'
      })
      .where(eq(adminReviewQueue.id, reviewId));

    // If this was a member link suggestion, create the link
    if (suggestion.matchType === 'member_link' && suggestion.targetMemberId) {
      await db
        .update(personProfiles)
        .set({
          memberId: suggestion.targetMemberId,
          profileStatus: 'verified',
          verifiedAt: new Date(),
          confidenceScore: 100
        })
        .where(eq(personProfiles.id, suggestion.sourceProfileId));
    }

    return NextResponse.json({
      success: true,
      message: "Match approved successfully"
    });

  } catch (error) {
    console.error("Approve match error:", error);
    throw error;
  }
}

/**
 * Reject a profile match suggestion
 */
async function rejectMatch(churchId: string, reviewId: string) {
  try {
    // Get the review item and associated suggestion
    const reviewData = await db
      .select({
        review: adminReviewQueue,
        suggestion: profileMatchSuggestions
      })
      .from(adminReviewQueue)
      .leftJoin(
        profileMatchSuggestions,
        eq(adminReviewQueue.itemId, profileMatchSuggestions.id)
      )
      .where(
        and(
          eq(adminReviewQueue.id, reviewId),
          eq(adminReviewQueue.churchId, churchId)
        )
      )
      .limit(1);

    if (!reviewData[0]) {
      return NextResponse.json(
        { error: "Review item not found" },
        { status: 404 }
      );
    }

    const { review, suggestion } = reviewData[0];

    if (!suggestion) {
      return NextResponse.json(
        { error: "Associated suggestion not found" },
        { status: 404 }
      );
    }

    // Update the suggestion as rejected
    await db
      .update(profileMatchSuggestions)
      .set({
        reviewStatus: 'rejected',
        reviewedAt: new Date(),
        processedAt: new Date(),
        processingResult: JSON.stringify({ action: 'rejected', adminReviewId: reviewId })
      })
      .where(eq(profileMatchSuggestions.id, suggestion.id));

    // Update the review item as completed
    await db
      .update(adminReviewQueue)
      .set({
        status: 'completed',
        reviewedAt: new Date(),
        reviewAction: 'rejected'
      })
      .where(eq(adminReviewQueue.id, reviewId));

    // Lower the confidence score of the source profile to avoid future false matches
    await db
      .update(personProfiles)
      .set({
        confidenceScore: sql`GREATEST(0, confidence_score - 30)`
      })
      .where(eq(personProfiles.id, suggestion.sourceProfileId));

    return NextResponse.json({
      success: true,
      message: "Match rejected successfully"
    });

  } catch (error) {
    console.error("Reject match error:", error);
    throw error;
  }
}

/**
 * Merge two profiles
 */
async function mergeProfiles(
  churchId: string, 
  reviewId: string, 
  mergeData: { sourceProfileId: string; targetProfileId: string; keepData?: 'source' | 'target' | 'merge' }
) {
  try {
    const { sourceProfileId, targetProfileId, keepData = 'merge' } = mergeData;

    // Get both profiles
    const [sourceProfile, targetProfile] = await Promise.all([
      db.select().from(personProfiles).where(eq(personProfiles.id, sourceProfileId)).limit(1),
      db.select().from(personProfiles).where(eq(personProfiles.id, targetProfileId)).limit(1)
    ]);

    if (!sourceProfile[0] || !targetProfile[0]) {
      return NextResponse.json(
        { error: "One or both profiles not found" },
        { status: 404 }
      );
    }

    // Determine which data to keep
    let mergedData: any;
    switch (keepData) {
      case 'source':
        mergedData = sourceProfile[0];
        break;
      case 'target':
        mergedData = targetProfile[0];
        break;
      default: // 'merge'
        mergedData = {
          ...targetProfile[0],
          // Prefer non-null values from source
          firstName: sourceProfile[0].firstName || targetProfile[0].firstName,
          lastName: sourceProfile[0].lastName || targetProfile[0].lastName,
          email: sourceProfile[0].email || targetProfile[0].email,
          phone: sourceProfile[0].phone || targetProfile[0].phone,
          address: sourceProfile[0].address || targetProfile[0].address,
          city: sourceProfile[0].city || targetProfile[0].city,
          state: sourceProfile[0].state || targetProfile[0].state,
          zipCode: sourceProfile[0].zipCode || targetProfile[0].zipCode,
          dateOfBirth: sourceProfile[0].dateOfBirth || targetProfile[0].dateOfBirth,
          // Use higher confidence score
          confidenceScore: Math.max(sourceProfile[0].confidenceScore, targetProfile[0].confidenceScore)
        };
    }

    // Update the target profile with merged data
    await db
      .update(personProfiles)
      .set({
        ...mergedData,
        profileStatus: 'verified',
        verifiedAt: new Date(),
        originalProfiles: JSON.stringify([sourceProfileId, targetProfileId]),
        updatedAt: new Date()
      })
      .where(eq(personProfiles.id, targetProfileId));

    // Mark the source profile as merged
    await db
      .update(personProfiles)
      .set({
        profileStatus: 'merged',
        mergedInto: targetProfileId,
        updatedAt: new Date()
      })
      .where(eq(personProfiles.id, sourceProfileId));

    // Update any form submissions that pointed to the source profile
    await db
      .update(formSubmissions)
      .set({
        personProfileId: targetProfileId,
        updatedAt: new Date()
      })
      .where(eq(formSubmissions.personProfileId, sourceProfileId));

    // Complete the review
    await db
      .update(adminReviewQueue)
      .set({
        status: 'completed',
        reviewedAt: new Date(),
        reviewAction: 'merged',
        reviewNotes: `Profiles merged: ${sourceProfileId} -> ${targetProfileId}`
      })
      .where(eq(adminReviewQueue.id, reviewId));

    return NextResponse.json({
      success: true,
      message: "Profiles merged successfully",
      mergedProfileId: targetProfileId
    });

  } catch (error) {
    console.error("Merge profiles error:", error);
    throw error;
  }
}