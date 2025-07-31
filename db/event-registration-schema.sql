-- ===========================================================================
-- COMPREHENSIVE DATABASE SCHEMA FOR CHURCH EVENT REGISTRATION SYSTEM
-- Fruit Tree Church Management Platform
-- ===========================================================================
-- This schema integrates with existing church management system to provide
-- revolutionary event registration capabilities that make Eventbrite and 
-- Google Forms obsolete for churches.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- FORM MANAGEMENT TABLES
-- ---------------------------------------------------------------------------

-- Form templates that can be used for various purposes
CREATE TABLE form_templates (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    
    -- Template identity
    name TEXT NOT NULL,
    description TEXT,
    form_type TEXT NOT NULL CHECK (form_type IN ('general', 'registration')),
    
    -- Template settings
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_system_template BOOLEAN NOT NULL DEFAULT false, -- For built-in templates
    
    -- Visual customization
    brand_settings TEXT, -- JSON: {logo_url, primary_color, secondary_color, font_family, custom_css}
    
    -- Form structure and fields
    form_schema TEXT NOT NULL, -- JSON: Complete form field definitions
    validation_rules TEXT, -- JSON: Form validation requirements
    
    -- Behavior settings
    settings TEXT, -- JSON: {allow_editing, require_auth, enable_autosave, etc.}
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    
    -- Indexes
    UNIQUE(church_id, name)
);

CREATE INDEX idx_form_templates_church_type ON form_templates(church_id, form_type);
CREATE INDEX idx_form_templates_active ON form_templates(is_active);

-- ---------------------------------------------------------------------------
-- EVENT MANAGEMENT TABLES
-- ---------------------------------------------------------------------------

-- Events that can have registrations
CREATE TABLE events (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    
    -- Event identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL, -- URL-friendly identifier
    description TEXT,
    short_description TEXT,
    
    -- Event details
    category TEXT, -- 'worship', 'ministry', 'outreach', 'social', 'education', etc.
    event_type TEXT NOT NULL DEFAULT 'single', -- 'single', 'recurring', 'multi_session'
    
    -- Timing
    start_date INTEGER NOT NULL, -- Unix timestamp
    end_date INTEGER,
    timezone TEXT NOT NULL DEFAULT 'America/New_York',
    all_day BOOLEAN NOT NULL DEFAULT false,
    
    -- Location
    location_type TEXT NOT NULL DEFAULT 'physical', -- 'physical', 'virtual', 'hybrid'
    location_name TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    virtual_link TEXT, -- Zoom, Teams, etc.
    virtual_password TEXT,
    
    -- Registration settings
    requires_registration BOOLEAN NOT NULL DEFAULT true,
    registration_opens_at INTEGER, -- When registration opens
    registration_closes_at INTEGER, -- When registration closes
    early_registration_ends_at INTEGER, -- For early bird pricing
    
    -- Capacity management
    max_capacity INTEGER,
    current_registrations INTEGER NOT NULL DEFAULT 0,
    enable_waitlist BOOLEAN NOT NULL DEFAULT true,
    waitlist_limit INTEGER,
    
    -- Pricing
    is_free BOOLEAN NOT NULL DEFAULT true,
    base_price INTEGER, -- Price in cents
    early_bird_price INTEGER, -- Early bird price in cents
    member_price INTEGER, -- Special pricing for members
    
    -- Age restrictions
    min_age INTEGER,
    max_age INTEGER,
    
    -- Visibility and status
    visibility TEXT NOT NULL DEFAULT 'public', -- 'public', 'members_only', 'private'
    status TEXT NOT NULL DEFAULT 'draft', -- 'draft', 'published', 'cancelled', 'completed'
    
    -- Media
    featured_image_url TEXT,
    gallery_images TEXT, -- JSON array of image URLs
    
    -- Additional settings
    settings TEXT, -- JSON: Additional event-specific settings
    
    -- Organizer information
    organizer_member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
    contact_email TEXT,
    contact_phone TEXT,
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    published_at INTEGER,
    
    -- Constraints
    UNIQUE(church_id, slug)
);

CREATE INDEX idx_events_church_id ON events(church_id);
CREATE INDEX idx_events_slug ON events(slug);
CREATE INDEX idx_events_status ON events(status);
CREATE INDEX idx_events_start_date ON events(start_date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_visibility ON events(visibility);
CREATE INDEX idx_events_registration_dates ON events(registration_opens_at, registration_closes_at);

-- Event sessions for multi-session events
CREATE TABLE event_sessions (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    
    -- Session details
    name TEXT,
    description TEXT,
    session_order INTEGER NOT NULL DEFAULT 1,
    
    -- Timing
    start_date INTEGER NOT NULL,
    end_date INTEGER,
    all_day BOOLEAN NOT NULL DEFAULT false,
    
    -- Location (can override event location)
    location_name TEXT,
    address TEXT,
    virtual_link TEXT,
    
    -- Capacity (can be different from main event)
    max_capacity INTEGER,
    current_registrations INTEGER NOT NULL DEFAULT 0,
    
    -- Pricing (can override event pricing)
    price INTEGER, -- Price in cents for this session
    
    -- Status
    is_required BOOLEAN NOT NULL DEFAULT true,
    is_active BOOLEAN NOT NULL DEFAULT true,
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_event_sessions_event_id ON event_sessions(event_id);
CREATE INDEX idx_event_sessions_start_date ON event_sessions(start_date);
CREATE INDEX idx_event_sessions_order ON event_sessions(session_order);

-- ---------------------------------------------------------------------------
-- REGISTRATION FORMS
-- ---------------------------------------------------------------------------

-- Forms associated with events for registration
CREATE TABLE registration_forms (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE, -- NULL for general forms
    template_id TEXT REFERENCES form_templates(id) ON DELETE SET NULL,
    
    -- Form identity
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    description TEXT,
    
    -- Form type and purpose
    form_type TEXT NOT NULL CHECK (form_type IN ('general', 'registration')),
    purpose TEXT, -- 'volunteer', 'contact', 'feedback', 'registration', etc.
    
    -- Form settings
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_public BOOLEAN NOT NULL DEFAULT true,
    requires_auth BOOLEAN NOT NULL DEFAULT false,
    allow_anonymous_submissions BOOLEAN NOT NULL DEFAULT true,
    allow_multiple_submissions BOOLEAN NOT NULL DEFAULT false,
    enable_progressive_recognition BOOLEAN NOT NULL DEFAULT true,
    
    -- Capacity and limits
    max_submissions INTEGER,
    current_submissions INTEGER NOT NULL DEFAULT 0,
    submission_limit_per_person INTEGER DEFAULT 1,
    
    -- Form structure
    form_schema TEXT NOT NULL, -- JSON: Complete form field definitions
    validation_rules TEXT, -- JSON: Form validation requirements
    
    -- Visual customization
    brand_settings TEXT, -- JSON: {logo_url, primary_color, secondary_color, font_family, custom_css}
    
    -- Registration-specific settings
    enable_family_registration BOOLEAN NOT NULL DEFAULT false,
    family_member_fields TEXT, -- JSON: Fields to collect for each family member
    
    -- Payment settings (for registration forms)
    requires_payment BOOLEAN NOT NULL DEFAULT false,
    payment_amount INTEGER, -- Amount in cents
    allow_partial_payment BOOLEAN NOT NULL DEFAULT false,
    payment_deadline INTEGER, -- Unix timestamp
    refund_policy TEXT,
    
    -- Timing
    opens_at INTEGER, -- When form becomes available
    closes_at INTEGER, -- When form stops accepting submissions
    
    -- Confirmation settings
    confirmation_message TEXT,
    confirmation_email_template TEXT, -- JSON: Email template
    redirect_url TEXT, -- URL to redirect after submission
    
    -- Integration settings
    webhook_url TEXT, -- For external integrations
    sync_to_external BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    
    -- Constraints
    UNIQUE(church_id, slug)
);

CREATE INDEX idx_registration_forms_church_id ON registration_forms(church_id);
CREATE INDEX idx_registration_forms_event_id ON registration_forms(event_id);
CREATE INDEX idx_registration_forms_slug ON registration_forms(slug);
CREATE INDEX idx_registration_forms_type ON registration_forms(form_type);
CREATE INDEX idx_registration_forms_active ON registration_forms(is_active);
CREATE INDEX idx_registration_forms_timing ON registration_forms(opens_at, closes_at);

-- ---------------------------------------------------------------------------
-- PERSON RECOGNITION & MATCHING
-- ---------------------------------------------------------------------------

-- Person profiles for progressive recognition system
CREATE TABLE person_profiles (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    member_id TEXT REFERENCES members(id) ON DELETE SET NULL, -- Link to member if matched
    
    -- Identity information
    first_name TEXT,
    last_name TEXT,
    email TEXT,
    phone TEXT,
    date_of_birth INTEGER, -- Unix timestamp
    
    -- Address information
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    
    -- Family relationships
    family_id TEXT REFERENCES families(id) ON DELETE SET NULL,
    
    -- Profile status
    profile_status TEXT NOT NULL DEFAULT 'unverified', -- 'unverified', 'verified', 'duplicate', 'merged'
    confidence_score INTEGER NOT NULL DEFAULT 0, -- 0-100 confidence in profile accuracy
    
    -- Recognition data
    recognition_data TEXT, -- JSON: Data used for matching (hashed emails, phone variants, etc.)
    
    -- Merge tracking
    merged_into TEXT REFERENCES person_profiles(id) ON DELETE SET NULL,
    original_profiles TEXT, -- JSON: Array of profile IDs that were merged into this one
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    verified_at INTEGER
);

CREATE INDEX idx_person_profiles_church_id ON person_profiles(church_id);
CREATE INDEX idx_person_profiles_member_id ON person_profiles(member_id);
CREATE INDEX idx_person_profiles_email ON person_profiles(email);
CREATE INDEX idx_person_profiles_phone ON person_profiles(phone);
CREATE INDEX idx_person_profiles_name ON person_profiles(first_name, last_name);
CREATE INDEX idx_person_profiles_status ON person_profiles(profile_status);
CREATE INDEX idx_person_profiles_confidence ON person_profiles(confidence_score);

-- Profile matching suggestions for admin review
CREATE TABLE profile_match_suggestions (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    
    -- Profiles being matched
    source_profile_id TEXT NOT NULL REFERENCES person_profiles(id) ON DELETE CASCADE,
    target_profile_id TEXT REFERENCES person_profiles(id) ON DELETE CASCADE, -- NULL for new member suggestion
    target_member_id TEXT REFERENCES members(id) ON DELETE CASCADE, -- Direct member match
    
    -- Match details
    match_type TEXT NOT NULL, -- 'profile_merge', 'member_link', 'family_addition'
    confidence_score INTEGER NOT NULL, -- 0-100 match confidence
    match_reasons TEXT NOT NULL, -- JSON: Array of reasons for the match
    
    -- Suggested actions
    suggested_action TEXT NOT NULL, -- 'auto_merge', 'review_required', 'create_new'
    
    -- Admin review
    review_status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'auto_processed'
    reviewed_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    reviewed_at INTEGER,
    review_notes TEXT,
    
    -- Processing
    processed_at INTEGER,
    processing_result TEXT, -- JSON: Result of processing the match
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_profile_match_suggestions_church_id ON profile_match_suggestions(church_id);
CREATE INDEX idx_profile_match_suggestions_source ON profile_match_suggestions(source_profile_id);
CREATE INDEX idx_profile_match_suggestions_target ON profile_match_suggestions(target_profile_id, target_member_id);
CREATE INDEX idx_profile_match_suggestions_review ON profile_match_suggestions(review_status);
CREATE INDEX idx_profile_match_suggestions_confidence ON profile_match_suggestions(confidence_score);

-- ---------------------------------------------------------------------------
-- FORM SUBMISSIONS & REGISTRATIONS
-- ---------------------------------------------------------------------------

-- Main form submissions table
CREATE TABLE form_submissions (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    form_id TEXT NOT NULL REFERENCES registration_forms(id) ON DELETE CASCADE,
    event_id TEXT REFERENCES events(id) ON DELETE CASCADE, -- For event registrations
    
    -- Submitter information
    person_profile_id TEXT REFERENCES person_profiles(id) ON DELETE SET NULL,
    member_id TEXT REFERENCES members(id) ON DELETE SET NULL, -- If linked to a member
    family_id TEXT REFERENCES families(id) ON DELETE SET NULL, -- If part of family registration
    
    -- Submission data
    form_data TEXT NOT NULL, -- JSON: All form field responses
    
    -- Submission metadata
    submission_type TEXT NOT NULL DEFAULT 'individual', -- 'individual', 'family', 'group'
    submission_source TEXT NOT NULL DEFAULT 'web', -- 'web', 'mobile_app', 'admin', 'import'
    
    -- Contact information (duplicated for quick access)
    submitter_email TEXT,
    submitter_phone TEXT,
    submitter_name TEXT,
    
    -- Status tracking
    status TEXT NOT NULL DEFAULT 'submitted', -- 'submitted', 'confirmed', 'cancelled', 'completed'
    
    -- Authentication
    auth_method TEXT, -- 'magic_link', 'social', 'password', 'anonymous'
    auth_token TEXT, -- For magic link authentication
    auth_token_expires_at INTEGER,
    is_verified BOOLEAN NOT NULL DEFAULT false,
    
    -- Session tracking
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    
    -- Processing
    requires_review BOOLEAN NOT NULL DEFAULT false,
    reviewed_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    reviewed_at INTEGER,
    review_notes TEXT,
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    confirmed_at INTEGER,
    submitted_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_form_submissions_church_id ON form_submissions(church_id);
CREATE INDEX idx_form_submissions_form_id ON form_submissions(form_id);
CREATE INDEX idx_form_submissions_event_id ON form_submissions(event_id);
CREATE INDEX idx_form_submissions_person_profile ON form_submissions(person_profile_id);
CREATE INDEX idx_form_submissions_member_id ON form_submissions(member_id);
CREATE INDEX idx_form_submissions_family_id ON form_submissions(family_id);
CREATE INDEX idx_form_submissions_status ON form_submissions(status);
CREATE INDEX idx_form_submissions_email ON form_submissions(submitter_email);
CREATE INDEX idx_form_submissions_submitted_at ON form_submissions(submitted_at);
CREATE INDEX idx_form_submissions_auth_token ON form_submissions(auth_token);

-- Family member submissions (for family registrations)
CREATE TABLE family_member_submissions (
    id TEXT PRIMARY KEY,
    submission_id TEXT NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
    
    -- Family member details
    member_id TEXT REFERENCES members(id) ON DELETE SET NULL, -- If linked to existing member
    
    -- Member information
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    date_of_birth INTEGER,
    
    -- Relationship to primary registrant
    relationship TEXT, -- 'spouse', 'child', 'parent', 'sibling', 'other'
    relationship_notes TEXT,
    
    -- Member-specific form data
    member_form_data TEXT, -- JSON: Member-specific responses
    
    -- Registration details
    is_attending BOOLEAN NOT NULL DEFAULT true,
    special_needs TEXT,
    emergency_contact TEXT,
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_family_member_submissions_submission_id ON family_member_submissions(submission_id);
CREATE INDEX idx_family_member_submissions_member_id ON family_member_submissions(member_id);

-- ---------------------------------------------------------------------------
-- PAYMENT & FINANCIAL INTEGRATION
-- ---------------------------------------------------------------------------

-- Registration payments (integrates with existing donation system)
CREATE TABLE registration_payments (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    submission_id TEXT NOT NULL REFERENCES form_submissions(id) ON DELETE CASCADE,
    event_id TEXT REFERENCES events(id) ON DELETE SET NULL,
    
    -- Payment details
    amount INTEGER NOT NULL, -- Amount in cents
    currency TEXT NOT NULL DEFAULT 'USD',
    payment_type TEXT NOT NULL, -- 'registration_fee', 'deposit', 'balance', 'late_fee'
    
    -- Payment status
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'refunded'
    
    -- Stripe integration
    stripe_payment_intent_id TEXT,
    stripe_customer_id TEXT,
    payment_method_id TEXT,
    
    -- Payment metadata
    processor_fee INTEGER, -- Fee in cents
    net_amount INTEGER, -- Amount after fees
    
    -- Refund information
    refund_amount INTEGER, -- Amount refunded in cents
    refund_reason TEXT,
    refunded_at INTEGER,
    
    -- Due dates and scheduling
    due_date INTEGER,
    paid_at INTEGER,
    
    -- Notes
    notes TEXT,
    admin_notes TEXT,
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_registration_payments_church_id ON registration_payments(church_id);
CREATE INDEX idx_registration_payments_submission_id ON registration_payments(submission_id);
CREATE INDEX idx_registration_payments_event_id ON registration_payments(event_id);
CREATE INDEX idx_registration_payments_status ON registration_payments(status);
CREATE INDEX idx_registration_payments_stripe_intent ON registration_payments(stripe_payment_intent_id);
CREATE INDEX idx_registration_payments_due_date ON registration_payments(due_date);

-- ---------------------------------------------------------------------------
-- WAITLIST MANAGEMENT
-- ---------------------------------------------------------------------------

-- Waitlist entries for events at capacity
CREATE TABLE event_waitlist (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    session_id TEXT REFERENCES event_sessions(id) ON DELETE CASCADE, -- For session-specific waitlists
    
    -- Waitlisted person
    person_profile_id TEXT REFERENCES person_profiles(id) ON DELETE SET NULL,
    member_id TEXT REFERENCES members(id) ON DELETE SET NULL,
    
    -- Contact information
    email TEXT NOT NULL,
    phone TEXT,
    name TEXT NOT NULL,
    
    -- Waitlist details
    position INTEGER NOT NULL, -- Position in waitlist
    party_size INTEGER NOT NULL DEFAULT 1, -- Number of people in their group
    
    -- Status
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'notified', 'converted', 'expired', 'removed'
    
    -- Notification tracking
    last_notified_at INTEGER,
    notification_attempts INTEGER NOT NULL DEFAULT 0,
    response_deadline INTEGER, -- Deadline to respond to notification
    
    -- Form data (in case they filled out registration form)
    form_data TEXT, -- JSON: Their original form responses
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch()),
    converted_at INTEGER, -- When they were converted to full registration
    expired_at INTEGER
);

CREATE INDEX idx_event_waitlist_church_id ON event_waitlist(church_id);
CREATE INDEX idx_event_waitlist_event_id ON event_waitlist(event_id);
CREATE INDEX idx_event_waitlist_session_id ON event_waitlist(session_id);
CREATE INDEX idx_event_waitlist_position ON event_waitlist(event_id, position);
CREATE INDEX idx_event_waitlist_status ON event_waitlist(status);
CREATE INDEX idx_event_waitlist_email ON event_waitlist(email);

-- ---------------------------------------------------------------------------
-- MAGIC LINK AUTHENTICATION
-- ---------------------------------------------------------------------------

-- Magic links for passwordless authentication
CREATE TABLE magic_links (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    
    -- Link details
    token TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL,
    
    -- Purpose
    purpose TEXT NOT NULL, -- 'form_access', 'submission_edit', 'profile_verify', 'admin_review'
    
    -- Target resources
    form_id TEXT REFERENCES registration_forms(id) ON DELETE CASCADE,
    submission_id TEXT REFERENCES form_submissions(id) ON DELETE CASCADE,
    person_profile_id TEXT REFERENCES person_profiles(id) ON DELETE CASCADE,
    
    -- Link settings
    max_uses INTEGER NOT NULL DEFAULT 1,
    current_uses INTEGER NOT NULL DEFAULT 0,
    expires_at INTEGER NOT NULL,
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_consumed BOOLEAN NOT NULL DEFAULT false,
    
    -- Usage tracking
    first_used_at INTEGER,
    last_used_at INTEGER,
    ip_addresses TEXT, -- JSON: Array of IPs that used this link
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_magic_links_token ON magic_links(token);
CREATE INDEX idx_magic_links_email ON magic_links(email);
CREATE INDEX idx_magic_links_church_id ON magic_links(church_id);
CREATE INDEX idx_magic_links_expires_at ON magic_links(expires_at);
CREATE INDEX idx_magic_links_purpose ON magic_links(purpose);

-- ---------------------------------------------------------------------------
-- ANALYTICS & REPORTING
-- ---------------------------------------------------------------------------

-- Form analytics for tracking performance
CREATE TABLE form_analytics (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    form_id TEXT NOT NULL REFERENCES registration_forms(id) ON DELETE CASCADE,
    
    -- Analytics period
    period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
    period_start INTEGER NOT NULL,
    period_end INTEGER NOT NULL,
    
    -- View metrics
    page_views INTEGER NOT NULL DEFAULT 0,
    unique_visitors INTEGER NOT NULL DEFAULT 0,
    
    -- Conversion metrics
    form_starts INTEGER NOT NULL DEFAULT 0, -- People who began filling out form
    form_completions INTEGER NOT NULL DEFAULT 0, -- People who submitted form
    form_conversions INTEGER NOT NULL DEFAULT 0, -- Completed submissions (after verification)
    
    -- Abandonment tracking
    field_abandonment TEXT, -- JSON: Which fields people abandon at
    average_completion_time INTEGER, -- Seconds to complete form
    
    -- Traffic sources
    referrer_data TEXT, -- JSON: Breakdown of where traffic came from
    device_data TEXT, -- JSON: Device/browser breakdown
    
    -- Geographic data
    location_data TEXT, -- JSON: Geographic breakdown of submissions
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_form_analytics_church_id ON form_analytics(church_id);
CREATE INDEX idx_form_analytics_form_id ON form_analytics(form_id);
CREATE INDEX idx_form_analytics_period ON form_analytics(period_type, period_start, period_end);

-- Submission tracking for detailed analytics
CREATE TABLE submission_tracking (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    form_id TEXT NOT NULL REFERENCES registration_forms(id) ON DELETE CASCADE,
    submission_id TEXT REFERENCES form_submissions(id) ON DELETE CASCADE,
    
    -- Session tracking
    session_id TEXT NOT NULL,
    visitor_id TEXT, -- Persistent visitor ID
    
    -- Event tracking
    event_type TEXT NOT NULL, -- 'page_view', 'form_start', 'field_focus', 'field_blur', 'form_submit', 'form_complete'
    field_name TEXT, -- For field-specific events
    
    -- Event data
    event_data TEXT, -- JSON: Additional event-specific data
    
    -- Context
    page_url TEXT,
    referrer TEXT,
    user_agent TEXT,
    ip_address TEXT,
    
    -- Timing
    timestamp INTEGER NOT NULL DEFAULT (unixepoch()),
    time_on_page INTEGER, -- Seconds spent on page
    
    -- Performance
    page_load_time INTEGER -- Milliseconds for page load
);

CREATE INDEX idx_submission_tracking_church_id ON submission_tracking(church_id);
CREATE INDEX idx_submission_tracking_form_id ON submission_tracking(form_id);
CREATE INDEX idx_submission_tracking_submission_id ON submission_tracking(submission_id);
CREATE INDEX idx_submission_tracking_session ON submission_tracking(session_id);
CREATE INDEX idx_submission_tracking_event_type ON submission_tracking(event_type);
CREATE INDEX idx_submission_tracking_timestamp ON submission_tracking(timestamp);

-- ---------------------------------------------------------------------------
-- ADMIN REVIEW QUEUE
-- ---------------------------------------------------------------------------

-- Admin review queue for various tasks
CREATE TABLE admin_review_queue (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    
    -- Review item details
    item_type TEXT NOT NULL, -- 'profile_match', 'payment_issue', 'duplicate_submission', 'capacity_override'
    item_id TEXT NOT NULL, -- ID of the item being reviewed
    priority TEXT NOT NULL DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
    
    -- Review details
    title TEXT NOT NULL,
    description TEXT,
    review_data TEXT, -- JSON: Data needed for review
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'dismissed'
    
    -- Assignment
    assigned_to TEXT REFERENCES user(id) ON DELETE SET NULL,
    assigned_at INTEGER,
    
    -- Review outcome
    reviewed_by TEXT REFERENCES user(id) ON DELETE SET NULL,
    reviewed_at INTEGER,
    review_action TEXT, -- 'approved', 'rejected', 'merged', 'ignored'
    review_notes TEXT,
    
    -- Auto-resolution
    auto_resolve_at INTEGER, -- When to auto-resolve if not reviewed
    auto_resolve_action TEXT, -- What action to take on auto-resolve
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_admin_review_queue_church_id ON admin_review_queue(church_id);
CREATE INDEX idx_admin_review_queue_status ON admin_review_queue(status);
CREATE INDEX idx_admin_review_queue_priority ON admin_review_queue(priority);
CREATE INDEX idx_admin_review_queue_assigned_to ON admin_review_queue(assigned_to);
CREATE INDEX idx_admin_review_queue_item_type ON admin_review_queue(item_type);
CREATE INDEX idx_admin_review_queue_auto_resolve ON admin_review_queue(auto_resolve_at);

-- ---------------------------------------------------------------------------
-- INTEGRATION & EXTERNAL SYSTEMS
-- ---------------------------------------------------------------------------

-- External system integrations
CREATE TABLE integration_configs (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    
    -- Integration details
    integration_type TEXT NOT NULL, -- 'email_service', 'sms_service', 'calendar', 'crm', 'accounting'
    provider TEXT NOT NULL, -- 'mailchimp', 'constant_contact', 'twilio', 'google_calendar', etc.
    
    -- Configuration
    config_data TEXT NOT NULL, -- JSON: Provider-specific configuration
    credentials TEXT, -- JSON: Encrypted credentials
    
    -- Status
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_sync_at INTEGER,
    sync_status TEXT, -- 'success', 'error', 'in_progress'
    sync_error TEXT,
    
    -- Settings
    sync_interval INTEGER, -- Seconds between syncs
    sync_enabled BOOLEAN NOT NULL DEFAULT false,
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_integration_configs_church_id ON integration_configs(church_id);
CREATE INDEX idx_integration_configs_type ON integration_configs(integration_type);
CREATE INDEX idx_integration_configs_provider ON integration_configs(provider);
CREATE INDEX idx_integration_configs_active ON integration_configs(is_active);

-- Sync logs for integration tracking
CREATE TABLE integration_sync_logs (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    integration_id TEXT NOT NULL REFERENCES integration_configs(id) ON DELETE CASCADE,
    
    -- Sync details
    sync_type TEXT NOT NULL, -- 'full', 'incremental', 'manual'
    sync_direction TEXT NOT NULL, -- 'export', 'import', 'bidirectional'
    
    -- Results
    status TEXT NOT NULL, -- 'success', 'partial_success', 'error'
    records_processed INTEGER NOT NULL DEFAULT 0,
    records_successful INTEGER NOT NULL DEFAULT 0,
    records_failed INTEGER NOT NULL DEFAULT 0,
    
    -- Error details
    error_message TEXT,
    error_details TEXT, -- JSON: Detailed error information
    
    -- Performance
    duration_seconds INTEGER,
    
    -- Timestamps
    started_at INTEGER NOT NULL DEFAULT (unixepoch()),
    completed_at INTEGER
);

CREATE INDEX idx_integration_sync_logs_church_id ON integration_sync_logs(church_id);
CREATE INDEX idx_integration_sync_logs_integration_id ON integration_sync_logs(integration_id);
CREATE INDEX idx_integration_sync_logs_status ON integration_sync_logs(status);
CREATE INDEX idx_integration_sync_logs_started_at ON integration_sync_logs(started_at);

-- ---------------------------------------------------------------------------
-- NOTIFICATION & COMMUNICATION
-- ---------------------------------------------------------------------------

-- Notification templates
CREATE TABLE notification_templates (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    
    -- Template details
    name TEXT NOT NULL,
    template_type TEXT NOT NULL, -- 'email', 'sms', 'push'
    trigger_event TEXT NOT NULL, -- 'form_submitted', 'payment_due', 'event_reminder', etc.
    
    -- Template content
    subject TEXT, -- For email templates
    body_template TEXT NOT NULL, -- Template with placeholders
    
    -- Settings
    is_active BOOLEAN NOT NULL DEFAULT true,
    send_delay INTEGER, -- Seconds to wait before sending
    
    -- Scheduling
    send_immediately BOOLEAN NOT NULL DEFAULT true,
    schedule_time TEXT, -- Cron-like schedule for recurring notifications
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_notification_templates_church_id ON notification_templates(church_id);
CREATE INDEX idx_notification_templates_trigger ON notification_templates(trigger_event);
CREATE INDEX idx_notification_templates_type ON notification_templates(template_type);

-- Notification queue
CREATE TABLE notification_queue (
    id TEXT PRIMARY KEY,
    church_id TEXT NOT NULL REFERENCES churches(id) ON DELETE CASCADE,
    template_id TEXT REFERENCES notification_templates(id) ON DELETE SET NULL,
    
    -- Recipient
    recipient_email TEXT,
    recipient_phone TEXT,
    recipient_name TEXT,
    
    -- Notification details
    notification_type TEXT NOT NULL, -- 'email', 'sms', 'push'
    subject TEXT,
    body TEXT NOT NULL,
    
    -- Context
    trigger_event TEXT,
    related_id TEXT, -- ID of related record (submission, event, etc.)
    related_type TEXT, -- Type of related record
    
    -- Status
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sending', 'sent', 'failed', 'cancelled'
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    
    -- Scheduling
    scheduled_for INTEGER NOT NULL DEFAULT (unixepoch()),
    sent_at INTEGER,
    
    -- Error tracking
    last_error TEXT,
    error_count INTEGER NOT NULL DEFAULT 0,
    
    -- Timestamps
    created_at INTEGER NOT NULL DEFAULT (unixepoch()),
    updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE INDEX idx_notification_queue_church_id ON notification_queue(church_id);
CREATE INDEX idx_notification_queue_status ON notification_queue(status);
CREATE INDEX idx_notification_queue_scheduled_for ON notification_queue(scheduled_for);
CREATE INDEX idx_notification_queue_recipient_email ON notification_queue(recipient_email);
CREATE INDEX idx_notification_queue_related ON notification_queue(related_type, related_id);

-- ===========================================================================
-- END OF SCHEMA
-- ===========================================================================