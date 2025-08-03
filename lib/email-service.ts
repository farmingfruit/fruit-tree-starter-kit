import { db } from "@/db/drizzle";
import { communicationSettings, messageRecipients, messages } from "@/db/schema";
import { eq } from "drizzle-orm";

export interface EmailProvider {
  name: string;
  send: (params: SendEmailParams) => Promise<EmailResult>;
  verifyDomain: (domain: string) => Promise<DomainVerificationResult>;
  setupWebhook: (churchId: string) => Promise<WebhookSetupResult>;
}

export interface SendEmailParams {
  to: string;
  from: string;
  fromName: string;
  replyTo: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  trackingEnabled?: boolean;
  unsubscribeLink?: string;
}

export interface EmailResult {
  messageId: string;
  status: 'sent' | 'failed';
  error?: string;
}

export interface DomainVerificationResult {
  verified: boolean;
  records: DNSRecord[];
  errors?: string[];
}

export interface DNSRecord {
  type: 'SPF' | 'DKIM' | 'DMARC' | 'CNAME';
  name: string;
  value: string;
  priority?: number;
}

export interface WebhookSetupResult {
  webhookUrl: string;
  secret: string;
}

// SendGrid provider implementation
class SendGridProvider implements EmailProvider {
  name = 'sendgrid';
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async send(params: SendEmailParams): Promise<EmailResult> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{
            to: [{ email: params.to }],
            subject: params.subject,
          }],
          from: {
            email: params.from,
            name: params.fromName,
          },
          reply_to: {
            email: params.replyTo,
          },
          content: [
            {
              type: 'text/html',
              value: params.htmlContent,
            },
            ...(params.textContent ? [{
              type: 'text/plain',
              value: params.textContent,
            }] : []),
          ],
          tracking_settings: {
            click_tracking: { enable: params.trackingEnabled ?? true },
            open_tracking: { enable: params.trackingEnabled ?? true },
            subscription_tracking: {
              enable: !!params.unsubscribeLink,
              substitution_tag: '{{unsubscribe}}',
            },
          },
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        return { messageId: '', status: 'failed', error };
      }

      const messageId = response.headers.get('x-message-id') || '';
      return { messageId, status: 'sent' };
    } catch (error) {
      return { 
        messageId: '', 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  async verifyDomain(domain: string): Promise<DomainVerificationResult> {
    try {
      // Check domain authentication status
      const response = await fetch(`https://api.sendgrid.com/v3/whitelabel/domains`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });

      if (!response.ok) {
        return { verified: false, records: [], errors: ['Failed to check domain status'] };
      }

      const domains = await response.json();
      const domainRecord = domains.find((d: any) => d.domain === domain);

      if (!domainRecord) {
        // Domain not set up, return setup records
        return {
          verified: false,
          records: [
            {
              type: 'CNAME',
              name: `em.${domain}`,
              value: 'sendgrid.net',
            },
            {
              type: 'CNAME',
              name: `s1._domainkey.${domain}`,
              value: `s1.domainkey.sendgrid.net`,
            },
            {
              type: 'CNAME',
              name: `s2._domainkey.${domain}`,
              value: `s2.domainkey.sendgrid.net`,
            },
            {
              type: 'SPF',
              name: domain,
              value: 'v=spf1 include:sendgrid.net ~all',
            },
            {
              type: 'DMARC',
              name: `_dmarc.${domain}`,
              value: 'v=DMARC1; p=quarantine; rua=mailto:dmarc@your-church.org',
            },
          ],
        };
      }

      return {
        verified: domainRecord.valid,
        records: domainRecord.dns?.mail_cname ? [
          {
            type: 'CNAME',
            name: domainRecord.dns.mail_cname.host,
            value: domainRecord.dns.mail_cname.data,
          },
        ] : [],
      };
    } catch (error) {
      return { 
        verified: false, 
        records: [], 
        errors: [error instanceof Error ? error.message : 'Unknown error'] 
      };
    }
  }

  async setupWebhook(churchId: string): Promise<WebhookSetupResult> {
    const webhookUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/sendgrid/${churchId}`;
    const secret = `sg_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    try {
      const response = await fetch('https://api.sendgrid.com/v3/user/webhooks/event', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          enabled: true,
          url: webhookUrl,
          group_resubscribe: true,
          delivered: true,
          group_unsubscribe: true,
          spam_report: true,
          bounce: true,
          deferred: true,
          unsubscribe: true,
          processed: true,
          open: true,
          click: true,
          dropped: true,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to setup webhook: ${await response.text()}`);
      }

      return { webhookUrl, secret };
    } catch (error) {
      throw new Error(`Webhook setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

// Email service factory
export class EmailService {
  private provider: EmailProvider;

  constructor(provider: EmailProvider) {
    this.provider = provider;
  }

  static async createForChurch(churchId: string): Promise<EmailService> {
    const settings = await db
      .select()
      .from(communicationSettings)
      .where(eq(communicationSettings.churchId, churchId))
      .limit(1);

    if (!settings[0]) {
      throw new Error('Communication settings not found for church');
    }

    const config = settings[0];
    
    switch (config.emailServiceProvider) {
      case 'sendgrid':
        if (!config.emailApiKey) {
          throw new Error('SendGrid API key not configured');
        }
        return new EmailService(new SendGridProvider(config.emailApiKey));
      
      default:
        throw new Error(`Unsupported email provider: ${config.emailServiceProvider}`);
    }
  }

  async sendEmail(params: SendEmailParams): Promise<EmailResult> {
    return this.provider.send(params);
  }

  async verifyDomain(domain: string): Promise<DomainVerificationResult> {
    return this.provider.verifyDomain(domain);
  }

  async setupWebhook(churchId: string): Promise<WebhookSetupResult> {
    return this.provider.setupWebhook(churchId);
  }
}

// DNS configuration utilities
export class DNSConfigGenerator {
  static generateSubdomainSetup(churchDomain: string, subdomain: string = 'mail') {
    const fullSubdomain = `${subdomain}.${churchDomain}`;
    
    return {
      subdomain: fullSubdomain,
      records: [
        {
          type: 'CNAME' as const,
          name: subdomain,
          value: 'sendgrid.net',
          description: 'Points your mail subdomain to SendGrid',
        },
        {
          type: 'SPF' as const,
          name: fullSubdomain,
          value: 'v=spf1 include:sendgrid.net ~all',
          description: 'Authorizes SendGrid to send emails on your behalf',
        },
        {
          type: 'DKIM' as const,
          name: `s1._domainkey.${fullSubdomain}`,
          value: 's1.domainkey.sendgrid.net',
          description: 'DKIM authentication key 1',
        },
        {
          type: 'DKIM' as const,
          name: `s2._domainkey.${fullSubdomain}`,
          value: 's2.domainkey.sendgrid.net',
          description: 'DKIM authentication key 2',
        },
        {
          type: 'DMARC' as const,
          name: `_dmarc.${fullSubdomain}`,
          value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${churchDomain}`,
          description: 'DMARC policy for email authentication',
        },
      ],
      instructions: {
        godaddy: [
          'Log in to your GoDaddy account',
          'Navigate to your domain management',
          'Click "DNS" or "Manage DNS"',
          'Add each record with the Type, Name, and Value provided',
          'Save changes and wait up to 24 hours for propagation',
        ],
        namecheap: [
          'Log in to your Namecheap account',
          'Go to Domain List and click "Manage" next to your domain',
          'Click on "Advanced DNS" tab',
          'Add each record using the "Add New Record" button',
          'Select the correct record type and enter the Name and Value',
        ],
        general: [
          'Access your domain registrar\'s DNS management panel',
          'Look for "DNS Settings", "DNS Records", or "Zone File"',
          'Add each record using the provided Type, Name, and Value',
          'Save your changes',
          'DNS changes may take up to 24 hours to take effect',
        ],
      },
    };
  }

  static async verifyDNSRecords(domain: string): Promise<{ verified: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    try {
      // This would normally use a DNS lookup service
      // For now, we'll return a placeholder
      // In production, you'd integrate with a DNS verification service
      
      return { verified: true, errors: [] };
    } catch (error) {
      errors.push(`DNS verification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return { verified: false, errors };
    }
  }
}

// Template merge utilities
export class EmailTemplateProcessor {
  static processTemplate(
    template: string, 
    mergeData: Record<string, string>
  ): string {
    let processed = template;
    
    // Replace merge fields like {{firstName}}, {{lastName}}, etc.
    Object.entries(mergeData).forEach(([key, value]) => {
      const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'gi');
      processed = processed.replace(regex, value || '');
    });
    
    // Clean up any remaining merge fields that weren't replaced
    processed = processed.replace(/{{[^}]*}}/g, '');
    
    return processed;
  }

  static extractMergeFields(template: string): string[] {
    const regex = /{{([^}]+)}}/g;
    const fields: string[] = [];
    let match;
    
    while ((match = regex.exec(template)) !== null) {
      const field = match[1].trim();
      if (!fields.includes(field)) {
        fields.push(field);
      }
    }
    
    return fields;
  }

  static generateMergeData(member: {
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    preferredName?: string | null;
  }): Record<string, string> {
    return {
      firstName: member.firstName || '',
      lastName: member.lastName || '',
      fullName: `${member.firstName || ''} ${member.lastName || ''}`.trim(),
      preferredName: member.preferredName || member.firstName || '',
      email: member.email || '',
    };
  }
}