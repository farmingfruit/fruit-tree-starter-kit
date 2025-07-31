/**
 * Progressive Recognition System - Core Engine
 * 
 * This is the heart of the "magical" recognition system that identifies
 * returning visitors and creates personalized registration experiences.
 * 
 * Key Features:
 * - Multi-field matching with fuzzy logic
 * - Confidence scoring (0-100)
 * - Privacy-first data masking
 * - Family relationship detection
 * - Anti-abuse protection
 */

import { db } from "@/db/drizzle";
import { personProfiles, members, families, formSubmissions, profileMatchSuggestions, adminReviewQueue } from "@/db/schema";
import { eq, and, or, like, sql, desc, asc } from "drizzle-orm";
import crypto from "crypto";

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface RecognitionInput {
  email?: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  dateOfBirth?: Date;
}

export interface RecognitionMatch {
  profileId: string;
  memberId?: string;
  familyId?: string;
  confidence: number;
  matchReasons: string[];
  profile: {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    dateOfBirth?: Date;
  };
  familyMembers?: FamilyMember[];
}

export interface FamilyMember {
  profileId: string;
  memberId?: string;
  firstName: string;
  lastName: string;
  relationship?: string;
  dateOfBirth?: Date;
  email?: string;
  phone?: string;
}

export interface RecognitionResult {
  status: 'auto_linked' | 'suggest_match' | 'no_match' | 'review_required';
  confidence: number;
  match?: RecognitionMatch;
  displayMessage?: string;
  maskedData?: MaskedProfile;
  requiresAdminReview?: boolean;
  reviewQueueId?: string;
}

export interface MaskedProfile {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

// ============================================================================
// Confidence Scoring Configuration
// ============================================================================

const CONFIDENCE_FACTORS = {
  // Identity matches
  emailExact: 50,
  emailDomain: 30,
  phoneExact: 45,
  phoneNormalized: 35,
  
  // Name matching
  firstNameExact: 20,
  lastNameExact: 20,
  firstNameSimilar: 10, // > 0.8 similarity
  lastNameSimilar: 10,
  
  // Context clues
  sameAddress: 25,
  sameZipCode: 15,
  sameCity: 10,
  sameFamily: 30,
  
  // Behavioral patterns
  previousSubmission: 20,
  recentActivity: 10,
  consistentDetails: 15,
  
  // Negative factors
  conflictingInfo: -30,
  differentChurch: -100,
  ageInconsistency: -20
} as const;

const CONFIDENCE_THRESHOLDS = {
  autoLink: 98,        // Automatically link and pre-fill
  suggestMatch: 85,    // Show confirmation prompt
  adminReview: 70,     // Queue for admin review
  noMatch: 0           // Treat as new person
} as const;

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Normalize phone number to standard format for comparison
 */
function normalizePhone(phone?: string): string | null {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle US phone numbers
  if (digits.length === 10) {
    return `+1${digits}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }
  
  return digits.length >= 10 ? `+${digits}` : null;
}

/**
 * Calculate string similarity using Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  if (!str1 || !str2) return 0;
  
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1;
  
  const len1 = s1.length;
  const len2 = s2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,     // deletion
        matrix[i][j - 1] + 1,     // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  const distance = matrix[len1][len2];
  return (maxLen - distance) / maxLen;
}

/**
 * Generate email variations for fuzzy matching
 */
function generateEmailVariations(email: string): string[] {
  if (!email) return [];
  
  const [local, domain] = email.toLowerCase().split('@');
  if (!local || !domain) return [email];
  
  const variations: string[] = [email.toLowerCase()];
  
  // Handle common Gmail variations
  if (domain === 'gmail.com') {
    variations.push(`${local}@googlemail.com`);
    
    // Remove dots (Gmail ignores dots in local part)
    const noDots = local.replace(/\./g, '');
    if (noDots !== local) {
      variations.push(`${noDots}@gmail.com`);
      variations.push(`${noDots}@googlemail.com`);
    }
    
    // Handle plus addressing (ignore everything after +)
    const plusIndex = local.indexOf('+');
    if (plusIndex > 0) {
      const baseName = local.substring(0, plusIndex);
      variations.push(`${baseName}@gmail.com`);
      variations.push(`${baseName}@googlemail.com`);
    }
  }
  
  return [...new Set(variations)];
}

/**
 * Hash sensitive data for privacy protection
 */
function hashData(data: string): string {
  return crypto.createHash('sha256').update(data.toLowerCase().trim()).digest('hex');
}

/**
 * Mask email for privacy display
 */
export function maskEmail(email: string): string {
  if (!email) return '';
  
  const [local, domain] = email.split('@');
  if (!local || !domain) return email;
  
  const maskedLocal = local.length > 3 
    ? local[0] + '*'.repeat(Math.min(local.length - 2, 4)) + local[local.length - 1]
    : '*'.repeat(local.length);
    
  return `${maskedLocal}@${domain}`;
}

/**
 * Mask phone number for privacy display
 */
export function maskPhone(phone: string): string {
  if (!phone) return '';
  
  const normalized = normalizePhone(phone);
  if (!normalized) return phone;
  
  // Format: +1 (555) 123-4567 → (555) ***-4567
  const digits = normalized.replace(/^\+1/, '');
  if (digits.length === 10) {
    return `(${digits.substring(0, 3)}) ***-${digits.substring(6)}`;
  }
  
  return phone;
}

// ============================================================================
// Core Recognition Engine
// ============================================================================

/**
 * Main progressive recognition function
 * This is the entry point that orchestrates the entire recognition process
 */
export async function performProgressiveRecognition(
  churchId: string,
  input: RecognitionInput,
  options: {
    maxMatches?: number;
    includeFamily?: boolean;
    respectPrivacy?: boolean;
  } = {}
): Promise<RecognitionResult> {
  const { maxMatches = 1, includeFamily = true, respectPrivacy = true } = options;
  
  try {
    // Step 1: Find potential matches
    const candidates = await findMatchingProfiles(churchId, input, maxMatches * 3);
    
    if (candidates.length === 0) {
      return {
        status: 'no_match',
        confidence: 0
      };
    }
    
    // Step 2: Score and rank candidates
    const scoredMatches = await Promise.all(
      candidates.map(candidate => scoreMatch(candidate, input, churchId))
    );
    
    // Sort by confidence score
    scoredMatches.sort((a, b) => b.confidence - a.confidence);
    
    const bestMatch = scoredMatches[0];
    
    // Step 3: Add family members if requested and confidence is high enough
    if (includeFamily && bestMatch.confidence >= CONFIDENCE_THRESHOLDS.suggestMatch) {
      bestMatch.familyMembers = await findFamilyMembers(bestMatch.profileId, churchId);
    }
    
    // Step 4: Determine recognition action based on confidence
    const result = await determineRecognitionAction(bestMatch, input, churchId, respectPrivacy);
    
    return result;
    
  } catch (error) {
    console.error('Progressive recognition error:', error);
    return {
      status: 'no_match',
      confidence: 0
    };
  }
}

/**
 * Find matching profiles from the database
 */
async function findMatchingProfiles(
  churchId: string,
  input: RecognitionInput,
  limit: number = 10
): Promise<any[]> {
  const candidates: any[] = [];
  
  // Exact email match (highest priority)
  if (input.email) {
    const emailMatches = await db
      .select({
        profile: personProfiles,
        member: members,
        family: families
      })
      .from(personProfiles)
      .leftJoin(members, eq(personProfiles.memberId, members.id))
      .leftJoin(families, eq(personProfiles.familyId, families.id))
      .where(
        and(
          eq(personProfiles.churchId, churchId),
          eq(personProfiles.email, input.email.toLowerCase().trim()),
          or(
            eq(personProfiles.profileStatus, 'verified'),
            eq(personProfiles.profileStatus, 'unverified')
          )
        )
      )
      .limit(3);
    
    candidates.push(...emailMatches);
  }
  
  // Exact phone match
  if (input.phone) {
    const normalizedPhone = normalizePhone(input.phone);
    if (normalizedPhone) {
      const phoneMatches = await db
        .select({
          profile: personProfiles,
          member: members,
          family: families
        })
        .from(personProfiles)
        .leftJoin(members, eq(personProfiles.memberId, members.id))
        .leftJoin(families, eq(personProfiles.familyId, families.id))
        .where(
          and(
            eq(personProfiles.churchId, churchId),
            eq(personProfiles.phone, normalizedPhone),
            or(
              eq(personProfiles.profileStatus, 'verified'),
              eq(personProfiles.profileStatus, 'unverified')
            )
          )
        )
        .limit(3);
      
      candidates.push(...phoneMatches);
    }
  }
  
  // Fuzzy name + context matching (if we have names and don't have many exact matches)
  if (input.firstName && input.lastName && candidates.length < 3) {
    const nameMatches = await db
      .select({
        profile: personProfiles,
        member: members,
        family: families
      })
      .from(personProfiles)
      .leftJoin(members, eq(personProfiles.memberId, members.id))
      .leftJoin(families, eq(personProfiles.familyId, families.id))
      .where(
        and(
          eq(personProfiles.churchId, churchId),
          or(
            like(personProfiles.firstName, `%${input.firstName}%`),
            like(personProfiles.lastName, `%${input.lastName}%`)
          ),
          or(
            eq(personProfiles.profileStatus, 'verified'),
            eq(personProfiles.profileStatus, 'unverified')
          )
        )
      )
      .limit(5);
    
    candidates.push(...nameMatches);
  }
  
  // Remove duplicates based on profile ID
  const uniqueCandidates = candidates.filter((candidate, index, self) => 
    index === self.findIndex(c => c.profile.id === candidate.profile.id)
  );
  
  return uniqueCandidates.slice(0, limit);
}

/**
 * Score a potential match and calculate confidence
 */
async function scoreMatch(
  candidate: any,
  input: RecognitionInput,
  churchId: string
): Promise<RecognitionMatch> {
  const profile = candidate.profile;
  const member = candidate.member;
  const family = candidate.family;
  
  let score = 0;
  const matchReasons: string[] = [];
  
  // Email matching
  if (input.email && profile.email) {
    if (input.email.toLowerCase() === profile.email.toLowerCase()) {
      score += CONFIDENCE_FACTORS.emailExact;
      matchReasons.push('exact_email_match');
    } else {
      const emailVariations = generateEmailVariations(input.email);
      if (emailVariations.includes(profile.email.toLowerCase())) {
        score += CONFIDENCE_FACTORS.emailDomain;
        matchReasons.push('email_variation_match');
      }
    }
  }
  
  // Phone matching
  if (input.phone && profile.phone) {
    const inputPhone = normalizePhone(input.phone);
    const profilePhone = normalizePhone(profile.phone);
    
    if (inputPhone && profilePhone && inputPhone === profilePhone) {
      score += CONFIDENCE_FACTORS.phoneExact;
      matchReasons.push('exact_phone_match');
    }
  }
  
  // Name matching
  if (input.firstName && profile.firstName) {
    const similarity = calculateSimilarity(input.firstName, profile.firstName);
    if (similarity === 1) {
      score += CONFIDENCE_FACTORS.firstNameExact;
      matchReasons.push('exact_first_name');
    } else if (similarity > 0.8) {
      score += CONFIDENCE_FACTORS.firstNameSimilar;
      matchReasons.push('similar_first_name');
    }
  }
  
  if (input.lastName && profile.lastName) {
    const similarity = calculateSimilarity(input.lastName, profile.lastName);
    if (similarity === 1) {
      score += CONFIDENCE_FACTORS.lastNameExact;
      matchReasons.push('exact_last_name');
    } else if (similarity > 0.8) {
      score += CONFIDENCE_FACTORS.lastNameSimilar;
      matchReasons.push('similar_last_name');
    }
  }
  
  // Address matching
  if (input.address && profile.address) {
    if (input.address.toLowerCase().trim() === profile.address.toLowerCase().trim()) {
      score += CONFIDENCE_FACTORS.sameAddress;
      matchReasons.push('same_address');
    }
  }
  
  if (input.zipCode && profile.zipCode) {
    if (input.zipCode === profile.zipCode) {
      score += CONFIDENCE_FACTORS.sameZipCode;
      matchReasons.push('same_zip_code');
    }
  }
  
  if (input.city && profile.city) {
    if (input.city.toLowerCase().trim() === profile.city.toLowerCase().trim()) {
      score += CONFIDENCE_FACTORS.sameCity;
      matchReasons.push('same_city');
    }
  }
  
  // Family relationship bonus
  if (family) {
    score += CONFIDENCE_FACTORS.sameFamily;
    matchReasons.push('family_member');
  }
  
  // Check for previous submissions (behavioral pattern)
  const previousSubmissions = await db
    .select()
    .from(formSubmissions)
    .where(
      and(
        eq(formSubmissions.churchId, churchId),
        eq(formSubmissions.personProfileId, profile.id)
      )
    )
    .limit(1);
  
  if (previousSubmissions.length > 0) {
    score += CONFIDENCE_FACTORS.previousSubmission;
    matchReasons.push('previous_submission');
  }
  
  // Apply penalties for conflicting information
  if (input.email && profile.email && input.email.toLowerCase() !== profile.email.toLowerCase()) {
    // Only apply penalty if names match but emails don't
    if (input.firstName && input.lastName && 
        calculateSimilarity(input.firstName, profile.firstName || '') > 0.8 &&
        calculateSimilarity(input.lastName, profile.lastName || '') > 0.8) {
      score += CONFIDENCE_FACTORS.conflictingInfo;
      matchReasons.push('conflicting_email');
    }
  }
  
  // Normalize confidence to 0-100 scale
  const confidence = Math.min(100, Math.max(0, score));
  
  return {
    profileId: profile.id,
    memberId: member?.id,
    familyId: family?.id,
    confidence,
    matchReasons,
    profile: {
      firstName: profile.firstName,
      lastName: profile.lastName,
      email: profile.email,
      phone: profile.phone,
      address: profile.address,
      city: profile.city,
      state: profile.state,
      zipCode: profile.zipCode,
      dateOfBirth: profile.dateOfBirth
    }
  };
}

/**
 * Find family members for a given profile
 */
async function findFamilyMembers(
  profileId: string,
  churchId: string
): Promise<FamilyMember[]> {
  // First, get the family ID of the profile
  const profileFamily = await db
    .select({ familyId: personProfiles.familyId })
    .from(personProfiles)
    .where(eq(personProfiles.id, profileId))
    .limit(1);
  
  if (!profileFamily[0]?.familyId) {
    return [];
  }
  
  // Get all family members
  const familyMembers = await db
    .select({
      profile: personProfiles,
      member: members
    })
    .from(personProfiles)
    .leftJoin(members, eq(personProfiles.memberId, members.id))
    .where(
      and(
        eq(personProfiles.churchId, churchId),
        eq(personProfiles.familyId, profileFamily[0].familyId),
        sql`${personProfiles.id} != ${profileId}` // Exclude the original profile
      )
    )
    .limit(10);
  
  return familyMembers.map(fm => ({
    profileId: fm.profile.id,
    memberId: fm.member?.id,
    firstName: fm.profile.firstName || '',
    lastName: fm.profile.lastName || '',
    relationship: fm.member?.maritalStatus === 'Married' ? 'spouse' : 'family_member',
    dateOfBirth: fm.profile.dateOfBirth,
    email: fm.profile.email,
    phone: fm.profile.phone
  }));
}

/**
 * Determine what action to take based on confidence score
 */
async function determineRecognitionAction(
  match: RecognitionMatch,
  input: RecognitionInput,
  churchId: string,
  respectPrivacy: boolean
): Promise<RecognitionResult> {
  const { confidence } = match;
  
  // High confidence - Auto-link and pre-fill
  if (confidence >= CONFIDENCE_THRESHOLDS.autoLink) {
    return {
      status: 'auto_linked',
      confidence,
      match,
      displayMessage: `Welcome back, ${match.profile.firstName || 'friend'}! We've pre-filled your information.`,
      maskedData: respectPrivacy ? {
        firstName: match.profile.firstName,
        lastName: match.profile.lastName,
        email: match.profile.email ? maskEmail(match.profile.email) : undefined,
        phone: match.profile.phone ? maskPhone(match.profile.phone) : undefined,
        address: match.profile.address
      } : match.profile
    };
  }
  
  // Medium confidence - Suggest match with confirmation
  if (confidence >= CONFIDENCE_THRESHOLDS.suggestMatch) {
    const maskedEmail = match.profile.email ? maskEmail(match.profile.email) : '';
    const displayName = match.profile.firstName && match.profile.lastName 
      ? `${match.profile.firstName} ${match.profile.lastName}`
      : 'someone in our system';
    
    return {
      status: 'suggest_match',
      confidence,
      match,
      displayMessage: `It looks like you might have registered with us before as ${displayName} (${maskedEmail}). Is this you?`,
      maskedData: respectPrivacy ? {
        firstName: match.profile.firstName,
        lastName: match.profile.lastName,
        email: maskedEmail,
        phone: match.profile.phone ? maskPhone(match.profile.phone) : undefined,
        address: match.profile.address
      } : match.profile
    };
  }
  
  // Low confidence - Queue for admin review
  if (confidence >= CONFIDENCE_THRESHOLDS.adminReview) {
    const reviewQueueId = await queueForAdminReview(match, input, churchId);
    
    return {
      status: 'no_match',
      confidence: 0, // Don't show confidence to user
      requiresAdminReview: true,
      reviewQueueId
    };
  }
  
  // Very low confidence - No match
  return {
    status: 'no_match',
    confidence: 0
  };
}

/**
 * Queue a potential match for admin review
 */
async function queueForAdminReview(
  match: RecognitionMatch,
  input: RecognitionInput,
  churchId: string
): Promise<string> {
  // Create a profile match suggestion
  const suggestionId = crypto.randomUUID();
  
  await db.insert(profileMatchSuggestions).values({
    id: suggestionId,
    churchId,
    sourceProfileId: match.profileId,
    targetMemberId: match.memberId,
    matchType: 'profile_merge',
    confidenceScore: match.confidence,
    matchReasons: JSON.stringify(match.matchReasons),
    suggestedAction: 'review_required',
    reviewStatus: 'pending'
  });
  
  // Add to admin review queue
  const queueId = crypto.randomUUID();
  
  await db.insert(adminReviewQueue).values({
    id: queueId,
    churchId,
    itemType: 'profile_match',
    itemId: suggestionId,
    priority: match.confidence > 90 ? 'high' : 'medium',
    title: `Potential duplicate: ${match.profile.firstName} ${match.profile.lastName}`,
    description: `Found potential match with ${match.confidence}% confidence`,
    reviewData: JSON.stringify({
      match,
      input,
      reasons: match.matchReasons
    })
  });
  
  return queueId;
}