/**
 * Forms-People Integration Service
 * 
 * This service provides seamless integration between the revolutionary 
 * church event registration system and the existing People database.
 * It handles progressive recognition, profile matching, and family 
 * relationship management for form submissions.
 */

import { db } from "@/db/drizzle";
import { members, families, churches } from "@/db/schema";
import { eq, and, or, like, desc, asc } from "drizzle-orm";
import { ProgressiveRecognitionEngine } from "./progressive-recognition";

export interface FormSubmissionData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: Date;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  formId: string;
  formType: 'contact' | 'registration';
  submissionData: Record<string, any>;
}

export interface MemberProfile {
  id: string;
  churchId: string;
  familyId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  mobilePhone?: string;
  dateOfBirth?: Date;
  membershipStatus: string;
  membershipRole: string;
  isHeadOfHousehold: boolean;
  isMinor: boolean;
  familyName?: string;
  familyMembers?: MemberProfile[];
  lastActivity?: Date;
  joinDate?: Date;
}

export interface RecognitionResult {
  confidence: number;
  matchedProfile?: MemberProfile;
  familyMembers?: MemberProfile[];
  action: 'auto_fill' | 'confirm_identity' | 'admin_review' | 'create_new';
  maskedData?: {
    email?: string;
    phone?: string;
  };
}

export class FormsPeopleIntegration {
  private recognitionEngine: ProgressiveRecognitionEngine;

  constructor() {
    this.recognitionEngine = new ProgressiveRecognitionEngine();
  }

  /**
   * Perform progressive recognition for form pre-filling
   */
  async performProgressiveRecognition(
    submissionData: Partial<FormSubmissionData>,
    churchId: string
  ): Promise<RecognitionResult> {
    // Use the existing recognition engine with church-specific filtering
    const recognition = await this.recognitionEngine.recognizeUser(
      submissionData,
      { churchId }
    );

    if (recognition.confidence >= 98) {
      // Auto-fill with high confidence
      const profile = await this.getMemberProfile(recognition.memberId!, churchId);
      const familyMembers = await this.getFamilyMembers(recognition.memberId!, churchId);

      return {
        confidence: recognition.confidence,
        matchedProfile: profile,
        familyMembers,
        action: 'auto_fill',
        maskedData: {
          email: this.maskEmail(profile?.email),
          phone: this.maskPhone(profile?.mobilePhone),
        }
      };
    } else if (recognition.confidence >= 85) {
      // Confirm identity
      const profile = await this.getMemberProfile(recognition.memberId!, churchId);
      
      return {
        confidence: recognition.confidence,
        matchedProfile: profile,
        action: 'confirm_identity',
        maskedData: {
          email: this.maskEmail(profile?.email),
          phone: this.maskPhone(profile?.mobilePhone),
        }
      };
    } else if (recognition.confidence >= 70) {
      // Admin review queue
      return {
        confidence: recognition.confidence,
        action: 'admin_review'
      };
    } else {
      // Create new profile
      return {
        confidence: recognition.confidence,
        action: 'create_new'
      };
    }
  }

  /**
   * Get member profile with family information
   */
  async getMemberProfile(memberId: string, churchId: string): Promise<MemberProfile | null> {
    const results = await db
      .select({
        member: members,
        family: families,
      })
      .from(members)
      .leftJoin(families, eq(members.familyId, families.id))
      .where(and(
        eq(members.id, memberId),
        eq(members.churchId, churchId)
      ));

    if (results.length === 0) return null;

    const result = results[0];
    return {
      id: result.member.id,
      churchId: result.member.churchId,
      familyId: result.member.familyId,
      firstName: result.member.firstName,
      lastName: result.member.lastName,
      email: result.member.email,
      mobilePhone: result.member.mobilePhone,
      dateOfBirth: result.member.dateOfBirth,
      membershipStatus: result.member.membershipStatus,
      membershipRole: result.member.membershipRole,
      isHeadOfHousehold: result.member.isHeadOfHousehold,
      isMinor: result.member.isMinor,
      familyName: result.family?.familyName,
      joinDate: result.member.joinDate,
    };
  }

  /**
   * Get family members for family registration
   */
  async getFamilyMembers(memberId: string, churchId: string): Promise<MemberProfile[]> {
    // First get the family ID of the member
    const member = await db
      .select({ familyId: members.familyId })
      .from(members)
      .where(and(
        eq(members.id, memberId),
        eq(members.churchId, churchId)
      ));

    if (member.length === 0 || !member[0].familyId) return [];

    // Get all family members
    const familyMembers = await db
      .select({
        member: members,
        family: families,
      })
      .from(members)
      .leftJoin(families, eq(members.familyId, families.id))
      .where(and(
        eq(members.familyId, member[0].familyId),
        eq(members.churchId, churchId),
        eq(members.membershipStatus, 'Active')
      ))
      .orderBy(desc(members.isHeadOfHousehold), asc(members.dateOfBirth));

    return familyMembers.map(result => ({
      id: result.member.id,
      churchId: result.member.churchId,
      familyId: result.member.familyId,
      firstName: result.member.firstName,
      lastName: result.member.lastName,
      email: result.member.email,
      mobilePhone: result.member.mobilePhone,
      dateOfBirth: result.member.dateOfBirth,
      membershipStatus: result.member.membershipStatus,
      membershipRole: result.member.membershipRole,
      isHeadOfHousehold: result.member.isHeadOfHousehold,
      isMinor: result.member.isMinor,
      familyName: result.family?.familyName,
      joinDate: result.member.joinDate,
    }));
  }

  /**
   * Create or update member profile from form submission
   */
  async createOrUpdateMember(
    submissionData: FormSubmissionData,
    churchId: string,
    existingMemberId?: string
  ): Promise<string> {
    const memberData = {
      churchId,
      firstName: submissionData.firstName,
      lastName: submissionData.lastName,
      email: submissionData.email,
      mobilePhone: submissionData.phone,
      dateOfBirth: submissionData.dateOfBirth,
      membershipStatus: existingMemberId ? undefined : 'Visitor', // Don't change existing status
      membershipRole: existingMemberId ? undefined : 'Visitor',
      updatedAt: new Date(),
    };

    if (existingMemberId) {
      // Update existing member
      await db
        .update(members)
        .set(memberData)
        .where(and(
          eq(members.id, existingMemberId),
          eq(members.churchId, churchId)
        ));
      
      return existingMemberId;
    } else {
      // Create new member
      const newMember = await db
        .insert(members)
        .values({
          id: `member_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
          ...memberData,
          createdAt: new Date(),
        })
        .returning({ id: members.id });

      return newMember[0].id;
    }
  }

  /**
   * Search for potential member matches
   */
  async searchPotentialMatches(
    searchData: Partial<FormSubmissionData>,
    churchId: string,
    limit: number = 10
  ): Promise<MemberProfile[]> {
    const conditions = [eq(members.churchId, churchId)];

    // Add search conditions
    if (searchData.email) {
      conditions.push(like(members.email, `%${searchData.email}%`));
    }
    if (searchData.phone) {
      conditions.push(like(members.mobilePhone, `%${searchData.phone}%`));
    }
    if (searchData.firstName && searchData.lastName) {
      conditions.push(
        and(
          like(members.firstName, `%${searchData.firstName}%`),
          like(members.lastName, `%${searchData.lastName}%`)
        )
      );
    }

    const results = await db
      .select({
        member: members,
        family: families,
      })
      .from(members)
      .leftJoin(families, eq(members.familyId, families.id))
      .where(and(...conditions))
      .limit(limit)
      .orderBy(desc(members.updatedAt));

    return results.map(result => ({
      id: result.member.id,
      churchId: result.member.churchId,
      familyId: result.member.familyId,
      firstName: result.member.firstName,
      lastName: result.member.lastName,
      email: result.member.email,
      mobilePhone: result.member.mobilePhone,
      dateOfBirth: result.member.dateOfBirth,
      membershipStatus: result.member.membershipStatus,
      membershipRole: result.member.membershipRole,
      isHeadOfHousehold: result.member.isHeadOfHousehold,
      isMinor: result.member.isMinor,
      familyName: result.family?.familyName,
      joinDate: result.member.joinDate,
    }));
  }

  /**
   * Merge duplicate member profiles
   */
  async mergeProfiles(
    primaryMemberId: string,
    duplicateMemberId: string,
    churchId: string
  ): Promise<void> {
    // Get both profiles
    const [primary, duplicate] = await Promise.all([
      this.getMemberProfile(primaryMemberId, churchId),
      this.getMemberProfile(duplicateMemberId, churchId),
    ]);

    if (!primary || !duplicate) {
      throw new Error('One or both profiles not found');
    }

    // Merge data (prefer primary, but fill in missing fields from duplicate)
    const mergedData = {
      email: primary.email || duplicate.email,
      mobilePhone: primary.mobilePhone || duplicate.mobilePhone,
      dateOfBirth: primary.dateOfBirth || duplicate.dateOfBirth,
      // Add other fields as needed
      updatedAt: new Date(),
    };

    // Update primary profile with merged data
    await db
      .update(members)
      .set(mergedData)
      .where(and(
        eq(members.id, primaryMemberId),
        eq(members.churchId, churchId)
      ));

    // Soft delete duplicate profile (keep for audit trail)
    await db
      .update(members)
      .set({
        membershipStatus: 'Merged',
        inactiveDate: new Date(),
        inactiveReason: `Merged into profile ${primaryMemberId}`,
        updatedAt: new Date(),
      })
      .where(and(
        eq(members.id, duplicateMemberId),
        eq(members.churchId, churchId)
      ));
  }

  /**
   * Get church member statistics for analytics
   */
  async getChurchStats(churchId: string) {
    const results = await db
      .select({
        status: members.membershipStatus,
        count: members.id,
      })
      .from(members)
      .where(eq(members.churchId, churchId))
      .groupBy(members.membershipStatus);

    const stats = {
      total: 0,
      active: 0,
      visitors: 0,
      inactive: 0,
    };

    results.forEach(result => {
      stats.total += 1;
      switch (result.status) {
        case 'Active':
          stats.active += 1;
          break;
        case 'Visitor':
          stats.visitors += 1;
          break;
        case 'Inactive':
          stats.inactive += 1;
          break;
      }
    });

    return stats;
  }

  /**
   * Privacy-preserving data masking
   */
  private maskEmail(email?: string | null): string | undefined {
    if (!email) return undefined;
    
    const [local, domain] = email.split('@');
    if (local.length <= 2) return `${local[0]}***@${domain}`;
    
    return `${local.substring(0, 2)}${'*'.repeat(local.length - 2)}@${domain}`;
  }

  private maskPhone(phone?: string | null): string | undefined {
    if (!phone) return undefined;
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.substring(0, 3)}) ***-${digits.substring(6)}`;
    } else if (digits.length === 11) {
      return `+${digits[0]} (${digits.substring(1, 4)}) ***-${digits.substring(7)}`;
    }
    
    return '***-***-' + digits.slice(-4);
  }

  /**
   * Get recent form activity for member
   */
  async getMemberFormActivity(memberId: string, churchId: string, limit: number = 5) {
    // This would connect to form submissions table when implemented
    // For now, return mock data structure
    return {
      recentForms: [],
      totalSubmissions: 0,
      lastSubmission: null,
    };
  }

  /**
   * Convert visitor to member
   */
  async convertVisitorToMember(memberId: string, churchId: string): Promise<void> {
    await db
      .update(members)
      .set({
        membershipStatus: 'Active',
        membershipRole: 'Member',
        joinDate: new Date(),
        updatedAt: new Date(),
      })
      .where(and(
        eq(members.id, memberId),
        eq(members.churchId, churchId),
        eq(members.membershipStatus, 'Visitor')
      ));
  }
}

// Export singleton instance
export const formsPeopleIntegration = new FormsPeopleIntegration();