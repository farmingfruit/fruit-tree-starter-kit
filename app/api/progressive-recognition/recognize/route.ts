/**
 * Progressive Recognition API - Real-time Person Matching
 * 
 * This endpoint provides real-time recognition capabilities for form submissions.
 * It's designed to be called as users type in their information to provide
 * instant "looks like you're already in our system" experiences.
 * 
 * Endpoints:
 * POST /api/progressive-recognition/recognize - Perform recognition lookup
 */

import { NextRequest, NextResponse } from "next/server";
import { performProgressiveRecognition, RecognitionInput } from "@/lib/progressive-recognition";
import { rateLimit } from "@/lib/rate-limit";
import { validateChurchAccess } from "@/lib/auth-wrapper";

// Rate limiting configuration
const recognitionRateLimit = rateLimit({
  window: 900000, // 15 minutes
  max: 100, // Max 100 recognition requests per 15 minutes per IP
});

interface RecognizeRequest {
  churchId: string;
  input: RecognitionInput;
  options?: {
    maxMatches?: number;
    includeFamily?: boolean;
    respectPrivacy?: boolean;
  };
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const rateLimitResult = await recognitionRateLimit(request);
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: "Too many recognition requests. Please try again later.",
          retryAfter: rateLimitResult.retryAfter 
        },
        { 
          status: 429,
          headers: {
            'Retry-After': rateLimitResult.retryAfter?.toString() || '900'
          }
        }
      );
    }

    // Parse request body
    const body: RecognizeRequest = await request.json();
    const { churchId, input, options = {} } = body;

    // Validate required fields
    if (!churchId) {
      return NextResponse.json(
        { error: "Church ID is required" },
        { status: 400 }
      );
    }

    if (!input || (!input.email && !input.phone && !input.firstName)) {
      return NextResponse.json(
        { error: "At least one of email, phone, or firstName is required" },
        { status: 400 }
      );
    }

    // Validate church access (ensure user has permission to access this church)
    const hasAccess = await validateChurchAccess(churchId, request);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Unauthorized access to church data" },
        { status: 403 }
      );
    }

    // Sanitize input data
    const sanitizedInput: RecognitionInput = {
      email: input.email?.toLowerCase().trim(),
      phone: input.phone?.replace(/\D/g, ''), // Remove non-digits
      firstName: input.firstName?.trim(),
      lastName: input.lastName?.trim(),
      address: input.address?.trim(),
      city: input.city?.trim(),
      state: input.state?.trim(),
      zipCode: input.zipCode?.replace(/\D/g, '').substring(0, 10), // Only digits, max 10 chars
      dateOfBirth: input.dateOfBirth ? new Date(input.dateOfBirth) : undefined
    };

    // Set default options
    const recognitionOptions = {
      maxMatches: Math.min(options.maxMatches || 1, 5), // Max 5 matches
      includeFamily: options.includeFamily !== false, // Default true
      respectPrivacy: options.respectPrivacy !== false // Default true
    };

    // Perform progressive recognition
    const result = await performProgressiveRecognition(
      churchId,
      sanitizedInput,
      recognitionOptions
    );

    // Add metadata for debugging (only in development)
    const response = {
      ...result,
      ...(process.env.NODE_ENV === 'development' && {
        debug: {
          inputProcessed: sanitizedInput,
          timestamp: new Date().toISOString(),
          rateLimitRemaining: rateLimitResult.remaining
        }
      })
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Progressive recognition error:", error);
    
    return NextResponse.json(
      { 
        error: "Internal server error during recognition",
        status: 'no_match',
        confidence: 0
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { 
      error: "Method not allowed. Use POST to perform recognition.",
      endpoints: {
        recognize: "POST /api/progressive-recognition/recognize"
      }
    },
    { status: 405 }
  );
}