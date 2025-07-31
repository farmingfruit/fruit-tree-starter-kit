# Event Registration System Migration Strategy

## Overview
This document outlines the migration strategy for implementing the comprehensive church event registration system that makes Eventbrite and Google Forms obsolete for churches.

## Migration Phases

### Phase 1: Core Infrastructure (Week 1-2)
**Priority: Critical**

1. **Create new tables**:
   - `form_templates` - Reusable form templates
   - `events` - Event management
   - `event_sessions` - Multi-session event support
   - `registration_forms` - Form configurations
   - `person_profiles` - Progressive recognition system

2. **Integration points**:
   - Ensure foreign key relationships to existing `churches`, `members`, `families` tables
   - Extend existing authentication system for magic links
   - Connect to existing Stripe integration for payments

3. **Initial indexes**:
   - Church isolation indexes (critical for multi-tenant performance)
   - Email/phone lookup indexes for progressive recognition
   - Event date and status indexes for listing pages

### Phase 2: Form Submission & Recognition (Week 3-4)
**Priority: High**

1. **Add submission tables**:
   - `form_submissions` - Main submission storage
   - `family_member_submissions` - Family registration support
   - `profile_match_suggestions` - Admin review queue for matching
   - `magic_links` - Passwordless authentication

2. **Recognition algorithm implementation**:
   - Email matching (exact, fuzzy)
   - Phone number normalization and matching
   - Name similarity scoring
   - Address matching for family relationships

3. **Admin review system**:
   - `admin_review_queue` - General admin task management
   - Confidence scoring thresholds (98% = auto-merge, 85% = review)
   - Bulk processing for high-confidence matches

### Phase 3: Payment & Waitlist Management (Week 5-6)
**Priority: Medium**

1. **Payment integration**:
   - `registration_payments` - Event-specific payments
   - Extend Stripe integration for event registrations
   - Partial payment and installment support
   - Refund processing workflows

2. **Capacity management**:
   - `event_waitlist` - Smart waitlist system
   - Automatic notification when spots open
   - Position tracking and conversion workflows
   - Family/group waitlist handling

3. **Advanced features**:
   - Early bird pricing with automatic cutoffs
   - Member vs. non-member pricing tiers
   - Age-based restrictions and validation

### Phase 4: Analytics & Integration (Week 7-8)
**Priority: Low**

1. **Analytics tables** (Optional - can be added later):
   - `form_analytics` - Form performance metrics
   - `submission_tracking` - Detailed user behavior
   - `integration_configs` - External system connections
   - `notification_queue` - Communication management

2. **External integrations**:
   - Email service providers (Mailchimp, Constant Contact)
   - SMS services (Twilio)
   - Calendar systems (Google Calendar, Outlook)

## Data Migration Considerations

### Existing Data Preservation
- No changes to existing `churches`, `members`, `families`, `donations` tables
- New system operates alongside existing donation forms
- Gradual migration of existing contact forms to new system

### Progressive Recognition Data Seeding
```sql
-- Seed person_profiles from existing members
INSERT INTO person_profiles (
  id, church_id, member_id, first_name, last_name, 
  email, phone, profile_status, confidence_score, created_at
)
SELECT 
  id, church_id, id as member_id, first_name, last_name,
  email, mobile_phone, 'verified', 100, created_at
FROM members 
WHERE email IS NOT NULL OR mobile_phone IS NOT NULL;
```

### Family Relationship Mapping
```sql
-- Link person_profiles to existing families
UPDATE person_profiles 
SET family_id = (
  SELECT family_id FROM members 
  WHERE members.id = person_profiles.member_id
)
WHERE member_id IS NOT NULL;
```

## Performance Optimization Strategy

### Critical Indexes for Church Scale (1000+ members each)

```sql
-- Multi-tenant isolation (most important)
CREATE INDEX idx_events_church_lookup ON events(church_id, status, start_date);
CREATE INDEX idx_forms_church_active ON registration_forms(church_id, is_active, form_type);
CREATE INDEX idx_submissions_church_recent ON form_submissions(church_id, submitted_at DESC);

-- Progressive recognition performance
CREATE INDEX idx_profiles_email_lookup ON person_profiles(church_id, email) WHERE email IS NOT NULL;
CREATE INDEX idx_profiles_phone_lookup ON person_profiles(church_id, phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_profiles_name_search ON person_profiles(church_id, first_name, last_name);

-- Event registration performance
CREATE INDEX idx_events_public_upcoming ON events(church_id, visibility, start_date) 
  WHERE status = 'published' AND start_date > unixepoch();
CREATE INDEX idx_waitlist_position ON event_waitlist(event_id, position) WHERE status = 'active';

-- Admin dashboard performance
CREATE INDEX idx_review_queue_pending ON admin_review_queue(church_id, status, priority, created_at)
  WHERE status IN ('pending', 'in_progress');
```

### Query Optimization Patterns

1. **Church Isolation**: Every query MUST include `church_id` in WHERE clause
2. **Pagination**: Use `LIMIT/OFFSET` with appropriate `ORDER BY` on indexed columns
3. **Soft Deletes**: Consider using `deleted_at` instead of hard deletes for audit trails
4. **JSON Fields**: Index frequently queried JSON properties using SQLite JSON functions

## Integration Points with Existing Systems

### Donation System Integration
- Event registration payments link to existing `donations` table structure
- Reuse Stripe customer IDs and payment methods
- Maintain consistent fee calculation and processing

### Member Management Integration
- Progressive recognition links to existing `members` table
- Family relationships maintained through existing `families` table
- Custom fields stored in existing `members.customFields` JSON

### Authentication Integration
- Magic links extend existing Better Auth system
- Session management reuses existing `session` table
- User permissions managed through existing `user` roles

## Security Considerations

### Multi-Tenant Data Isolation
```sql
-- Row Level Security (if using PostgreSQL in future)
CREATE POLICY church_isolation ON events
  FOR ALL TO authenticated_users
  USING (church_id = current_setting('app.current_church_id'));
```

### PII Protection
- Email addresses hashed for matching algorithms
- Phone numbers normalized and partially masked in UI
- Payment data encrypted at rest (handled by Stripe)
- GDPR-compliant data export and deletion workflows

### Magic Link Security
- Tokens are cryptographically secure (32+ character random strings)
- Short expiration times (15 minutes for form access, 24 hours for profile verification)
- Usage tracking prevents replay attacks
- IP address logging for security auditing

## Testing Strategy

### Data Integrity Tests
1. Foreign key constraint validation
2. Multi-tenant isolation verification
3. Progressive recognition accuracy testing
4. Payment flow end-to-end testing

### Performance Tests
1. Load testing with 10,000+ members per church
2. Concurrent form submission handling
3. Progressive recognition algorithm performance
4. Admin dashboard response times

### Integration Tests
1. Stripe payment processing
2. Email notification delivery
3. Magic link authentication flows
4. Waitlist notification workflows

## Rollback Strategy

### Emergency Rollback
- All new tables can be dropped without affecting existing functionality
- Existing donation and member systems remain fully operational
- Feature flags control new system activation per church

### Gradual Rollback
- Disable new form creation while preserving existing submissions
- Migration of event registrations back to external systems if needed
- Data export capabilities for church transitions

## Success Metrics

### Technical Metrics
- Page load times < 200ms for form rendering
- Progressive recognition accuracy > 95%
- Multi-tenant query performance < 50ms
- Zero data leakage between churches

### Business Metrics
- 50% reduction in admin time for event management
- 80% increase in registration completion rates
- 90% reduction in duplicate contact records
- 100% elimination of external form service dependencies

## Timeline Summary

| Phase | Duration | Deliverables | Risk Level |
|-------|----------|-------------|------------|
| Phase 1 | 2 weeks | Core tables, basic CRUD | Low |
| Phase 2 | 2 weeks | Form submissions, recognition | Medium |
| Phase 3 | 2 weeks | Payments, waitlists | Medium |
| Phase 4 | 2 weeks | Analytics, integrations | Low |

**Total Implementation Time**: 8 weeks
**MVP Ready**: After Phase 2 (4 weeks)
**Full Feature Complete**: After Phase 4 (8 weeks)