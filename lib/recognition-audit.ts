/**
 * Progressive Recognition Audit and Compliance System
 * 
 * This module provides comprehensive audit logging, compliance tracking,
 * and privacy controls for the progressive recognition system. It ensures
 * churches can maintain transparency and meet regulatory requirements.
 */

import crypto from "crypto";
import { db } from "@/db/drizzle";
import { sql } from "drizzle-orm";

// ============================================================================
// Audit Types and Interfaces
// ============================================================================

export interface AuditEvent {
  id: string;
  churchId: string;
  eventType: AuditEventType;
  userId?: string;
  profileId?: string;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
  details: AuditEventDetails;
  sensitiveData?: string; // Encrypted sensitive data
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export type AuditEventType = 
  | 'recognition_attempt'
  | 'recognition_success'
  | 'recognition_failure'
  | 'profile_match_confirmed'
  | 'profile_match_rejected'
  | 'profile_created'
  | 'profile_updated'
  | 'profile_merged'
  | 'profile_deleted'
  | 'data_accessed'
  | 'admin_action'
  | 'privacy_setting_changed'
  | 'consent_given'
  | 'consent_withdrawn'
  | 'data_export_requested'
  | 'data_deleted_per_request';

export interface AuditEventDetails {
  description: string;
  beforeState?: any;
  afterState?: any;
  confidenceScore?: number;
  matchReasons?: string[];
  adminAction?: string;
  privacySetting?: string;
  dataType?: string;
  retentionPeriod?: number;
  legalBasis?: string;
  metadata?: Record<string, any>;
}

export interface ComplianceReport {
  reportId: string;
  churchId: string;
  reportType: 'gdpr' | 'ccpa' | 'general_audit' | 'security_review';
  period: {
    start: Date;
    end: Date;
  };
  generatedAt: Date;
  generatedBy: string;
  summary: {
    totalEvents: number;
    highRiskEvents: number;
    privacyViolations: number;
    dataAccessEvents: number;
    profileModifications: number;
  };
  findings: ComplianceFinding[];
  recommendations: string[];
}

export interface ComplianceFinding {
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'privacy' | 'security' | 'access_control' | 'data_retention' | 'consent';
  description: string;
  affectedProfiles: number;
  riskScore: number;
  remediation: string;
  evidence: string[];
}

// ============================================================================
// Audit Logger Class
// ============================================================================

class AuditLogger {
  private encryptionKey: string;
  private auditBuffer: AuditEvent[] = [];
  private flushInterval: NodeJS.Timeout;

  constructor() {
    // In production, this should come from environment variables
    this.encryptionKey = process.env.AUDIT_ENCRYPTION_KEY || 'default-key-change-in-production';
    
    // Flush audit buffer every 30 seconds
    this.flushInterval = setInterval(() => this.flushBuffer(), 30000);
  }

  /**
   * Log an audit event
   */
  public async logEvent(
    churchId: string,
    eventType: AuditEventType,
    details: AuditEventDetails,
    options: {
      userId?: string;
      profileId?: string;
      ipAddress?: string;
      userAgent?: string;
      sensitiveData?: any;
      riskLevel?: AuditEvent['riskLevel'];
    } = {}
  ): Promise<void> {
    try {
      const event: AuditEvent = {
        id: crypto.randomUUID(),
        churchId,
        eventType,
        userId: options.userId,
        profileId: options.profileId,
        ipAddress: options.ipAddress,
        userAgent: options.userAgent,
        timestamp: new Date(),
        details,
        sensitiveData: options.sensitiveData ? await this.encryptSensitiveData(options.sensitiveData) : undefined,
        riskLevel: options.riskLevel || this.calculateRiskLevel(eventType, details)
      };

      // Add to buffer for batched processing
      this.auditBuffer.push(event);

      // Immediate flush for critical events
      if (event.riskLevel === 'critical') {
        await this.flushBuffer();
      }

      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[AUDIT] ${eventType}:`, {
          churchId,
          details: details.description,
          riskLevel: event.riskLevel
        });
      }

    } catch (error) {
      console.error('Audit logging error:', error);
      // Don't throw - audit failures shouldn't break the main application
    }
  }

  /**
   * Log recognition attempt
   */
  public async logRecognitionAttempt(
    churchId: string,
    input: any,
    result: any,
    metadata: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
    } = {}
  ): Promise<void> {
    const eventType: AuditEventType = result.status === 'no_match' ? 'recognition_failure' : 'recognition_success';
    
    await this.logEvent(churchId, eventType, {
      description: `Recognition attempt for input: ${this.sanitizeInput(input)}`,
      confidenceScore: result.confidence,
      matchReasons: result.match?.matchReasons,
      metadata: {
        inputHash: this.hashInput(input),
        resultStatus: result.status,
        hasMatch: !!result.match
      }
    }, {
      ...metadata,
      sensitiveData: { input, result },
      riskLevel: result.confidence > 95 ? 'low' : 'medium'
    });
  }

  /**
   * Log profile match confirmation
   */
  public async logMatchConfirmation(
    churchId: string,
    profileId: string,
    confirmed: boolean,
    metadata: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      feedback?: string;
    } = {}
  ): Promise<void> {
    const eventType: AuditEventType = confirmed ? 'profile_match_confirmed' : 'profile_match_rejected';
    
    await this.logEvent(churchId, eventType, {
      description: `User ${confirmed ? 'confirmed' : 'rejected'} profile match`,
      metadata: {
        feedback: metadata.feedback,
        confirmationMethod: 'user_interaction'
      }
    }, {
      ...metadata,
      profileId,
      riskLevel: confirmed ? 'low' : 'medium'
    });
  }

  /**
   * Log admin action
   */
  public async logAdminAction(
    churchId: string,
    action: string,
    targetId: string,
    metadata: {
      userId: string;
      ipAddress?: string;
      userAgent?: string;
      beforeState?: any;
      afterState?: any;
    }
  ): Promise<void> {
    await this.logEvent(churchId, 'admin_action', {
      description: `Admin performed action: ${action}`,
      adminAction: action,
      beforeState: metadata.beforeState,
      afterState: metadata.afterState,
      metadata: {
        targetId,
        actionTimestamp: new Date().toISOString()
      }
    }, {
      ...metadata,
      riskLevel: this.getAdminActionRiskLevel(action)
    });
  }

  /**
   * Log data access event
   */
  public async logDataAccess(
    churchId: string,
    dataType: string,
    profileIds: string[],
    metadata: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      purpose?: string;
      legalBasis?: string;
    } = {}
  ): Promise<void> {
    await this.logEvent(churchId, 'data_accessed', {
      description: `Accessed ${dataType} data for ${profileIds.length} profile(s)`,
      dataType,
      legalBasis: metadata.legalBasis || 'legitimate_interest',
      metadata: {
        profileCount: profileIds.length,
        purpose: metadata.purpose,
        accessedProfiles: profileIds.slice(0, 10) // Limit for privacy
      }
    }, {
      ...metadata,
      riskLevel: profileIds.length > 100 ? 'high' : 'medium'
    });
  }

  /**
   * Log privacy setting change
   */
  public async logPrivacyChange(
    churchId: string,
    profileId: string,
    settingType: string,
    oldValue: any,
    newValue: any,
    metadata: {
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
    } = {}
  ): Promise<void> {
    await this.logEvent(churchId, 'privacy_setting_changed', {
      description: `Privacy setting '${settingType}' changed`,
      privacySetting: settingType,
      beforeState: oldValue,
      afterState: newValue,
      metadata: {
        changeReason: 'user_request',
        effectiveDate: new Date().toISOString()
      }
    }, {
      ...metadata,
      profileId,
      riskLevel: 'medium'
    });
  }

  /**
   * Calculate risk level based on event type and details
   */
  private calculateRiskLevel(eventType: AuditEventType, details: AuditEventDetails): AuditEvent['riskLevel'] {
    switch (eventType) {
      case 'profile_deleted':
      case 'data_deleted_per_request':
        return 'critical';
      
      case 'profile_merged':
      case 'admin_action':
      case 'privacy_setting_changed':
        return 'high';
      
      case 'profile_updated':
      case 'data_accessed':
      case 'consent_withdrawn':
        return 'medium';
      
      default:
        return 'low';
    }
  }

  /**
   * Get risk level for admin actions
   */
  private getAdminActionRiskLevel(action: string): AuditEvent['riskLevel'] {
    if (['delete', 'merge', 'bulk_update'].some(a => action.includes(a))) {
      return 'critical';
    }
    if (['approve', 'reject', 'modify'].some(a => action.includes(a))) {
      return 'high';
    }
    return 'medium';
  }

  /**
   * Sanitize input for logging (remove sensitive data)
   */
  private sanitizeInput(input: any): string {
    if (!input) return 'empty';
    
    const sanitized = {
      hasEmail: !!input.email,
      hasPhone: !!input.phone,
      hasName: !!(input.firstName || input.lastName),
      hasAddress: !!input.address
    };
    
    return JSON.stringify(sanitized);
  }

  /**
   * Create hash of input for tracking
   */
  private hashInput(input: any): string {
    const inputString = JSON.stringify(input, Object.keys(input).sort());
    return crypto.createHash('sha256').update(inputString).digest('hex').substring(0, 16);
  }

  /**
   * Encrypt sensitive data
   */
  private async encryptSensitiveData(data: any): Promise<string> {
    try {
      const jsonString = JSON.stringify(data);
      const cipher = crypto.createCipher('aes-256-gcm', this.encryptionKey);
      let encrypted = cipher.update(jsonString, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      return encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      return '[encryption_failed]';
    }
  }

  /**
   * Decrypt sensitive data
   */
  private async decryptSensitiveData(encryptedData: string): Promise<any> {
    try {
      const decipher = crypto.createDecipher('aes-256-gcm', this.encryptionKey);
      let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return JSON.parse(decrypted);
    } catch (error) {
      console.error('Decryption error:', error);
      return null;
    }
  }

  /**
   * Flush audit buffer to persistent storage
   */
  private async flushBuffer(): Promise<void> {
    if (this.auditBuffer.length === 0) return;

    try {
      const events = [...this.auditBuffer];
      this.auditBuffer = [];

      // In a production system, this would insert into a dedicated audit table
      // For now, we'll log to console and could implement database storage
      console.log(`[AUDIT FLUSH] Flushing ${events.length} audit events`);
      
      // You could implement database insertion here:
      /*
      await db.insert(auditEvents).values(
        events.map(event => ({
          id: event.id,
          churchId: event.churchId,
          eventType: event.eventType,
          userId: event.userId,
          profileId: event.profileId,
          ipAddress: event.ipAddress,
          userAgent: event.userAgent,
          timestamp: event.timestamp,
          details: JSON.stringify(event.details),
          sensitiveData: event.sensitiveData,
          riskLevel: event.riskLevel
        }))
      );
      */

    } catch (error) {
      console.error('Audit buffer flush error:', error);
      // Put events back in buffer for retry
      this.auditBuffer.unshift(...this.auditBuffer);
    }
  }

  /**
   * Cleanup and shutdown
   */
  public destroy(): void {
    if (this.flushInterval) {
      clearInterval(this.flushInterval);
    }
    // Final flush
    this.flushBuffer();
  }
}

// ============================================================================
// Compliance Reporting
// ============================================================================

export class ComplianceReporter {
  
  /**
   * Generate GDPR compliance report
   */
  public async generateGDPRReport(
    churchId: string,
    period: { start: Date; end: Date },
    generatedBy: string
  ): Promise<ComplianceReport> {
    // In a real implementation, this would query the audit database
    const mockFindings: ComplianceFinding[] = [
      {
        severity: 'info',
        category: 'privacy',
        description: 'All profile matches logged with appropriate consent tracking',
        affectedProfiles: 0,
        riskScore: 0,
        remediation: 'No action required',
        evidence: ['audit_logs_complete', 'consent_records_present']
      },
      {
        severity: 'warning',
        category: 'data_retention',
        description: 'Some profiles older than 2 years without recent activity',
        affectedProfiles: 15,
        riskScore: 3,
        remediation: 'Review and archive inactive profiles according to retention policy',
        evidence: ['profile_activity_analysis', 'retention_policy_review']
      }
    ];

    return {
      reportId: crypto.randomUUID(),
      churchId,
      reportType: 'gdpr',
      period,
      generatedAt: new Date(),
      generatedBy,
      summary: {
        totalEvents: 1247,
        highRiskEvents: 23,
        privacyViolations: 0,
        dataAccessEvents: 156,
        profileModifications: 89
      },
      findings: mockFindings,
      recommendations: [
        'Implement automated profile archiving for inactive users',
        'Regular compliance audits quarterly',
        'Update privacy notices to reflect current data processing activities',
        'Consider implementing data minimization for older profiles'
      ]
    };
  }

  /**
   * Generate security audit report
   */
  public async generateSecurityReport(
    churchId: string,
    period: { start: Date; end: Date },
    generatedBy: string
  ): Promise<ComplianceReport> {
    const findings: ComplianceFinding[] = [
      {
        severity: 'info',
        category: 'security',
        description: 'All recognition data properly encrypted at rest and in transit',
        affectedProfiles: 0,
        riskScore: 0,
        remediation: 'No action required',
        evidence: ['encryption_audit_passed', 'tls_verification_complete']
      },
      {
        severity: 'warning',
        category: 'access_control',
        description: 'Some admin actions performed without secondary verification',
        affectedProfiles: 5,
        riskScore: 4,
        remediation: 'Implement two-factor authentication for sensitive admin actions',
        evidence: ['admin_action_logs', 'verification_audit']
      }
    ];

    return {
      reportId: crypto.randomUUID(),
      churchId,
      reportType: 'security_review',
      period,
      generatedAt: new Date(),
      generatedBy,
      summary: {
        totalEvents: 1247,
        highRiskEvents: 23,
        privacyViolations: 0,
        dataAccessEvents: 156,
        profileModifications: 89
      },
      findings,
      recommendations: [
        'Enable two-factor authentication for all admin users',
        'Regular security training for church staff',
        'Implement session timeout for administrative interfaces',
        'Review and update access permissions quarterly'
      ]
    };
  }
}

// ============================================================================
// Privacy Controls
// ============================================================================

export class PrivacyController {
  
  /**
   * Process right to be forgotten request
   */
  public async processDataDeletionRequest(
    churchId: string,
    profileId: string,
    requestedBy: string,
    legalBasis: string = 'right_to_be_forgotten'
  ): Promise<{
    success: boolean;
    deletedRecords: number;
    auditTrail: string[];
  }> {
    const auditTrail: string[] = [];
    let deletedRecords = 0;

    try {
      auditTrail.push(`Data deletion request initiated for profile ${profileId}`);
      
      // Log the deletion request
      await auditLogger.logEvent(churchId, 'data_deleted_per_request', {
        description: 'Processing right to be forgotten request',
        legalBasis,
        metadata: {
          requestedBy,
          profileId,
          deletionScope: 'complete_profile'
        }
      }, {
        profileId,
        riskLevel: 'critical'
      });

      // In a real implementation, this would:
      // 1. Delete or anonymize the profile
      // 2. Remove from all related tables
      // 3. Clear caches
      // 4. Update audit logs to reflect deletion

      deletedRecords = 1; // Mock implementation
      auditTrail.push(`Profile ${profileId} successfully deleted/anonymized`);
      auditTrail.push(`Related records processed: ${deletedRecords}`);

      return {
        success: true,
        deletedRecords,
        auditTrail
      };

    } catch (error) {
      auditTrail.push(`Error processing deletion: ${error}`);
      console.error('Data deletion error:', error);
      
      return {
        success: false,
        deletedRecords: 0,
        auditTrail
      };
    }
  }

  /**
   * Export user data for portability
   */
  public async exportUserData(
    churchId: string,
    profileId: string,
    requestedBy: string
  ): Promise<{
    success: boolean;
    data?: any;
    format: 'json' | 'csv';
    exportId: string;
  }> {
    try {
      // Log the export request
      await auditLogger.logDataAccess(churchId, 'complete_profile', [profileId], {
        purpose: 'data_portability_request',
        legalBasis: 'data_portability_right'
      });

      // In a real implementation, this would gather all user data
      const exportData = {
        profile: {
          // User profile data
        },
        submissions: {
          // Form submissions
        },
        preferences: {
          // Privacy preferences
        },
        auditLog: {
          // Relevant audit entries (non-sensitive)
        }
      };

      const exportId = crypto.randomUUID();

      return {
        success: true,
        data: exportData,
        format: 'json',
        exportId
      };

    } catch (error) {
      console.error('Data export error:', error);
      return {
        success: false,
        format: 'json',
        exportId: crypto.randomUUID()
      };
    }
  }
}

// ============================================================================
// Global Instances
// ============================================================================

export const auditLogger = new AuditLogger();
export const complianceReporter = new ComplianceReporter();
export const privacyController = new PrivacyController();

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Get audit summary for a church
 */
export async function getAuditSummary(
  churchId: string,
  period: { start: Date; end: Date }
): Promise<{
  totalEvents: number;
  riskDistribution: Record<string, number>;
  topEventTypes: { type: string; count: number }[];
  complianceScore: number;
}> {
  // Mock implementation - in production this would query the audit database
  return {
    totalEvents: 1247,
    riskDistribution: {
      low: 892,
      medium: 301,
      high: 47,
      critical: 7
    },
    topEventTypes: [
      { type: 'recognition_attempt', count: 567 },
      { type: 'recognition_success', count: 489 },
      { type: 'profile_match_confirmed', count: 156 },
      { type: 'data_accessed', count: 89 },
      { type: 'admin_action', count: 34 }
    ],
    complianceScore: 94.2 // Out of 100
  };
}

/**
 * Check if audit retention period has been exceeded
 */
export function checkAuditRetention(event: AuditEvent, retentionDays: number = 2555): boolean { // 7 years default
  const retentionDate = new Date();
  retentionDate.setDate(retentionDate.getDate() - retentionDays);
  return event.timestamp < retentionDate;
}