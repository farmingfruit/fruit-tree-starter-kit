import { db } from "@/db/drizzle";
import { communicationPreferences, members, messageRecipients, messages } from "@/db/schema";
import { eq, and, gte, lte, count } from "drizzle-orm";

export interface ComplianceReport {
  totalMembers: number;
  emailOptIns: number;
  emailOptOuts: number;
  smsOptIns: number;
  smsOptOuts: number;
  unsubscribeReasons: Record<string, number>;
  bounceRate: number;
  spamComplaints: number;
  recentUnsubscribes: Array<{
    memberId: string;
    memberName: string;
    email: string;
    unsubscribeDate: Date;
    reason: string;
  }>;
}

export interface ConsentRecord {
  memberId: string;
  memberName: string;
  email: string;
  phone: string;
  emailConsentDate: Date | null;
  smsConsentDate: Date | null;
  emailOptIn: boolean;
  smsOptIn: boolean;
  ipAddress?: string;
  consentMethod?: string; // "web_form", "paper_form", "verbal", "imported"
  doubleOptIn?: boolean;
}

export class ComplianceManager {
  static async generateComplianceReport(churchId: string, startDate?: Date, endDate?: Date): Promise<ComplianceReport> {
    const dateFilter = startDate && endDate 
      ? and(
          gte(communicationPreferences.updatedAt, startDate),
          lte(communicationPreferences.updatedAt, endDate)
        )
      : undefined;

    // Get total members
    const totalMembersResult = await db
      .select({ count: count() })
      .from(members)
      .where(eq(members.churchId, churchId));

    // Get communication preferences
    const preferencesQuery = db
      .select({
        emailOptIn: communicationPreferences.emailOptIn,
        smsOptIn: communicationPreferences.smsOptIn,
        unsubscribeReason: communicationPreferences.unsubscribeReason,
        emailBounceCount: communicationPreferences.emailBounceCount,
        emailUnsubscribedAt: communicationPreferences.emailUnsubscribedAt,
        smsUnsubscribedAt: communicationPreferences.smsUnsubscribedAt,
        member: {
          id: members.id,
          firstName: members.firstName,
          lastName: members.lastName,
          email: members.email,
        }
      })
      .from(communicationPreferences)
      .innerJoin(members, eq(members.id, communicationPreferences.memberId))
      .where(eq(members.churchId, churchId));

    if (dateFilter) {
      preferencesQuery.where(dateFilter);
    }

    const preferences = await preferencesQuery;

    // Calculate metrics
    const emailOptIns = preferences.filter(p => p.emailOptIn).length;
    const emailOptOuts = preferences.filter(p => !p.emailOptIn).length;
    const smsOptIns = preferences.filter(p => p.smsOptIn).length;
    const smsOptOuts = preferences.filter(p => !p.smsOptIn).length;

    // Count unsubscribe reasons
    const unsubscribeReasons: Record<string, number> = {};
    preferences.forEach(p => {
      if (p.unsubscribeReason) {
        unsubscribeReasons[p.unsubscribeReason] = (unsubscribeReasons[p.unsubscribeReason] || 0) + 1;
      }
    });

    // Calculate bounce rate
    const totalBounces = preferences.reduce((sum, p) => sum + (p.emailBounceCount || 0), 0);
    const bounceRate = preferences.length > 0 ? (totalBounces / preferences.length) * 100 : 0;

    // Count spam complaints
    const spamComplaints = preferences.filter(p => p.unsubscribeReason === 'spam_complaint').length;

    // Get recent unsubscribes
    const recentUnsubscribes = preferences
      .filter(p => p.emailUnsubscribedAt || p.smsUnsubscribedAt)
      .map(p => ({
        memberId: p.member.id,
        memberName: `${p.member.firstName} ${p.member.lastName}`,
        email: p.member.email || '',
        unsubscribeDate: p.emailUnsubscribedAt || p.smsUnsubscribedAt || new Date(),
        reason: p.unsubscribeReason || 'unknown',
      }))
      .sort((a, b) => b.unsubscribeDate.getTime() - a.unsubscribeDate.getTime())
      .slice(0, 10);

    return {
      totalMembers: totalMembersResult[0].count,
      emailOptIns,
      emailOptOuts,
      smsOptIns,
      smsOptOuts,
      unsubscribeReasons,
      bounceRate,
      spamComplaints,
      recentUnsubscribes,
    };
  }

  static async getConsentRecords(churchId: string): Promise<ConsentRecord[]> {
    const records = await db
      .select({
        memberId: members.id,
        firstName: members.firstName,
        lastName: members.lastName,
        email: members.email,
        phone: members.mobilePhone,
        emailOptIn: communicationPreferences.emailOptIn,
        smsOptIn: communicationPreferences.smsOptIn,
        emailConsentDate: communicationPreferences.createdAt,
        smsConsentDate: communicationPreferences.createdAt,
      })
      .from(members)
      .leftJoin(communicationPreferences, eq(members.id, communicationPreferences.memberId))
      .where(eq(members.churchId, churchId));

    return records.map(record => ({
      memberId: record.memberId,
      memberName: `${record.firstName} ${record.lastName}`,
      email: record.email || '',
      phone: record.phone || '',
      emailConsentDate: record.emailConsentDate,
      smsConsentDate: record.smsConsentDate,
      emailOptIn: record.emailOptIn || false,
      smsOptIn: record.smsOptIn || false,
      consentMethod: 'imported', // Default for existing records
      doubleOptIn: false, // Default for existing records
    }));
  }

  static async recordConsent(
    memberId: string,
    consentType: 'email' | 'sms' | 'both',
    consentMethod: string = 'web_form',
    ipAddress?: string,
    doubleOptIn: boolean = false
  ): Promise<void> {
    const now = new Date();
    
    try {
      // Get existing preferences
      const existing = await db
        .select()
        .from(communicationPreferences)
        .where(eq(communicationPreferences.memberId, memberId))
        .limit(1);

      const updateData: any = {
        updatedAt: now,
      };

      if (consentType === 'email' || consentType === 'both') {
        updateData.emailOptIn = true;
      }
      
      if (consentType === 'sms' || consentType === 'both') {
        updateData.smsOptIn = true;
      }

      if (existing[0]) {
        // Update existing record
        await db
          .update(communicationPreferences)
          .set(updateData)
          .where(eq(communicationPreferences.memberId, memberId));
      } else {
        // Create new record
        await db.insert(communicationPreferences).values({
          id: `pref_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          memberId,
          emailOptIn: consentType === 'email' || consentType === 'both',
          smsOptIn: consentType === 'sms' || consentType === 'both',
          createdAt: now,
          updatedAt: now,
        });
      }

      // Log the consent event
      await this.logConsentEvent(memberId, consentType, consentMethod, ipAddress, doubleOptIn);

    } catch (error) {
      console.error('Error recording consent:', error);
      throw new Error('Failed to record consent');
    }
  }

  private static async logConsentEvent(
    memberId: string,
    consentType: string,
    method: string,
    ipAddress?: string,
    doubleOptIn?: boolean
  ): Promise<void> {
    // In a production system, you would log this to an audit table
    console.log('Consent event logged:', {
      memberId,
      consentType,
      method,
      ipAddress,
      doubleOptIn,
      timestamp: new Date().toISOString(),
    });
  }

  static validateMessageCompliance(
    messageType: 'email' | 'sms',
    content: string,
    recipients: any[],
    settings: any
  ): { isCompliant: boolean; warnings: string[]; errors: string[] } {
    const warnings: string[] = [];
    const errors: string[] = [];

    // Check for SMS compliance
    if (messageType === 'sms') {
      // TCPA compliance checks
      if (!content.toLowerCase().includes('stop') && !content.toLowerCase().includes('unsubscribe')) {
        if (content.length > 100) { // Only for longer messages
          warnings.push('Consider including unsubscribe instructions for longer SMS messages');
        }
      }

      // Check character limit
      if (content.length > 1600) { // 10 SMS segments
        warnings.push('Message is very long and may be expensive to send');
      }

      // Check for SMS opt-in compliance
      const smsOptedOutRecipients = recipients.filter(r => !r.smsOptIn);
      if (smsOptedOutRecipients.length > 0) {
        errors.push(`${smsOptedOutRecipients.length} recipients have not opted in to SMS communications`);
      }
    }

    // Check for email compliance
    if (messageType === 'email') {
      // CAN-SPAM compliance checks
      if (!content.toLowerCase().includes('unsubscribe')) {
        errors.push('Email must include unsubscribe link for CAN-SPAM compliance');
      }

      if (!settings.emailFromName || !settings.emailReplyTo) {
        errors.push('From name and reply-to address must be configured');
      }

      // Check for email opt-in compliance
      const emailOptedOutRecipients = recipients.filter(r => !r.emailOptIn);
      if (emailOptedOutRecipients.length > 0) {
        warnings.push(`${emailOptedOutRecipients.length} recipients have opted out of email communications`);
      }
    }

    // General checks
    if (recipients.length === 0) {
      errors.push('No valid recipients selected');
    }

    if (!content.trim()) {
      errors.push('Message content cannot be empty');
    }

    return {
      isCompliant: errors.length === 0,
      warnings,
      errors,
    };
  }

  static generateUnsubscribeLink(memberId: string, messageType: 'email' | 'sms'): string {
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://yourchurch.org';
    return `${baseUrl}/unsubscribe/${messageType}/${memberId}`;
  }

  static async handleBounce(
    memberId: string,
    bounceType: 'hard' | 'soft',
    reason: string
  ): Promise<void> {
    try {
      const existing = await db
        .select()
        .from(communicationPreferences)
        .where(eq(communicationPreferences.memberId, memberId))
        .limit(1);

      if (existing[0]) {
        const newBounceCount = (existing[0].emailBounceCount || 0) + 1;
        
        await db
          .update(communicationPreferences)
          .set({
            emailBounceCount: newBounceCount,
            emailLastBounce: new Date(),
            // Auto opt-out after 3 soft bounces or any hard bounce
            emailOptIn: bounceType === 'hard' || newBounceCount >= 3 ? false : existing[0].emailOptIn,
            updatedAt: new Date(),
          })
          .where(eq(communicationPreferences.memberId, memberId));
      }
    } catch (error) {
      console.error('Error handling bounce:', error);
    }
  }

  static async exportConsentRecords(churchId: string): Promise<string> {
    const records = await this.getConsentRecords(churchId);
    
    // Convert to CSV format
    const headers = [
      'Member ID',
      'Name',
      'Email',
      'Phone',
      'Email Opt-In',
      'SMS Opt-In',
      'Email Consent Date',
      'SMS Consent Date',
      'Consent Method'
    ];

    const csvContent = [
      headers.join(','),
      ...records.map(record => [
        record.memberId,
        `"${record.memberName}"`,
        record.email,
        record.phone,
        record.emailOptIn ? 'Yes' : 'No',
        record.smsOptIn ? 'Yes' : 'No',
        record.emailConsentDate?.toISOString() || '',
        record.smsConsentDate?.toISOString() || '',
        record.consentMethod || ''
      ].join(','))
    ].join('\n');

    return csvContent;
  }
}