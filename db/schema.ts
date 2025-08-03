import {
  integer,
  sqliteTable,
  text,
  index,
} from "drizzle-orm/sqlite-core";

// Better Auth Tables
export const user = sqliteTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: integer("emailVerified", { mode: "boolean" }).notNull().default(false),
  image: text("image"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const session = sqliteTable("session", {
  id: text("id").primaryKey(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  token: text("token").notNull().unique(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = sqliteTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: integer("accessTokenExpiresAt", { mode: "timestamp" }),
  refreshTokenExpiresAt: integer("refreshTokenExpiresAt", { mode: "timestamp" }),
  scope: text("scope"),
  password: text("password"),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

export const verification = sqliteTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// Subscription table for Polar webhook data
export const subscription = sqliteTable("subscription", {
  id: text("id").primaryKey(),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull(),
  modifiedAt: integer("modifiedAt", { mode: "timestamp" }),
  amount: integer("amount").notNull(),
  currency: text("currency").notNull(),
  recurringInterval: text("recurringInterval").notNull(),
  status: text("status").notNull(),
  currentPeriodStart: integer("currentPeriodStart", { mode: "timestamp" }).notNull(),
  currentPeriodEnd: integer("currentPeriodEnd", { mode: "timestamp" }).notNull(),
  cancelAtPeriodEnd: integer("cancelAtPeriodEnd", { mode: "boolean" }).notNull().default(false),
  canceledAt: integer("canceledAt", { mode: "timestamp" }),
  startedAt: integer("startedAt", { mode: "timestamp" }).notNull(),
  endsAt: integer("endsAt", { mode: "timestamp" }),
  endedAt: integer("endedAt", { mode: "timestamp" }),
  customerId: text("customerId").notNull(),
  productId: text("productId").notNull(),
  discountId: text("discountId"),
  checkoutId: text("checkoutId").notNull(),
  customerCancellationReason: text("customerCancellationReason"),
  customerCancellationComment: text("customerCancellationComment"),
  metadata: text("metadata"), // JSON string
  customFieldData: text("customFieldData"), // JSON string
  userId: text("userId").references(() => user.id),
});

// Church Management Tables

// Churches table for multi-church support
export const churches = sqliteTable("churches", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zipCode"),
  country: text("country").notNull().default("US"),
  phone: text("phone"),
  email: text("email"),
  website: text("website"),
  timezone: text("timezone").notNull().default("America/New_York"),
  settings: text("settings"), // JSON string for church-specific settings
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  nameIdx: index("churches_name_idx").on(table.name),
  emailIdx: index("churches_email_idx").on(table.email),
}));

// Families table for grouping related members
export const families = sqliteTable("families", {
  id: text("id").primaryKey(),
  churchId: text("churchId")
    .notNull()
    .references(() => churches.id, { onDelete: "cascade" }),
  familyName: text("familyName").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zipCode"),
  country: text("country").notNull().default("US"),
  homePhone: text("homePhone"),
  customFields: text("customFields"), // JSON string for flexible custom data
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("families_church_id_idx").on(table.churchId),
  familyNameIdx: index("families_family_name_idx").on(table.familyName),
  zipCodeIdx: index("families_zip_code_idx").on(table.zipCode),
}));

// Members table for individual church members
export const members = sqliteTable("members", {
  id: text("id").primaryKey(),
  churchId: text("churchId")
    .notNull()
    .references(() => churches.id, { onDelete: "cascade" }),
  familyId: text("familyId")
    .references(() => families.id, { onDelete: "set null" }),
  userId: text("userId")
    .references(() => user.id, { onDelete: "set null" }), // Link to auth user if they have an account
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  middleName: text("middleName"),
  preferredName: text("preferredName"),
  email: text("email"),
  mobilePhone: text("mobilePhone"),
  workPhone: text("workPhone"),
  dateOfBirth: integer("dateOfBirth", { mode: "timestamp" }),
  gender: text("gender"), // Male, Female, Other, Prefer not to say
  maritalStatus: text("maritalStatus"), // Single, Married, Divorced, Widowed, Other
  membershipStatus: text("membershipStatus").notNull().default("Active"), // Active, Inactive, Visitor, Transferred, Deceased
  membershipRole: text("membershipRole").notNull().default("Member"), // Member, Visitor, Staff, Elder, Deacon, Pastor, etc.
  joinDate: integer("joinDate", { mode: "timestamp" }),
  baptismDate: integer("baptismDate", { mode: "timestamp" }),
  confirmationDate: integer("confirmationDate", { mode: "timestamp" }),
  transferDate: integer("transferDate", { mode: "timestamp" }),
  inactiveDate: integer("inactiveDate", { mode: "timestamp" }),
  inactiveReason: text("inactiveReason"),
  emergencyContactName: text("emergencyContactName"),
  emergencyContactPhone: text("emergencyContactPhone"),
  emergencyContactRelationship: text("emergencyContactRelationship"),
  occupation: text("occupation"),
  employer: text("employer"),
  skills: text("skills"), // JSON array of skills/talents
  interests: text("interests"), // JSON array of interests
  customFields: text("customFields"), // JSON string for flexible custom data
  notes: text("notes"), // Internal notes
  photoUrl: text("photoUrl"),
  isHeadOfHousehold: integer("isHeadOfHousehold", { mode: "boolean" }).notNull().default(false),
  isMinor: integer("isMinor", { mode: "boolean" }).notNull().default(false),
  privacySettings: text("privacySettings"), // JSON for privacy preferences
  communicationPreferences: text("communicationPreferences"), // JSON for how they want to be contacted
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("members_church_id_idx").on(table.churchId),
  familyIdIdx: index("members_family_id_idx").on(table.familyId),
  userIdIdx: index("members_user_id_idx").on(table.userId),
  nameIdx: index("members_name_idx").on(table.firstName, table.lastName),
  emailIdx: index("members_email_idx").on(table.email),
  statusIdx: index("members_status_idx").on(table.membershipStatus),
  roleIdx: index("members_role_idx").on(table.membershipRole),
  mobilePhoneIdx: index("members_mobile_phone_idx").on(table.mobilePhone),
  dobIdx: index("members_dob_idx").on(table.dateOfBirth),
  joinDateIdx: index("members_join_date_idx").on(table.joinDate),
}));

// Giving/Donations Management Tables

// Donation categories (Tithe, Offering, Missions, etc.)
export const donationCategories = sqliteTable("donation_categories", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  name: text("name").notNull(), // "Tithe", "Offering", "Missions", "Building Fund", etc.
  description: text("description"),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  sortOrder: integer("sortOrder").notNull().default(0),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("donation_categories_church_id_idx").on(table.churchId),
  nameIdx: index("donation_categories_name_idx").on(table.name),
}));

// Main donations table
export const donations = sqliteTable("donations", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  memberId: text("memberId").references(() => members.id, { onDelete: "set null" }), // Optional - for linking to members
  categoryId: text("categoryId").references(() => donationCategories.id, { onDelete: "set null" }),
  
  // Donor information (may not be a member)
  donorFirstName: text("donorFirstName"),
  donorLastName: text("donorLastName"),
  donorEmail: text("donorEmail"),
  donorPhone: text("donorPhone"),
  donorAddress: text("donorAddress"),
  
  // Transaction details
  amount: integer("amount").notNull(), // Amount in cents
  currency: text("currency").notNull().default("USD"),
  method: text("method").notNull(), // "card", "ach", "cash", "check", "bank_transfer"
  status: text("status").notNull().default("pending"), // "pending", "completed", "failed", "refunded"
  
  // Payment processor information
  stripePaymentIntentId: text("stripePaymentIntentId"),
  stripeCustomerId: text("stripeCustomerId"),
  processorFee: integer("processorFee"), // Fee in cents
  netAmount: integer("netAmount"), // Amount after fees in cents
  
  // Manual transaction details
  checkNumber: text("checkNumber"),
  cashReceiptNumber: text("cashReceiptNumber"),
  notes: text("notes"),
  
  // Metadata
  isRecurring: integer("isRecurring", { mode: "boolean" }).notNull().default(false),
  recurringInterval: text("recurringInterval"), // "weekly", "monthly", "yearly"
  isAnonymous: integer("isAnonymous", { mode: "boolean" }).notNull().default(false),
  isTestMode: integer("isTestMode", { mode: "boolean" }).notNull().default(false),
  
  // Timestamps
  donationDate: integer("donationDate", { mode: "timestamp" }).notNull(),
  processedAt: integer("processedAt", { mode: "timestamp" }),
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("donations_church_id_idx").on(table.churchId),
  memberIdIdx: index("donations_member_id_idx").on(table.memberId),
  categoryIdIdx: index("donations_category_id_idx").on(table.categoryId),
  statusIdx: index("donations_status_idx").on(table.status),
  methodIdx: index("donations_method_idx").on(table.method),
  donationDateIdx: index("donations_donation_date_idx").on(table.donationDate),
  amountIdx: index("donations_amount_idx").on(table.amount),
  stripePaymentIntentIdx: index("donations_stripe_payment_intent_idx").on(table.stripePaymentIntentId),
}));

// Donation forms table - for managing public donation forms
export const donationForms = sqliteTable("donation_forms", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  
  // Form identity
  name: text("name").notNull(),
  slug: text("slug").notNull(), // URL-friendly identifier
  description: text("description"),
  
  // Form settings
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  isDefault: integer("isDefault", { mode: "boolean" }).notNull().default(false),
  allowAnonymous: integer("allowAnonymous", { mode: "boolean" }).notNull().default(true),
  requireDonorInfo: integer("requireDonorInfo", { mode: "boolean" }).notNull().default(true),
  enableFeeCoverage: integer("enableFeeCoverage", { mode: "boolean" }).notNull().default(true),
  enableMultiFund: integer("enableMultiFund", { mode: "boolean" }).notNull().default(true),
  
  // Customization
  primaryColor: text("primaryColor").default("#3B82F6"),
  buttonText: text("buttonText").default("Give Now"),
  thankYouMessage: text("thankYouMessage"),
  customCss: text("customCss"),
  
  // Minimum amounts
  minimumAmount: integer("minimumAmount").notNull().default(100), // $1.00 in cents
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("donation_forms_church_id_idx").on(table.churchId),
  slugIdx: index("donation_forms_slug_idx").on(table.slug),
  activeIdx: index("donation_forms_active_idx").on(table.isActive),
}));

// ===========================================================================
// EVENT REGISTRATION SYSTEM TABLES
// ===========================================================================

// Form templates that can be used for various purposes
export const formTemplates = sqliteTable("form_templates", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  
  // Template identity
  name: text("name").notNull(),
  description: text("description"),
  formType: text("formType").notNull(), // 'general' | 'registration'
  
  // Template settings
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  isSystemTemplate: integer("isSystemTemplate", { mode: "boolean" }).notNull().default(false),
  
  // Visual customization
  brandSettings: text("brandSettings"), // JSON: {logo_url, primary_color, secondary_color, font_family, custom_css}
  
  // Form structure and fields
  formSchema: text("formSchema").notNull(), // JSON: Complete form field definitions
  validationRules: text("validationRules"), // JSON: Form validation requirements
  
  // Behavior settings
  settings: text("settings"), // JSON: {allow_editing, require_auth, enable_autosave, etc.}
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("form_templates_church_id_idx").on(table.churchId),
  churchTypeIdx: index("form_templates_church_type_idx").on(table.churchId, table.formType),
  activeIdx: index("form_templates_active_idx").on(table.isActive),
  nameIdx: index("form_templates_name_idx").on(table.churchId, table.name),
}));

// Events that can have registrations
export const events = sqliteTable("events", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  
  // Event identity
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  shortDescription: text("shortDescription"),
  
  // Event details
  category: text("category"), // 'worship', 'ministry', 'outreach', 'social', 'education', etc.
  eventType: text("eventType").notNull().default("single"), // 'single', 'recurring', 'multi_session'
  
  // Timing
  startDate: integer("startDate", { mode: "timestamp" }).notNull(),
  endDate: integer("endDate", { mode: "timestamp" }),
  timezone: text("timezone").notNull().default("America/New_York"),
  allDay: integer("allDay", { mode: "boolean" }).notNull().default(false),
  
  // Location
  locationType: text("locationType").notNull().default("physical"), // 'physical', 'virtual', 'hybrid'
  locationName: text("locationName"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zipCode"),
  virtualLink: text("virtualLink"),
  virtualPassword: text("virtualPassword"),
  
  // Registration settings
  requiresRegistration: integer("requiresRegistration", { mode: "boolean" }).notNull().default(true),
  registrationOpensAt: integer("registrationOpensAt", { mode: "timestamp" }),
  registrationClosesAt: integer("registrationClosesAt", { mode: "timestamp" }),
  earlyRegistrationEndsAt: integer("earlyRegistrationEndsAt", { mode: "timestamp" }),
  
  // Capacity management
  maxCapacity: integer("maxCapacity"),
  currentRegistrations: integer("currentRegistrations").notNull().default(0),
  enableWaitlist: integer("enableWaitlist", { mode: "boolean" }).notNull().default(true),
  waitlistLimit: integer("waitlistLimit"),
  
  // Pricing
  isFree: integer("isFree", { mode: "boolean" }).notNull().default(true),
  basePrice: integer("basePrice"), // Price in cents
  earlyBirdPrice: integer("earlyBirdPrice"), // Early bird price in cents
  memberPrice: integer("memberPrice"), // Special pricing for members
  
  // Age restrictions
  minAge: integer("minAge"),
  maxAge: integer("maxAge"),
  
  // Visibility and status
  visibility: text("visibility").notNull().default("public"), // 'public', 'members_only', 'private'
  status: text("status").notNull().default("draft"), // 'draft', 'published', 'cancelled', 'completed'
  
  // Media
  featuredImageUrl: text("featuredImageUrl"),
  galleryImages: text("galleryImages"), // JSON array of image URLs
  
  // Additional settings
  settings: text("settings"), // JSON: Additional event-specific settings
  
  // Organizer information
  organizerMemberId: text("organizerMemberId").references(() => members.id, { onDelete: "set null" }),
  contactEmail: text("contactEmail"),
  contactPhone: text("contactPhone"),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  publishedAt: integer("publishedAt", { mode: "timestamp" }),
}, (table) => ({
  churchIdIdx: index("events_church_id_idx").on(table.churchId),
  slugIdx: index("events_slug_idx").on(table.churchId, table.slug),
  statusIdx: index("events_status_idx").on(table.status),
  startDateIdx: index("events_start_date_idx").on(table.startDate),
  categoryIdx: index("events_category_idx").on(table.category),
  visibilityIdx: index("events_visibility_idx").on(table.visibility),
  registrationDatesIdx: index("events_registration_dates_idx").on(table.registrationOpensAt, table.registrationClosesAt),
}));

// Event sessions for multi-session events
export const eventSessions = sqliteTable("event_sessions", {
  id: text("id").primaryKey(),
  eventId: text("eventId").notNull().references(() => events.id, { onDelete: "cascade" }),
  
  // Session details
  name: text("name"),
  description: text("description"),
  sessionOrder: integer("sessionOrder").notNull().default(1),
  
  // Timing
  startDate: integer("startDate", { mode: "timestamp" }).notNull(),
  endDate: integer("endDate", { mode: "timestamp" }),
  allDay: integer("allDay", { mode: "boolean" }).notNull().default(false),
  
  // Location (can override event location)
  locationName: text("locationName"),
  address: text("address"),
  virtualLink: text("virtualLink"),
  
  // Capacity (can be different from main event)
  maxCapacity: integer("maxCapacity"),
  currentRegistrations: integer("currentRegistrations").notNull().default(0),
  
  // Pricing (can override event pricing)
  price: integer("price"), // Price in cents for this session
  
  // Status
  isRequired: integer("isRequired", { mode: "boolean" }).notNull().default(true),
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  eventIdIdx: index("event_sessions_event_id_idx").on(table.eventId),
  startDateIdx: index("event_sessions_start_date_idx").on(table.startDate),
  orderIdx: index("event_sessions_order_idx").on(table.sessionOrder),
}));

// Forms associated with events for registration
export const registrationForms = sqliteTable("registration_forms", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  eventId: text("eventId").references(() => events.id, { onDelete: "cascade" }), // NULL for general forms
  templateId: text("templateId").references(() => formTemplates.id, { onDelete: "set null" }),
  
  // Form identity
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  description: text("description"),
  
  // Form type and purpose
  formType: text("formType").notNull(), // 'general' | 'registration'
  purpose: text("purpose"), // 'volunteer', 'contact', 'feedback', 'registration', etc.
  
  // Form settings
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  isPublic: integer("isPublic", { mode: "boolean" }).notNull().default(true),
  requiresAuth: integer("requiresAuth", { mode: "boolean" }).notNull().default(false),
  allowAnonymousSubmissions: integer("allowAnonymousSubmissions", { mode: "boolean" }).notNull().default(true),
  allowMultipleSubmissions: integer("allowMultipleSubmissions", { mode: "boolean" }).notNull().default(false),
  enableProgressiveRecognition: integer("enableProgressiveRecognition", { mode: "boolean" }).notNull().default(true),
  
  // Capacity and limits
  maxSubmissions: integer("maxSubmissions"),
  currentSubmissions: integer("currentSubmissions").notNull().default(0),
  submissionLimitPerPerson: integer("submissionLimitPerPerson").default(1),
  
  // Form structure
  formSchema: text("formSchema").notNull(), // JSON: Complete form field definitions
  validationRules: text("validationRules"), // JSON: Form validation requirements
  
  // Visual customization
  brandSettings: text("brandSettings"), // JSON: {logo_url, primary_color, secondary_color, font_family, custom_css}
  
  // Registration-specific settings
  enableFamilyRegistration: integer("enableFamilyRegistration", { mode: "boolean" }).notNull().default(false),
  familyMemberFields: text("familyMemberFields"), // JSON: Fields to collect for each family member
  
  // Payment settings (for registration forms)
  requiresPayment: integer("requiresPayment", { mode: "boolean" }).notNull().default(false),
  paymentAmount: integer("paymentAmount"), // Amount in cents
  allowPartialPayment: integer("allowPartialPayment", { mode: "boolean" }).notNull().default(false),
  paymentDeadline: integer("paymentDeadline", { mode: "timestamp" }),
  refundPolicy: text("refundPolicy"),
  
  // Timing
  opensAt: integer("opensAt", { mode: "timestamp" }),
  closesAt: integer("closesAt", { mode: "timestamp" }),
  
  // Confirmation settings
  confirmationMessage: text("confirmationMessage"),
  confirmationEmailTemplate: text("confirmationEmailTemplate"), // JSON: Email template
  redirectUrl: text("redirectUrl"),
  
  // Integration settings
  webhookUrl: text("webhookUrl"), // For external integrations
  syncToExternal: integer("syncToExternal", { mode: "boolean" }).notNull().default(false),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("registration_forms_church_id_idx").on(table.churchId),
  eventIdIdx: index("registration_forms_event_id_idx").on(table.eventId),
  slugIdx: index("registration_forms_slug_idx").on(table.churchId, table.slug),
  typeIdx: index("registration_forms_type_idx").on(table.formType),
  activeIdx: index("registration_forms_active_idx").on(table.isActive),
  timingIdx: index("registration_forms_timing_idx").on(table.opensAt, table.closesAt),
}));

// Person profiles for progressive recognition system
export const personProfiles = sqliteTable("person_profiles", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  memberId: text("memberId").references(() => members.id, { onDelete: "set null" }), // Link to member if matched
  
  // Identity information
  firstName: text("firstName"),
  lastName: text("lastName"),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: integer("dateOfBirth", { mode: "timestamp" }),
  
  // Address information
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zipCode"),
  
  // Family relationships
  familyId: text("familyId").references(() => families.id, { onDelete: "set null" }),
  
  // Profile status
  profileStatus: text("profileStatus").notNull().default("unverified"), // 'unverified', 'verified', 'duplicate', 'merged'
  confidenceScore: integer("confidenceScore").notNull().default(0), // 0-100 confidence in profile accuracy
  
  // Recognition data
  recognitionData: text("recognitionData"), // JSON: Data used for matching (hashed emails, phone variants, etc.)
  
  // Merge tracking
  mergedInto: text("mergedInto").references(() => personProfiles.id, { onDelete: "set null" }),
  originalProfiles: text("originalProfiles"), // JSON: Array of profile IDs that were merged into this one
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  verifiedAt: integer("verifiedAt", { mode: "timestamp" }),
}, (table) => ({
  churchIdIdx: index("person_profiles_church_id_idx").on(table.churchId),
  memberIdIdx: index("person_profiles_member_id_idx").on(table.memberId),
  emailIdx: index("person_profiles_email_idx").on(table.email),
  phoneIdx: index("person_profiles_phone_idx").on(table.phone),
  nameIdx: index("person_profiles_name_idx").on(table.firstName, table.lastName),
  statusIdx: index("person_profiles_status_idx").on(table.profileStatus),
  confidenceIdx: index("person_profiles_confidence_idx").on(table.confidenceScore),
}));

// Self-reference for personProfiles.mergedInto
export const personProfilesRelations = {
  mergedInto: personProfiles.mergedInto,
};

// Profile matching suggestions for admin review
export const profileMatchSuggestions = sqliteTable("profile_match_suggestions", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  
  // Profiles being matched
  sourceProfileId: text("sourceProfileId").notNull().references(() => personProfiles.id, { onDelete: "cascade" }),
  targetProfileId: text("targetProfileId").references(() => personProfiles.id, { onDelete: "cascade" }), // NULL for new member suggestion
  targetMemberId: text("targetMemberId").references(() => members.id, { onDelete: "cascade" }), // Direct member match
  
  // Match details
  matchType: text("matchType").notNull(), // 'profile_merge', 'member_link', 'family_addition'
  confidenceScore: integer("confidenceScore").notNull(), // 0-100 match confidence
  matchReasons: text("matchReasons").notNull(), // JSON: Array of reasons for the match
  
  // Suggested actions
  suggestedAction: text("suggestedAction").notNull(), // 'auto_merge', 'review_required', 'create_new'
  
  // Admin review
  reviewStatus: text("reviewStatus").notNull().default("pending"), // 'pending', 'approved', 'rejected', 'auto_processed'
  reviewedBy: text("reviewedBy").references(() => user.id, { onDelete: "set null" }),
  reviewedAt: integer("reviewedAt", { mode: "timestamp" }),
  reviewNotes: text("reviewNotes"),
  
  // Processing
  processedAt: integer("processedAt", { mode: "timestamp" }),
  processingResult: text("processingResult"), // JSON: Result of processing the match
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("profile_match_suggestions_church_id_idx").on(table.churchId),
  sourceIdx: index("profile_match_suggestions_source_idx").on(table.sourceProfileId),
  targetIdx: index("profile_match_suggestions_target_idx").on(table.targetProfileId, table.targetMemberId),
  reviewIdx: index("profile_match_suggestions_review_idx").on(table.reviewStatus),
  confidenceIdx: index("profile_match_suggestions_confidence_idx").on(table.confidenceScore),
}));

// Main form submissions table
export const formSubmissions = sqliteTable("form_submissions", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  formId: text("formId").notNull().references(() => registrationForms.id, { onDelete: "cascade" }),
  eventId: text("eventId").references(() => events.id, { onDelete: "cascade" }), // For event registrations
  
  // Submitter information
  personProfileId: text("personProfileId").references(() => personProfiles.id, { onDelete: "set null" }),
  memberId: text("memberId").references(() => members.id, { onDelete: "set null" }), // If linked to a member
  familyId: text("familyId").references(() => families.id, { onDelete: "set null" }), // If part of family registration
  
  // Submission data
  formData: text("formData").notNull(), // JSON: All form field responses
  
  // Submission metadata
  submissionType: text("submissionType").notNull().default("individual"), // 'individual', 'family', 'group'
  submissionSource: text("submissionSource").notNull().default("web"), // 'web', 'mobile_app', 'admin', 'import'
  
  // Contact information (duplicated for quick access)
  submitterEmail: text("submitterEmail"),
  submitterPhone: text("submitterPhone"),
  submitterName: text("submitterName"),
  
  // Status tracking
  status: text("status").notNull().default("submitted"), // 'submitted', 'confirmed', 'cancelled', 'completed'
  
  // Authentication
  authMethod: text("authMethod"), // 'magic_link', 'social', 'password', 'anonymous'
  authToken: text("authToken"), // For magic link authentication
  authTokenExpiresAt: integer("authTokenExpiresAt", { mode: "timestamp" }),
  isVerified: integer("isVerified", { mode: "boolean" }).notNull().default(false),
  
  // Session tracking
  sessionId: text("sessionId"),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  
  // Processing
  requiresReview: integer("requiresReview", { mode: "boolean" }).notNull().default(false),
  reviewedBy: text("reviewedBy").references(() => user.id, { onDelete: "set null" }),
  reviewedAt: integer("reviewedAt", { mode: "timestamp" }),
  reviewNotes: text("reviewNotes"),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  confirmedAt: integer("confirmedAt", { mode: "timestamp" }),
  submittedAt: integer("submittedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("form_submissions_church_id_idx").on(table.churchId),
  formIdIdx: index("form_submissions_form_id_idx").on(table.formId),
  eventIdIdx: index("form_submissions_event_id_idx").on(table.eventId),
  personProfileIdx: index("form_submissions_person_profile_idx").on(table.personProfileId),
  memberIdIdx: index("form_submissions_member_id_idx").on(table.memberId),
  familyIdIdx: index("form_submissions_family_id_idx").on(table.familyId),
  statusIdx: index("form_submissions_status_idx").on(table.status),
  emailIdx: index("form_submissions_email_idx").on(table.submitterEmail),
  submittedAtIdx: index("form_submissions_submitted_at_idx").on(table.submittedAt),
  authTokenIdx: index("form_submissions_auth_token_idx").on(table.authToken),
}));

// Family member submissions (for family registrations)
export const familyMemberSubmissions = sqliteTable("family_member_submissions", {
  id: text("id").primaryKey(),
  submissionId: text("submissionId").notNull().references(() => formSubmissions.id, { onDelete: "cascade" }),
  
  // Family member details
  memberId: text("memberId").references(() => members.id, { onDelete: "set null" }), // If linked to existing member
  
  // Member information
  firstName: text("firstName").notNull(),
  lastName: text("lastName").notNull(),
  email: text("email"),
  phone: text("phone"),
  dateOfBirth: integer("dateOfBirth", { mode: "timestamp" }),
  
  // Relationship to primary registrant
  relationship: text("relationship"), // 'spouse', 'child', 'parent', 'sibling', 'other'
  relationshipNotes: text("relationshipNotes"),
  
  // Member-specific form data
  memberFormData: text("memberFormData"), // JSON: Member-specific responses
  
  // Registration details
  isAttending: integer("isAttending", { mode: "boolean" }).notNull().default(true),
  specialNeeds: text("specialNeeds"),
  emergencyContact: text("emergencyContact"),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  submissionIdIdx: index("family_member_submissions_submission_id_idx").on(table.submissionId),
  memberIdIdx: index("family_member_submissions_member_id_idx").on(table.memberId),
}));

// Registration payments (integrates with existing donation system)
export const registrationPayments = sqliteTable("registration_payments", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  submissionId: text("submissionId").notNull().references(() => formSubmissions.id, { onDelete: "cascade" }),
  eventId: text("eventId").references(() => events.id, { onDelete: "set null" }),
  
  // Payment details
  amount: integer("amount").notNull(), // Amount in cents
  currency: text("currency").notNull().default("USD"),
  paymentType: text("paymentType").notNull(), // 'registration_fee', 'deposit', 'balance', 'late_fee'
  
  // Payment status
  status: text("status").notNull().default("pending"), // 'pending', 'processing', 'completed', 'failed', 'refunded'
  
  // Stripe integration
  stripePaymentIntentId: text("stripePaymentIntentId"),
  stripeCustomerId: text("stripeCustomerId"),
  paymentMethodId: text("paymentMethodId"),
  
  // Payment metadata
  processorFee: integer("processorFee"), // Fee in cents
  netAmount: integer("netAmount"), // Amount after fees
  
  // Refund information
  refundAmount: integer("refundAmount"), // Amount refunded in cents
  refundReason: text("refundReason"),
  refundedAt: integer("refundedAt", { mode: "timestamp" }),
  
  // Due dates and scheduling
  dueDate: integer("dueDate", { mode: "timestamp" }),
  paidAt: integer("paidAt", { mode: "timestamp" }),
  
  // Notes
  notes: text("notes"),
  adminNotes: text("adminNotes"),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("registration_payments_church_id_idx").on(table.churchId),
  submissionIdIdx: index("registration_payments_submission_id_idx").on(table.submissionId),
  eventIdIdx: index("registration_payments_event_id_idx").on(table.eventId),
  statusIdx: index("registration_payments_status_idx").on(table.status),
  stripeIntentIdx: index("registration_payments_stripe_intent_idx").on(table.stripePaymentIntentId),
  dueDateIdx: index("registration_payments_due_date_idx").on(table.dueDate),
}));

// Waitlist entries for events at capacity
export const eventWaitlist = sqliteTable("event_waitlist", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  eventId: text("eventId").notNull().references(() => events.id, { onDelete: "cascade" }),
  sessionId: text("sessionId").references(() => eventSessions.id, { onDelete: "cascade" }), // For session-specific waitlists
  
  // Waitlisted person
  personProfileId: text("personProfileId").references(() => personProfiles.id, { onDelete: "set null" }),
  memberId: text("memberId").references(() => members.id, { onDelete: "set null" }),
  
  // Contact information
  email: text("email").notNull(),
  phone: text("phone"),
  name: text("name").notNull(),
  
  // Waitlist details
  position: integer("position").notNull(), // Position in waitlist
  partySize: integer("partySize").notNull().default(1), // Number of people in their group
  
  // Status
  status: text("status").notNull().default("active"), // 'active', 'notified', 'converted', 'expired', 'removed'
  
  // Notification tracking
  lastNotifiedAt: integer("lastNotifiedAt", { mode: "timestamp" }),
  notificationAttempts: integer("notificationAttempts").notNull().default(0),
  responseDeadline: integer("responseDeadline", { mode: "timestamp" }), // Deadline to respond to notification
  
  // Form data (in case they filled out registration form)
  formData: text("formData"), // JSON: Their original form responses
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  convertedAt: integer("convertedAt", { mode: "timestamp" }), // When they were converted to full registration
  expiredAt: integer("expiredAt", { mode: "timestamp" }),
}, (table) => ({
  churchIdIdx: index("event_waitlist_church_id_idx").on(table.churchId),
  eventIdIdx: index("event_waitlist_event_id_idx").on(table.eventId),
  sessionIdIdx: index("event_waitlist_session_id_idx").on(table.sessionId),
  positionIdx: index("event_waitlist_position_idx").on(table.eventId, table.position),
  statusIdx: index("event_waitlist_status_idx").on(table.status),
  emailIdx: index("event_waitlist_email_idx").on(table.email),
}));

// Magic links for passwordless authentication
export const magicLinks = sqliteTable("magic_links", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  
  // Link details
  token: text("token").notNull().unique(),
  email: text("email").notNull(),
  
  // Purpose
  purpose: text("purpose").notNull(), // 'form_access', 'submission_edit', 'profile_verify', 'admin_review'
  
  // Target resources
  formId: text("formId").references(() => registrationForms.id, { onDelete: "cascade" }),
  submissionId: text("submissionId").references(() => formSubmissions.id, { onDelete: "cascade" }),
  personProfileId: text("personProfileId").references(() => personProfiles.id, { onDelete: "cascade" }),
  
  // Link settings
  maxUses: integer("maxUses").notNull().default(1),
  currentUses: integer("currentUses").notNull().default(0),
  expiresAt: integer("expiresAt", { mode: "timestamp" }).notNull(),
  
  // Status
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  isConsumed: integer("isConsumed", { mode: "boolean" }).notNull().default(false),
  
  // Usage tracking
  firstUsedAt: integer("firstUsedAt", { mode: "timestamp" }),
  lastUsedAt: integer("lastUsedAt", { mode: "timestamp" }),
  ipAddresses: text("ipAddresses"), // JSON: Array of IPs that used this link
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  tokenIdx: index("magic_links_token_idx").on(table.token),
  emailIdx: index("magic_links_email_idx").on(table.email),
  churchIdIdx: index("magic_links_church_id_idx").on(table.churchId),
  expiresAtIdx: index("magic_links_expires_at_idx").on(table.expiresAt),
  purposeIdx: index("magic_links_purpose_idx").on(table.purpose),
}));

// Admin review queue for various tasks
export const adminReviewQueue = sqliteTable("admin_review_queue", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  
  // Review item details
  itemType: text("itemType").notNull(), // 'profile_match', 'payment_issue', 'duplicate_submission', 'capacity_override'
  itemId: text("itemId").notNull(), // ID of the item being reviewed
  priority: text("priority").notNull().default("medium"), // 'low', 'medium', 'high', 'urgent'
  
  // Review details
  title: text("title").notNull(),
  description: text("description"),
  reviewData: text("reviewData"), // JSON: Data needed for review
  
  // Status
  status: text("status").notNull().default("pending"), // 'pending', 'in_progress', 'completed', 'dismissed'
  
  // Assignment
  assignedTo: text("assignedTo").references(() => user.id, { onDelete: "set null" }),
  assignedAt: integer("assignedAt", { mode: "timestamp" }),
  
  // Review outcome
  reviewedBy: text("reviewedBy").references(() => user.id, { onDelete: "set null" }),
  reviewedAt: integer("reviewedAt", { mode: "timestamp" }),
  reviewAction: text("reviewAction"), // 'approved', 'rejected', 'merged', 'ignored'
  reviewNotes: text("reviewNotes"),
  
  // Auto-resolution
  autoResolveAt: integer("autoResolveAt", { mode: "timestamp" }), // When to auto-resolve if not reviewed
  autoResolveAction: text("autoResolveAction"), // What action to take on auto-resolve
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("admin_review_queue_church_id_idx").on(table.churchId),
  statusIdx: index("admin_review_queue_status_idx").on(table.status),
  priorityIdx: index("admin_review_queue_priority_idx").on(table.priority),
  assignedToIdx: index("admin_review_queue_assigned_to_idx").on(table.assignedTo),
  itemTypeIdx: index("admin_review_queue_item_type_idx").on(table.itemType),
  autoResolveIdx: index("admin_review_queue_auto_resolve_idx").on(table.autoResolveAt),
}));

// Junction table for donation forms and available categories
export const donationFormCategories = sqliteTable("donation_form_categories", {
  id: text("id").primaryKey(),
  formId: text("formId").notNull().references(() => donationForms.id, { onDelete: "cascade" }),
  categoryId: text("categoryId").notNull().references(() => donationCategories.id, { onDelete: "cascade" }),
  
  // Category-specific settings for this form
  isDefault: integer("isDefault", { mode: "boolean" }).notNull().default(false),
  sortOrder: integer("sortOrder").notNull().default(0),
  isRequired: integer("isRequired", { mode: "boolean" }).notNull().default(false),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  formIdIdx: index("donation_form_categories_form_id_idx").on(table.formId),
  categoryIdIdx: index("donation_form_categories_category_id_idx").on(table.categoryId),
  sortOrderIdx: index("donation_form_categories_sort_order_idx").on(table.sortOrder),
}));

// Multi-fund donations - for splitting donations across categories
export const donationSplits = sqliteTable("donation_splits", {
  id: text("id").primaryKey(),
  donationId: text("donationId").notNull().references(() => donations.id, { onDelete: "cascade" }),
  categoryId: text("categoryId").notNull().references(() => donationCategories.id, { onDelete: "set null" }),
  
  // Split details
  amount: integer("amount").notNull(), // Amount in cents for this category
  percentage: integer("percentage"), // Percentage of total donation (0-10000 for 0.00%-100.00%)
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  donationIdIdx: index("donation_splits_donation_id_idx").on(table.donationId),
  categoryIdIdx: index("donation_splits_category_id_idx").on(table.categoryId),
}));

// Track donation forms used for each donation
export const donationFormSubmissions = sqliteTable("donation_form_submissions", {
  id: text("id").primaryKey(),
  donationId: text("donationId").notNull().references(() => donations.id, { onDelete: "cascade" }),
  formId: text("formId").notNull().references(() => donationForms.id, { onDelete: "set null" }),
  
  // Submission metadata
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  referrer: text("referrer"),
  
  // Fee coverage
  feeCoverageAmount: integer("feeCoverageAmount"), // Additional amount for fee coverage in cents
  coversFees: integer("coversFees", { mode: "boolean" }).notNull().default(false),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  donationIdIdx: index("donation_form_submissions_donation_id_idx").on(table.donationId),
  formIdIdx: index("donation_form_submissions_form_id_idx").on(table.formId),
}));

// ===========================================================================
// EMAIL/SMS MESSAGING SYSTEM TABLES
// ===========================================================================

// Church communication settings
export const communicationSettings = sqliteTable("communication_settings", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  
  // Email settings
  emailSubdomain: text("emailSubdomain"), // e.g., "mail.firstbaptist.org"
  emailFromName: text("emailFromName"), // Default "from" name
  emailReplyTo: text("emailReplyTo"), // Where replies should go
  emailSignature: text("emailSignature"),
  
  // Email service configuration
  emailServiceProvider: text("emailServiceProvider").default("sendgrid"), // sendgrid, postmark, ses
  emailApiKey: text("emailApiKey"),
  emailWebhookSecret: text("emailWebhookSecret"),
  
  // DNS verification status
  dnsSpfRecord: text("dnsSpfRecord"),
  dnsDkimRecord: text("dnsDkimRecord"),
  dnsDmarcRecord: text("dnsDmarcRecord"),
  dnsVerificationStatus: text("dnsVerificationStatus").default("pending"), // pending, verified, failed
  dnsLastChecked: integer("dnsLastChecked", { mode: "timestamp" }),
  
  // SMS settings
  smsPhoneNumber: text("smsPhoneNumber"), // Twilio phone number
  smsProvider: text("smsProvider").default("twilio"),
  smsApiKey: text("smsApiKey"),
  smsApiSecret: text("smsApiSecret"),
  smsAccountSid: text("smsAccountSid"),
  
  // SMS features
  enableTwoWaySms: integer("enableTwoWaySms", { mode: "boolean" }).notNull().default(true),
  smsAutoReply: text("smsAutoReply"), // Auto-reply message
  smsQuietHoursStart: text("smsQuietHoursStart").default("21:00"), // 9 PM
  smsQuietHoursEnd: text("smsQuietHoursEnd").default("08:00"), // 8 AM
  
  // Rate limiting
  emailDailyLimit: integer("emailDailyLimit").default(1000),
  smsDailyLimit: integer("smsDailyLimit").default(500),
  emailMonthlyUsage: integer("emailMonthlyUsage").default(0),
  smsMonthlyUsage: integer("smsMonthlyUsage").default(0),
  
  // Compliance settings
  enableUnsubscribeLink: integer("enableUnsubscribeLink", { mode: "boolean" }).notNull().default(true),
  unsubscribeText: text("unsubscribeText").default("Reply STOP to unsubscribe"),
  privacyPolicyUrl: text("privacyPolicyUrl"),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("communication_settings_church_id_idx").on(table.churchId),
  emailSubdomainIdx: index("communication_settings_email_subdomain_idx").on(table.emailSubdomain),
  smsPhoneIdx: index("communication_settings_sms_phone_idx").on(table.smsPhoneNumber),
}));

// Message templates for reusable content
export const messageTemplates = sqliteTable("message_templates", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  
  // Template identity
  name: text("name").notNull(),
  description: text("description"),
  category: text("category"), // "announcement", "welcome", "reminder", "emergency", "stewardship"
  
  // Template content
  messageType: text("messageType").notNull(), // "email", "sms", "both"
  emailSubject: text("emailSubject"),
  emailContent: text("emailContent"), // HTML content
  smsContent: text("smsContent"), // Plain text, 160 chars recommended
  
  // Template settings
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  isSystemTemplate: integer("isSystemTemplate", { mode: "boolean" }).notNull().default(false),
  useCount: integer("useCount").notNull().default(0),
  
  // Merge fields available
  availableMergeFields: text("availableMergeFields"), // JSON array of merge field names
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  lastUsed: integer("lastUsed", { mode: "timestamp" }),
}, (table) => ({
  churchIdIdx: index("message_templates_church_id_idx").on(table.churchId),
  categoryIdx: index("message_templates_category_idx").on(table.category),
  typeIdx: index("message_templates_type_idx").on(table.messageType),
  activeIdx: index("message_templates_active_idx").on(table.isActive),
}));

// Main messages table for sent communications
export const messages = sqliteTable("messages", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  templateId: text("templateId").references(() => messageTemplates.id, { onDelete: "set null" }),
  
  // Message identity
  type: text("type").notNull(), // "email", "sms"
  status: text("status").notNull().default("draft"), // draft, scheduled, sending, sent, failed, cancelled
  
  // Content
  subject: text("subject"), // For emails only
  content: text("content").notNull(), // HTML for email, plain text for SMS
  
  // Sender information
  fromName: text("fromName"),
  fromEmail: text("fromEmail"), // For email
  fromPhone: text("fromPhone"), // For SMS
  replyTo: text("replyTo"),
  
  // Targeting
  recipientType: text("recipientType").notNull(), // "all_members", "active_members", "visitors", "custom_selection", "individual"
  recipientCount: integer("recipientCount").notNull().default(0),
  recipientFilter: text("recipientFilter"), // JSON criteria for recipient selection
  
  // Scheduling
  scheduledFor: integer("scheduledFor", { mode: "timestamp" }),
  sentAt: integer("sentAt", { mode: "timestamp" }),
  
  // Tracking
  deliveredCount: integer("deliveredCount").notNull().default(0),
  openedCount: integer("openedCount").notNull().default(0), // Email only
  clickedCount: integer("clickedCount").notNull().default(0), // Email only
  repliedCount: integer("repliedCount").notNull().default(0), // SMS only
  failedCount: integer("failedCount").notNull().default(0),
  unsubscribedCount: integer("unsubscribedCount").notNull().default(0),
  
  // Cost tracking (for SMS)
  estimatedCost: integer("estimatedCost"), // Cost in cents
  actualCost: integer("actualCost"), // Actual cost in cents
  
  // Metadata
  campaignId: text("campaignId"), // For grouping related messages
  tags: text("tags"), // JSON array of tags
  notes: text("notes"),
  
  // Created by
  createdBy: text("createdBy").references(() => user.id, { onDelete: "set null" }),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("messages_church_id_idx").on(table.churchId),
  statusIdx: index("messages_status_idx").on(table.status),
  typeIdx: index("messages_type_idx").on(table.type),
  scheduledIdx: index("messages_scheduled_idx").on(table.scheduledFor),
  sentAtIdx: index("messages_sent_at_idx").on(table.sentAt),
  campaignIdx: index("messages_campaign_idx").on(table.campaignId),
}));

// Individual message recipients and their delivery status
export const messageRecipients = sqliteTable("message_recipients", {
  id: text("id").primaryKey(),
  messageId: text("messageId").notNull().references(() => messages.id, { onDelete: "cascade" }),
  memberId: text("memberId").references(() => members.id, { onDelete: "set null" }),
  
  // Recipient details
  email: text("email"), // For email messages
  phone: text("phone"), // For SMS messages
  firstName: text("firstName"),
  lastName: text("lastName"),
  
  // Delivery tracking
  status: text("status").notNull().default("pending"), // pending, sent, delivered, opened, clicked, failed, bounced, unsubscribed
  
  // External service IDs
  providerMessageId: text("providerMessageId"), // ID from email/SMS service
  
  // Delivery details
  sentAt: integer("sentAt", { mode: "timestamp" }),
  deliveredAt: integer("deliveredAt", { mode: "timestamp" }),
  openedAt: integer("openedAt", { mode: "timestamp" }), // Email only
  firstClickedAt: integer("firstClickedAt", { mode: "timestamp" }), // Email only
  repliedAt: integer("repliedAt", { mode: "timestamp" }), // SMS only
  
  // Error tracking
  errorCode: text("errorCode"),
  errorMessage: text("errorMessage"),
  retryCount: integer("retryCount").notNull().default(0),
  lastRetry: integer("lastRetry", { mode: "timestamp" }),
  
  // Personalization
  personalizedContent: text("personalizedContent"), // Content with merge fields filled
  mergeData: text("mergeData"), // JSON of merge field values used
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  messageIdIdx: index("message_recipients_message_id_idx").on(table.messageId),
  memberIdIdx: index("message_recipients_member_id_idx").on(table.memberId),
  statusIdx: index("message_recipients_status_idx").on(table.status),
  emailIdx: index("message_recipients_email_idx").on(table.email),
  phoneIdx: index("message_recipients_phone_idx").on(table.phone),
  providerIdIdx: index("message_recipients_provider_id_idx").on(table.providerMessageId),
}));

// SMS conversations for two-way messaging
export const smsConversations = sqliteTable("sms_conversations", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  memberId: text("memberId").references(() => members.id, { onDelete: "set null" }),
  
  // Conversation participants
  churchPhone: text("churchPhone").notNull(), // Church's SMS number
  memberPhone: text("memberPhone").notNull(), // Member's phone number
  memberName: text("memberName"), // For display purposes
  
  // Conversation metadata
  isActive: integer("isActive", { mode: "boolean" }).notNull().default(true),
  lastMessageAt: integer("lastMessageAt", { mode: "timestamp" }),
  messageCount: integer("messageCount").notNull().default(0),
  unreadCount: integer("unreadCount").notNull().default(0), // Unread messages from member
  
  // Status
  status: text("status").notNull().default("active"), // active, archived, blocked
  
  // Auto-reply settings
  autoReplyEnabled: integer("autoReplyEnabled", { mode: "boolean" }).notNull().default(true),
  lastAutoReply: integer("lastAutoReply", { mode: "timestamp" }),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("sms_conversations_church_id_idx").on(table.churchId),
  memberIdIdx: index("sms_conversations_member_id_idx").on(table.memberId),
  churchPhoneIdx: index("sms_conversations_church_phone_idx").on(table.churchPhone),
  memberPhoneIdx: index("sms_conversations_member_phone_idx").on(table.memberPhone),
  statusIdx: index("sms_conversations_status_idx").on(table.status),
  lastMessageIdx: index("sms_conversations_last_message_idx").on(table.lastMessageAt),
}));

// Individual SMS messages within conversations
export const smsMessages = sqliteTable("sms_messages", {
  id: text("id").primaryKey(),
  conversationId: text("conversationId").notNull().references(() => smsConversations.id, { onDelete: "cascade" }),
  messageId: text("messageId").references(() => messages.id, { onDelete: "set null" }), // Link to bulk message if applicable
  
  // Message details
  direction: text("direction").notNull(), // "inbound", "outbound"
  content: text("content").notNull(),
  
  // Sender/receiver info
  fromPhone: text("fromPhone").notNull(),
  toPhone: text("toPhone").notNull(),
  
  // Provider details
  providerMessageId: text("providerMessageId"), // Twilio SID
  providerId: text("providerId"), // Which provider sent this
  
  // Message status
  status: text("status").notNull().default("pending"), // pending, sent, delivered, failed, received
  
  // Delivery tracking
  sentAt: integer("sentAt", { mode: "timestamp" }),
  deliveredAt: integer("deliveredAt", { mode: "timestamp" }),
  readAt: integer("readAt", { mode: "timestamp" }), // When admin marked as read
  
  // Error tracking
  errorCode: text("errorCode"),
  errorMessage: text("errorMessage"),
  
  // Message type
  messageType: text("messageType").default("text"), // text, media, auto_reply
  mediaUrls: text("mediaUrls"), // JSON array of media URLs
  
  // Cost
  cost: integer("cost"), // Cost in cents
  
  // Auto-reply
  isAutoReply: integer("isAutoReply", { mode: "boolean" }).notNull().default(false),
  triggeredBy: text("triggeredBy"), // What triggered the auto-reply
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  conversationIdIdx: index("sms_messages_conversation_id_idx").on(table.conversationId),
  messageIdIdx: index("sms_messages_message_id_idx").on(table.messageId),
  directionIdx: index("sms_messages_direction_idx").on(table.direction),
  statusIdx: index("sms_messages_status_idx").on(table.status),
  sentAtIdx: index("sms_messages_sent_at_idx").on(table.sentAt),
  providerIdIdx: index("sms_messages_provider_id_idx").on(table.providerMessageId),
  fromPhoneIdx: index("sms_messages_from_phone_idx").on(table.fromPhone),
  toPhoneIdx: index("sms_messages_to_phone_idx").on(table.toPhone),
}));

// Communication preferences for members
export const communicationPreferences = sqliteTable("communication_preferences", {
  id: text("id").primaryKey(),
  memberId: text("memberId").notNull().references(() => members.id, { onDelete: "cascade" }),
  
  // Email preferences
  emailOptIn: integer("emailOptIn", { mode: "boolean" }).notNull().default(true),
  emailCategories: text("emailCategories"), // JSON array of categories they want to receive
  emailFrequency: text("emailFrequency").default("all"), // all, weekly_digest, monthly_digest, important_only
  
  // SMS preferences
  smsOptIn: integer("smsOptIn", { mode: "boolean" }).notNull().default(false), // Default opt-out for compliance
  smsCategories: text("smsCategories"), // JSON array of SMS categories
  smsQuietHours: integer("smsQuietHours", { mode: "boolean" }).notNull().default(true),
  
  // Unsubscribe tracking
  emailUnsubscribedAt: integer("emailUnsubscribedAt", { mode: "timestamp" }),
  smsUnsubscribedAt: integer("smsUnsubscribedAt", { mode: "timestamp" }),
  unsubscribeReason: text("unsubscribeReason"),
  
  // Bounce tracking
  emailBounceCount: integer("emailBounceCount").notNull().default(0),
  emailLastBounce: integer("emailLastBounce", { mode: "timestamp" }),
  smsBounceCount: integer("smsBounceCount").notNull().default(0),
  smsLastBounce: integer("smsLastBounce", { mode: "timestamp" }),
  
  // Preferred contact method
  preferredMethod: text("preferredMethod").default("email"), // email, sms, both, none
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updatedAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  memberIdIdx: index("communication_preferences_member_id_idx").on(table.memberId),
  emailOptInIdx: index("communication_preferences_email_opt_in_idx").on(table.emailOptIn),
  smsOptInIdx: index("communication_preferences_sms_opt_in_idx").on(table.smsOptIn),
  preferredMethodIdx: index("communication_preferences_preferred_method_idx").on(table.preferredMethod),
}));

// Webhook events from email/SMS providers
export const communicationWebhooks = sqliteTable("communication_webhooks", {
  id: text("id").primaryKey(),
  churchId: text("churchId").notNull().references(() => churches.id, { onDelete: "cascade" }),
  
  // Webhook details
  provider: text("provider").notNull(), // "sendgrid", "twilio", "postmark"
  eventType: text("eventType").notNull(), // "delivered", "bounce", "open", "click", "unsubscribe", "spam"
  
  // Related records
  messageId: text("messageId").references(() => messages.id, { onDelete: "set null" }),
  recipientId: text("recipientId").references(() => messageRecipients.id, { onDelete: "set null" }),
  conversationId: text("conversationId").references(() => smsConversations.id, { onDelete: "set null" }),
  
  // Webhook payload
  providerEventId: text("providerEventId"), // Provider's event ID
  rawPayload: text("rawPayload").notNull(), // Full webhook payload as JSON
  
  // Processing status
  processed: integer("processed", { mode: "boolean" }).notNull().default(false),
  processedAt: integer("processedAt", { mode: "timestamp" }),
  processingError: text("processingError"),
  
  // Timestamps
  createdAt: integer("createdAt", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
}, (table) => ({
  churchIdIdx: index("communication_webhooks_church_id_idx").on(table.churchId),
  providerIdx: index("communication_webhooks_provider_idx").on(table.provider),
  eventTypeIdx: index("communication_webhooks_event_type_idx").on(table.eventType),
  messageIdIdx: index("communication_webhooks_message_id_idx").on(table.messageId),
  recipientIdIdx: index("communication_webhooks_recipient_id_idx").on(table.recipientId),
  processedIdx: index("communication_webhooks_processed_idx").on(table.processed),
  providerEventIdx: index("communication_webhooks_provider_event_idx").on(table.providerEventId),
}));
