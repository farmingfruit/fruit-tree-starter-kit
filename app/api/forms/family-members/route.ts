import { NextRequest, NextResponse } from "next/server";
import { formsPeopleIntegration } from "@/lib/forms-people-integration";
import { getCurrentUser } from "@/lib/auth";

/**
 * API endpoint for fetching family members for form registration
 * 
 * This endpoint enables family registration by fetching related family members
 * from the People database for multi-person form submissions.
 */

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get query parameters
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("memberId");
    const churchId = searchParams.get("churchId");

    // Validate required parameters
    if (!memberId || !churchId) {
      return NextResponse.json(
        { error: "Member ID and Church ID are required" },
        { status: 400 }
      );
    }

    // Fetch family members
    const familyMembers = await formsPeopleIntegration.getFamilyMembers(
      memberId,
      churchId
    );

    return NextResponse.json({
      success: true,
      familyMembers,
      message: familyMembers.length > 0 
        ? `Found ${familyMembers.length} family member(s)`
        : "No family members found"
    });

  } catch (error) {
    console.error("Family members fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch family members" },
      { status: 500 }
    );
  }
}

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
    const { searchData, churchId, limit = 10 } = body;

    // Validate required fields
    if (!churchId) {
      return NextResponse.json(
        { error: "Church ID is required" },
        { status: 400 }
      );
    }

    // Search for potential family member matches
    const potentialMatches = await formsPeopleIntegration.searchPotentialMatches(
      searchData,
      churchId,
      limit
    );

    return NextResponse.json({
      success: true,
      matches: potentialMatches,
      message: `Found ${potentialMatches.length} potential match(es)`
    });

  } catch (error) {
    console.error("Family member search error:", error);
    return NextResponse.json(
      { error: "Failed to search family members" },
      { status: 500 }
    );
  }
}