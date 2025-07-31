import { NextRequest, NextResponse } from "next/server";
import { formsPeopleIntegration } from "@/lib/forms-people-integration";
import { getCurrentUser } from "@/lib/auth";

/**
 * API endpoint for progressive recognition in forms
 * 
 * This endpoint provides real-time progressive recognition for form submissions,
 * connecting the revolutionary forms system with the existing People database.
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
    const { formData, churchId } = body;

    // Validate required fields
    if (!churchId) {
      return NextResponse.json(
        { error: "Church ID is required" },
        { status: 400 }
      );
    }

    if (!formData || (!formData.email && !formData.phone && !formData.firstName)) {
      return NextResponse.json(
        { error: "At least email, phone, or first name is required for recognition" },
        { status: 400 }
      );
    }

    // Perform progressive recognition
    const recognition = await formsPeopleIntegration.performProgressiveRecognition(
      formData,
      churchId
    );

    return NextResponse.json({
      success: true,
      recognition,
      message: getRecognitionMessage(recognition)
    });

  } catch (error) {
    console.error("Progressive recognition error:", error);
    return NextResponse.json(
      { error: "Failed to perform recognition" },
      { status: 500 }
    );
  }
}

function getRecognitionMessage(recognition: any): string {
  switch (recognition.action) {
    case 'auto_fill':
      return `Welcome back, ${recognition.matchedProfile?.firstName}! We've filled in your details.`;
    
    case 'confirm_identity':
      return `Looks like you're already in our system! Is this you: ${recognition.maskedData?.email}?`;
    
    case 'admin_review':
      return "Thanks for your submission! We're processing your information.";
    
    case 'create_new':
      return "Welcome to our church! Please fill out the form below.";
    
    default:
      return "Please fill out the form below.";
  }
}