import { NextRequest, NextResponse } from "next/server";
import { formsPeopleIntegration } from "@/lib/forms-people-integration";
import { getCurrentUser } from "@/lib/auth";

/**
 * API endpoint for admin profile merging
 * 
 * This endpoint allows church administrators to merge duplicate profiles
 * identified by the progressive recognition system.
 */

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get request data
    const body = await request.json();
    const { primaryMemberId, duplicateMemberId, churchId } = body;

    // Validate required fields
    if (!primaryMemberId || !duplicateMemberId || !churchId) {
      return NextResponse.json(
        { error: "Primary member ID, duplicate member ID, and church ID are required" },
        { status: 400 }
      );
    }

    if (primaryMemberId === duplicateMemberId) {
      return NextResponse.json(
        { error: "Cannot merge a profile with itself" },
        { status: 400 }
      );
    }

    // Perform profile merge
    await formsPeopleIntegration.mergeProfiles(
      primaryMemberId,
      duplicateMemberId,
      churchId
    );

    return NextResponse.json({
      success: true,
      message: "Profiles merged successfully"
    });

  } catch (error) {
    console.error("Profile merge error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to merge profiles" },
      { status: 500 }
    );
  }
}