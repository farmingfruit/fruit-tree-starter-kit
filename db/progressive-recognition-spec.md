# Progressive Recognition System Technical Specification

## Overview
The Progressive Recognition System is the core differentiator that makes our church event registration system revolutionary. It intelligently identifies returning visitors and members, creating a seamless "looks like you're already in our system!" experience while maintaining privacy and security.

## Core Algorithm Components

### 1. Identity Matching Pipeline

#### Step 1: Exact Matches (Confidence: 98-100%)
```sql
-- Email exact match
SELECT pp.*, m.first_name, m.last_name 
FROM person_profiles pp
LEFT JOIN members m ON pp.member_id = m.id
WHERE pp.church_id = ? 
  AND pp.email = ? 
  AND pp.profile_status != 'merged'
LIMIT 1;

-- Phone exact match (normalized)
SELECT pp.*, m.first_name, m.last_name 
FROM person_profiles pp
LEFT JOIN members m ON pp.member_id = m.id
WHERE pp.church_id = ? 
  AND pp.phone = normalize_phone(?)
  AND pp.profile_status != 'merged'
LIMIT 1;
```

#### Step 2: Fuzzy Matches (Confidence: 85-97%)
```javascript
// Email domain variations
const emailVariations = [
  'john.smith@gmail.com',
  'johnsmith@gmail.com', 
  'j.smith@gmail.com',
  'john.smith@googlemail.com' // Gmail alias
];

// Phone format variations
const phoneVariations = [
  '+1 (555) 123-4567',
  '555-123-4567',
  '5551234567',
  '(555) 123-4567'
];
```

#### Step 3: Name + Context Matches (Confidence: 70-84%)
```sql
-- Name similarity with address context
SELECT 
  pp.*,
  similarity(pp.first_name || ' ' || pp.last_name, ? || ' ' || ?) as name_score,
  CASE WHEN pp.zip_code = ? THEN 20 ELSE 0 END as zip_bonus,
  CASE WHEN pp.city = ? THEN 15 ELSE 0 END as city_bonus
FROM person_profiles pp
WHERE pp.church_id = ?
  AND (
    similarity(pp.first_name, ?) > 0.8 OR
    similarity(pp.last_name, ?) > 0.8
  )
ORDER BY (name_score * 50 + zip_bonus + city_bonus) DESC
LIMIT 5;
```

### 2. Confidence Scoring Algorithm

#### Base Scoring Matrix
```javascript
const confidenceFactors = {
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
};
```

#### Confidence Calculation
```javascript
function calculateConfidence(candidate, inputData) {
  let score = 0;
  let maxPossible = 100;
  
  // Email matching
  if (candidate.email === inputData.email) {
    score += confidenceFactors.emailExact;
  } else if (emailDomainMatch(candidate.email, inputData.email)) {
    score += confidenceFactors.emailDomain;
  }
  
  // Phone matching
  if (normalizePhone(candidate.phone) === normalizePhone(inputData.phone)) {
    score += confidenceFactors.phoneExact;
  }
  
  // Name matching
  const nameScore = calculateNameSimilarity(candidate, inputData);
  score += nameScore;
  
  // Context matching
  const contextScore = calculateContextScore(candidate, inputData);
  score += contextScore;
  
  // Apply penalties
  const penalties = calculatePenalties(candidate, inputData);
  score += penalties;
  
  // Normalize to 0-100 scale
  return Math.min(100, Math.max(0, (score / maxPossible) * 100));
}
```

### 3. Progressive Recognition UI Flow

#### High Confidence (98%+) - Auto-Link
```javascript
// Immediate recognition with pre-filled form
{
  "recognition": {
    "status": "auto_linked",
    "confidence": 98,
    "profile_id": "prof_abc123",
    "display_message": "Welcome back, John! We've pre-filled your information.",
    "prefill_data": {
      "first_name": "John",
      "last_name": "Smith", 
      "email": "j***@gmail.com", // Masked for privacy
      "phone": "(***) ***-4567"
    },
    "allow_edit": true
  }
}
```

#### Medium Confidence (85-97%) - Suggest with Confirmation
```javascript
// Show recognition prompt with option to confirm or start fresh
{
  "recognition": {
    "status": "suggest_match",
    "confidence": 91,
    "display_message": "It looks like you might have registered with us before as John Smith (j***@gmail.com). Is this you?",
    "actions": [
      {
        "type": "confirm_match",
        "label": "Yes, that's me",
        "prefill_data": { /* masked data */ }
      },
      {
        "type": "start_fresh", 
        "label": "No, this is my first time"
      },
      {
        "type": "different_person",
        "label": "That's someone else"
      }
    ]
  }
}
```

#### Low Confidence (70-84%) - Silent Admin Queue
```javascript
// No user interruption, but queue for admin review
{
  "recognition": {
    "status": "no_match",
    "confidence": 0,
    "display_message": null
  },
  "admin_queue": {
    "type": "potential_match",
    "confidence": 78,
    "reasons": ["similar_name", "same_zip_code"],
    "requires_review": true
  }
}
```

### 4. Data Privacy & Masking

#### Email Masking Strategy
```javascript
function maskEmail(email) {
  const [local, domain] = email.split('@');
  const maskedLocal = local.length > 3 
    ? local[0] + '*'.repeat(local.length - 2) + local[local.length - 1]
    : '*'.repeat(local.length);
  return `${maskedLocal}@${domain}`;
}

// Examples:
// john.smith@gmail.com → j***h@gmail.com
// j@domain.com → *@domain.com
```

#### Phone Number Masking
```javascript
function maskPhone(phone) {
  const normalized = normalizePhone(phone);
  return normalized.replace(/(\d{3})\d{3}(\d{4})/, '($1) ***-$2');
}

// Example: +1 (555) 123-4567 → (555) ***-4567
```

### 5. Admin Review Queue Algorithm

#### Auto-Queue Triggers
```javascript
const adminReviewTriggers = {
  // Confidence-based queuing
  mediumConfidenceMatch: (confidence) => confidence >= 85 && confidence < 98,
  
  // Conflict detection
  emailConflict: (profile, input) => 
    profile.email !== input.email && 
    profile.first_name === input.first_name &&
    profile.last_name === input.last_name,
    
  // Family relationship detection
  potentialFamilyMember: (profile, input) =>
    profile.last_name === input.last_name &&
    profile.address === input.address &&
    !profile.member_id, // Not already linked to a member
    
  // Duplicate submission detection
  duplicateSubmission: (submissions, newSubmission) =>
    submissions.some(s => 
      s.form_id === newSubmission.form_id &&
      s.submitter_email === newSubmission.submitter_email &&
      timeDiff(s.submitted_at, newSubmission.submitted_at) < 3600 // 1 hour
    )
};
```

#### Review Priority Scoring
```javascript
function calculateReviewPriority(match) {
  let priority = 'medium';
  
  if (match.confidence > 95) priority = 'high';
  if (match.has_payment_conflict) priority = 'urgent';
  if (match.family_relationship_detected) priority = 'high';
  if (match.duplicate_submission) priority = 'urgent';
  if (match.age < 18 && match.parent_consent_missing) priority = 'urgent';
  
  return priority;
}
```

### 6. Performance Optimization

#### Caching Strategy
```javascript
// Redis cache for frequently accessed profiles
const cacheKey = `profile:${churchId}:${emailHash}`;
const cachedProfile = await redis.get(cacheKey);

if (!cachedProfile) {
  const profile = await db.getPersonProfile(churchId, email);
  await redis.setex(cacheKey, 3600, JSON.stringify(profile)); // 1 hour cache
  return profile;
}
```

#### Database Optimization
```sql
-- Optimized lookup query for progressive recognition
CREATE INDEX idx_person_profiles_recognition_lookup 
ON person_profiles(church_id, email, phone, profile_status) 
WHERE profile_status != 'merged';

-- Partial index for active profiles only
CREATE INDEX idx_person_profiles_active_recognition
ON person_profiles(church_id, email) 
WHERE profile_status IN ('verified', 'unverified');
```

### 7. Machine Learning Enhancement (Future)

#### Training Data Collection
```javascript
// Collect feedback on recognition accuracy
const recognitionFeedback = {
  match_id: 'match_abc123',
  user_confirmed: true, // User said "yes, that's me"
  confidence_score: 91,
  match_factors: ['email_domain', 'same_zip_code', 'similar_name'],
  timestamp: Date.now()
};
```

#### Confidence Score Refinement
- Track confirmation rates by confidence level
- Adjust thresholds based on church-specific patterns
- Learn from admin review decisions
- Identify patterns in false positives/negatives

### 8. Integration with Form System

#### Form Field Auto-Population
```javascript
// When confidence > 85%, pre-populate form fields
function populateFormFromProfile(profile, confidence) {
  const prefillData = {};
  
  if (confidence > 90) {
    // High confidence - fill most fields
    prefillData.first_name = profile.first_name;
    prefillData.last_name = profile.last_name;
    prefillData.email = profile.email;
    prefillData.phone = profile.phone;
  } else if (confidence > 85) {
    // Medium confidence - fill basic fields only
    prefillData.first_name = profile.first_name;
    prefillData.last_name = profile.last_name;
  }
  
  return {
    prefill_data: prefillData,
    allow_edit: true,
    show_recognition_message: true
  };
}
```

#### Family Member Recognition
```javascript
// Detect family relationships and offer family registration
function detectFamilyMembers(profile, inputData) {
  if (!profile.family_id) return null;
  
  return db.query(`
    SELECT pp.*, m.first_name, m.last_name, m.date_of_birth
    FROM person_profiles pp
    LEFT JOIN members m ON pp.member_id = m.id  
    WHERE pp.family_id = ? 
      AND pp.id != ?
      AND pp.profile_status != 'merged'
    ORDER BY m.date_of_birth ASC
  `, [profile.family_id, profile.id]);
}
```

## Security Considerations

### Data Protection
1. **Email/Phone Hashing**: Store hashed versions for matching while preserving privacy
2. **PII Encryption**: Encrypt sensitive fields at rest
3. **Access Logging**: Log all profile access for audit trails
4. **Data Retention**: Automatically purge unverified profiles after 90 days

### Anti-Abuse Measures
1. **Rate Limiting**: Prevent reconnaissance attacks on recognition endpoint
2. **IP Tracking**: Monitor for suspicious patterns
3. **Honeypot Detection**: Flag automated form submissions
4. **Church Isolation**: Strict multi-tenant data isolation

### Privacy Compliance
1. **GDPR Right to be Forgotten**: Support profile deletion and unlinking
2. **Data Portability**: Export recognition data on request  
3. **Consent Management**: Track and respect privacy preferences
4. **Anonymization**: Option to participate anonymously in events

This progressive recognition system creates a magical user experience while maintaining the highest standards of privacy, security, and data integrity that churches require.