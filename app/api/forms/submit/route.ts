import { NextRequest, NextResponse } from "next/server";
import { formsPeopleIntegration, FormSubmissionData } from "@/lib/forms-people-integration";
import { getCurrentUser } from "@/lib/auth";

/**
 * API endpoint for form submission with People database integration
 * 
 * This endpoint handles form submissions and automatically creates or updates
 * member profiles in the People database based on progressive recognition.
 */

export async function POST(request: NextRequest) {
  try {
    // For public forms, we don't require authentication
    // The churchId in the form data determines access
    const body = await request.json();
    const { 
      formData, 
      churchId, 
      recognizedMemberId, 
      confirmNewProfile,
      selectedFamilyMembers = []
    } = body;

    // Validate required fields
    if (!churchId) {
      return NextResponse.json(
        { error: "Church ID is required" },
        { status: 400 }
      );
    }

    if (!formData || !formData.firstName || !formData.lastName) {
      return NextResponse.json(
        { error: "First name and last name are required" },
        { status: 400 }
      );
    }

    // Prepare submission data
    const submissionData: FormSubmissionData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      address: formData.address,
      city: formData.city,
      state: formData.state,
      zipCode: formData.zipCode,
      formId: formData.formId,
      formType: formData.formType || 'contact',
      submissionData: formData,
    };

    let memberId: string;

    if (recognizedMemberId && !confirmNewProfile) {
      // Update existing member profile
      memberId = await formsPeopleIntegration.createOrUpdateMember(
        submissionData,
        churchId,
        recognizedMemberId
      );
    } else {
      // Create new member profile
      memberId = await formsPeopleIntegration.createOrUpdateMember(
        submissionData,
        churchId
      );
    }

    // Handle family member registrations if applicable
    const familyRegistrations = [];
    if (selectedFamilyMembers.length > 0) {
      for (const familyMember of selectedFamilyMembers) {
        const familySubmissionData: FormSubmissionData = {
          ...submissionData,
          firstName: familyMember.firstName,
          lastName: familyMember.lastName,
          email: familyMember.email,
          phone: familyMember.phone,
          dateOfBirth: familyMember.dateOfBirth ? new Date(familyMember.dateOfBirth) : undefined,
          submissionData: {
            ...formData,
            ...familyMember,
            registeredBy: memberId,
          },
        };

        const familyMemberId = await formsPeopleIntegration.createOrUpdateMember(
          familySubmissionData,
          churchId,
          familyMember.id // This would be provided if they're existing members
        );

        familyRegistrations.push({
          memberId: familyMemberId,
          name: `${familyMember.firstName} ${familyMember.lastName}`,
        });
      }
    }

    // Log the form submission (this would integrate with a form submissions table)
    const submissionId = `submission_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

    return NextResponse.json({
      success: true,
      submissionId,
      memberId,
      familyRegistrations,
      message: generateSuccessMessage(submissionData, familyRegistrations.length),
    });

  } catch (error) {
    console.error("Form submission error:", error);
    return NextResponse.json(
      { error: "Failed to submit form" },
      { status: 500 }
    );
  }
}

function generateSuccessMessage(
  submissionData: FormSubmissionData, 
  familyCount: number
): string {
  const baseMessage = `Thank you, ${submissionData.firstName}! Your registration has been submitted successfully.`;
  
  if (familyCount > 0) {
    return `${baseMessage} We've also registered ${familyCount} family member${familyCount > 1 ? 's' : ''} with you.`;
  }
  
  if (submissionData.formType === 'registration') {
    return `${baseMessage} You'll receive a confirmation email shortly.`;
  }
  
  return `${baseMessage} We'll be in touch soon.`;
}