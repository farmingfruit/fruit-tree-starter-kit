# Event Registration System API Specification

## Overview
This document defines the REST API endpoints for the revolutionary church event registration system. The API is designed to support progressive recognition, magic link authentication, family registrations, and seamless integration with existing church management workflows.

## Authentication & Security

### Magic Link Authentication
All public form endpoints support magic link authentication for returning users.

```http
POST /api/auth/magic-link
Content-Type: application/json

{
  "email": "john@example.com",
  "church_slug": "first-baptist-chicago",
  "purpose": "form_access",
  "form_id": "form_abc123",
  "redirect_url": "https://church.example.com/events/christmas-dinner/register"
}

Response 200:
{
  "success": true,
  "message": "Magic link sent to john@example.com",
  "expires_in": 900, // 15 minutes
  "rate_limit": {
    "remaining": 4,
    "reset_at": "2024-01-15T10:30:00Z"
  }
}
```

### Token Validation
```http
GET /api/auth/verify-token?token=magic_abc123&church_slug=first-baptist

Response 200:
{
  "valid": true,
  "email": "john@example.com", 
  "person_profile_id": "prof_abc123",
  "expires_at": "2024-01-15T10:30:00Z",
  "permissions": ["form_access", "submission_edit"]
}
```

## Progressive Recognition API

### Profile Recognition Endpoint
This is the core endpoint that powers the "looks like you're already in our system!" experience.

```http
POST /api/recognition/check
Content-Type: application/json
Authorization: Bearer <token> OR Anonymous

{
  "church_id": "church_abc123",
  "email": "john.smith@gmail.com",
  "phone": "+1 (555) 123-4567",
  "first_name": "John",
  "last_name": "Smith",
  "zip_code": "60601",
  "context": {
    "form_id": "form_abc123",
    "event_id": "event_xyz789"
  }
}

Response 200 - High Confidence Match (98%+):
{
  "recognition": {
    "status": "auto_linked",
    "confidence": 98,
    "profile_id": "prof_abc123",
    "member_id": "member_def456", // If linked to a member
    "display_message": "Welcome back, John! We've pre-filled your information.",
    "prefill_data": {
      "first_name": "John",
      "last_name": "Smith",
      "email": "j***@gmail.com", // Masked for privacy
      "phone": "(***) ***-4567",
      "address": "123 Main St",
      "city": "Chicago",
      "state": "IL",
      "zip_code": "60601"
    },
    "family_members": [
      {
        "id": "prof_family1",
        "name": "Jane Smith",
        "relationship": "spouse",
        "masked_email": "j***@gmail.com"
      },
      {
        "id": "prof_family2", 
        "name": "Johnny Smith",
        "relationship": "child",
        "age": 12
      }
    ],
    "previous_registrations": [
      {
        "event_name": "Christmas Dinner 2023",
        "date": "2023-12-24T18:00:00Z",
        "status": "attended"
      }
    ],
    "allow_edit": true
  }
}

Response 200 - Medium Confidence (85-97%):
{
  "recognition": {
    "status": "suggest_match", 
    "confidence": 91,
    "profile_id": "prof_abc123",
    "display_message": "It looks like you might have registered with us before. Is this you?",
    "candidate_profile": {
      "masked_name": "John S.",
      "masked_email": "j***@gmail.com",
      "masked_phone": "(***) ***-4567",
      "last_activity": "2023-12-24T18:00:00Z"
    },
    "actions": [
      {
        "type": "confirm_match",
        "label": "Yes, that's me",
        "endpoint": "/api/recognition/confirm"
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

Response 200 - No Match:
{
  "recognition": {
    "status": "no_match",
    "confidence": 0,
    "display_message": null,
    "new_profile": true
  }
}
```

### Confirm Recognition Match
```http
POST /api/recognition/confirm
Content-Type: application/json

{
  "profile_id": "prof_abc123",
  "confirmed": true,
  "church_id": "church_abc123"
}

Response 200:
{
  "success": true,
  "profile": {
    "id": "prof_abc123",
    "prefill_data": { /* full profile data */ },
    "family_members": [ /* family data */ ]
  }
}
```

## Event Management API

### List Events
```http
GET /api/churches/{church_id}/events?status=published&visibility=public&limit=20&offset=0

Response 200:
{
  "events": [
    {
      "id": "event_abc123",
      "name": "Christmas Dinner",
      "slug": "christmas-dinner-2024", 
      "short_description": "Annual community Christmas dinner",
      "start_date": "2024-12-24T18:00:00Z",
      "end_date": "2024-12-24T21:00:00Z",
      "location": {
        "type": "physical",
        "name": "Fellowship Hall",
        "address": "123 Church St, Chicago, IL 60601"
      },
      "registration": {
        "required": true,
        "opens_at": "2024-11-01T00:00:00Z",
        "closes_at": "2024-12-20T23:59:59Z",
        "spots_available": 45,
        "total_capacity": 100,
        "waitlist_enabled": true
      },
      "pricing": {
        "is_free": false,
        "base_price": 2500, // $25.00 in cents
        "early_bird_price": 2000, // $20.00 in cents
        "member_price": 1500, // $15.00 in cents
        "early_bird_ends": "2024-12-01T23:59:59Z"
      },
      "featured_image_url": "https://cdn.church.com/christmas-dinner.jpg",
      "registration_form_id": "form_xyz789"
    }
  ],
  "pagination": {
    "total": 25,
    "limit": 20,
    "offset": 0,
    "has_more": true
  }
}
```

### Get Event Details
```http
GET /api/churches/{church_id}/events/{event_slug}

Response 200:
{
  "event": {
    "id": "event_abc123",
    "name": "Christmas Dinner",
    "description": "Full event description here...",
    "category": "social",
    "event_type": "single",
    /* ... all event fields ... */
    "sessions": [
      {
        "id": "session_1",
        "name": "Dinner Service",
        "start_date": "2024-12-24T18:00:00Z",
        "end_date": "2024-12-24T21:00:00Z",
        "is_required": true
      }
    ],
    "organizer": {
      "name": "Pastor Johnson",
      "email": "pastor@church.com",
      "phone": "(555) 123-4567"
    },
    "registration_stats": {
      "total_registered": 55,
      "capacity": 100,
      "waitlist_count": 8,
      "revenue": 137500 // $1,375.00 in cents
    }
  }
}
```

## Form Management API

### Get Registration Form
```http
GET /api/churches/{church_id}/forms/{form_slug}?event_id={event_id}&auth_token={magic_token}

Response 200:
{
  "form": {
    "id": "form_abc123",
    "name": "Christmas Dinner Registration",
    "description": "Register for our annual Christmas dinner",
    "form_type": "registration", 
    "event_id": "event_abc123",
    "settings": {
      "enable_family_registration": true,
      "requires_payment": true,
      "payment_amount": 2500,
      "allow_partial_payment": false
    },
    "brand_settings": {
      "primary_color": "#1e40af",
      "logo_url": "https://church.com/logo.png",
      "custom_css": "/* custom styles */"
    },
    "schema": {
      "fields": [
        {
          "id": "first_name",
          "type": "text",
          "label": "First Name",
          "required": true,
          "validation": {
            "min_length": 2,
            "max_length": 50
          }
        },
        {
          "id": "email",
          "type": "email", 
          "label": "Email Address",
          "required": true,
          "validation": {
            "format": "email"
          }
        },
        {
          "id": "dietary_restrictions",
          "type": "select_multiple",
          "label": "Dietary Restrictions",
          "options": [
            {"value": "vegetarian", "label": "Vegetarian"},
            {"value": "vegan", "label": "Vegan"},
            {"value": "gluten_free", "label": "Gluten Free"},
            {"value": "none", "label": "None"}
          ]
        },
        {
          "id": "emergency_contact",
          "type": "group",
          "label": "Emergency Contact",
          "fields": [
            {
              "id": "name",
              "type": "text",
              "label": "Contact Name", 
              "required": true
            },
            {
              "id": "phone",
              "type": "phone",
              "label": "Phone Number",
              "required": true
            }
          ]
        }
      ]
    },
    "status": {
      "is_open": true,
      "closes_in": 2419200, // seconds until closes
      "spots_remaining": 45
    }
  },
  "prefill_data": { /* from progressive recognition */ },
  "family_members": [ /* if family registration enabled */ ]
}
```

### Submit Registration Form
```http
POST /api/churches/{church_id}/forms/{form_id}/submit
Content-Type: application/json

{
  "form_data": {
    "first_name": "John", 
    "last_name": "Smith",
    "email": "john@example.com",
    "phone": "+1 (555) 123-4567",
    "dietary_restrictions": ["vegetarian"],
    "emergency_contact": {
      "name": "Jane Smith",
      "phone": "+1 (555) 123-4568"
    }
  },
  "family_members": [
    {
      "first_name": "Jane",
      "last_name": "Smith", 
      "email": "jane@example.com",
      "relationship": "spouse",
      "dietary_restrictions": ["none"]
    },
    {
      "first_name": "Johnny",
      "last_name": "Smith",
      "date_of_birth": "2012-05-15",
      "relationship": "child",
      "dietary_restrictions": ["none"]
    }
  ],
  "recognition": {
    "profile_id": "prof_abc123", // If recognized user
    "confirmed_match": true
  },
  "payment": {
    "total_amount": 7500, // $75.00 for family of 3
    "payment_method": "stripe",
    "process_immediately": true
  },
  "metadata": {
    "referrer": "https://church.com/events",
    "user_agent": "Mozilla/5.0...",
    "ip_address": "192.168.1.1"
  }
}

Response 201 - Success:
{
  "submission": {
    "id": "sub_abc123",
    "status": "submitted",
    "confirmation_number": "CHR-2024-001234",
    "total_attendees": 3,
    "payment": {
      "amount": 7500,
      "status": "completed",
      "stripe_payment_intent": "pi_abc123"
    }
  },
  "next_steps": {
    "confirmation_email_sent": true,
    "calendar_link": "https://calendar.google.com/...",
    "edit_link": "https://church.com/registrations/sub_abc123/edit?token=abc123"
  },
  "redirect_url": "https://church.com/events/christmas-dinner/confirmation"
}

Response 409 - Event Full:
{
  "error": "event_full",
  "message": "This event is at capacity",
  "waitlist": {
    "available": true,
    "position": 9,
    "estimated_notification": "2024-12-15T12:00:00Z"
  }
}

Response 422 - Validation Error:
{
  "error": "validation_failed",
  "errors": [
    {
      "field": "email",
      "message": "Email address is required"
    },
    {
      "field": "family_members[0].date_of_birth", 
      "message": "Date of birth is required for minors"
    }
  ]
}
```

## Waitlist Management API

### Join Waitlist
```http
POST /api/churches/{church_id}/events/{event_id}/waitlist
Content-Type: application/json

{
  "email": "john@example.com",
  "name": "John Smith",
  "phone": "+1 (555) 123-4567",
  "party_size": 3,
  "form_data": { /* partial form data */ }
}

Response 201:
{
  "waitlist_entry": {
    "id": "wait_abc123",
    "position": 9,
    "party_size": 3,
    "estimated_notification": "2024-12-15T12:00:00Z",
    "status": "active"
  },
  "notification_settings": {
    "email_notifications": true,
    "sms_notifications": false
  }
}
```

### Check Waitlist Status
```http
GET /api/waitlist/{waitlist_id}/status?email=john@example.com

Response 200:
{
  "status": "active",
  "position": 7, // Moved up 2 spots
  "party_size": 3,
  "estimated_notification": "2024-12-14T12:00:00Z",
  "notifications_sent": 2,
  "last_notification": "2024-12-10T10:00:00Z"
}
```

## Admin Dashboard API

### Admin Review Queue
```http
GET /api/admin/churches/{church_id}/review-queue?status=pending&priority=high

Response 200:
{
  "queue_items": [
    {
      "id": "review_abc123",
      "item_type": "profile_match",
      "priority": "high", 
      "title": "Potential duplicate profile",
      "description": "John Smith may match existing member John J. Smith",
      "review_data": {
        "source_profile": {
          "id": "prof_new123",
          "name": "John Smith",
          "email": "john.smith@gmail.com"
        },
        "candidate_matches": [
          {
            "id": "member_existing456",
            "name": "John J. Smith", 
            "email": "john.j.smith@gmail.com",
            "confidence": 87,
            "match_reasons": ["similar_name", "same_address"]
          }
        ]
      },
      "created_at": "2024-01-15T10:00:00Z",
      "auto_resolve_at": "2024-01-22T10:00:00Z"
    }
  ],
  "summary": {
    "pending": 12,
    "high_priority": 3,
    "overdue": 1
  }
}
```

### Process Review Item
```http
POST /api/admin/review-queue/{item_id}/process
Content-Type: application/json

{
  "action": "merge_profiles",
  "notes": "Same person, confirmed via phone call",
  "merge_target": "member_existing456",
  "merge_source": "prof_new123"
}

Response 200:
{
  "success": true,
  "result": {
    "action_taken": "merge_profiles",
    "merged_profile_id": "member_existing456",
    "notifications_sent": 1
  }
}
```

### Registration Analytics
```http
GET /api/admin/churches/{church_id}/analytics/registrations?period=month&start_date=2024-01-01

Response 200:
{
  "metrics": {
    "total_registrations": 234,
    "total_revenue": 587500, // $5,875.00
    "conversion_rate": 0.78, // 78% completion rate
    "average_registration_time": 180, // 3 minutes
    "top_events": [
      {
        "event_name": "Christmas Dinner",
        "registrations": 89,
        "revenue": 222500
      }
    ]
  },
  "trends": {
    "registrations_by_day": [
      {"date": "2024-01-01", "count": 12},
      {"date": "2024-01-02", "count": 8}
    ],
    "recognition_accuracy": {
      "auto_linked": 156, // 98%+ confidence
      "suggested": 42,    // 85-97% confidence  
      "manual_review": 18, // Admin intervention needed
      "false_positives": 3
    }
  }
}
```

## Integration Endpoints

### Stripe Webhook Handler
```http
POST /api/webhooks/stripe
Content-Type: application/json
Stripe-Signature: stripe_signature_header

{
  "type": "payment_intent.succeeded",
  "data": {
    "object": {
      "id": "pi_abc123",
      "metadata": {
        "submission_id": "sub_abc123",
        "church_id": "church_abc123"
      }
    }
  }
}

Response 200:
{
  "received": true
}
```

### External Calendar Integration
```http
POST /api/integrations/calendar/sync
Content-Type: application/json

{
  "church_id": "church_abc123", 
  "provider": "google_calendar",
  "event_id": "event_abc123"
}

Response 200:
{
  "success": true,
  "calendar_event_id": "google_cal_event_123",
  "calendar_url": "https://calendar.google.com/event/..."
}
```

## Error Handling

### Standard Error Format
```json
{
  "error": "error_code",
  "message": "Human readable error message",
  "details": {
    "field": "specific_field_with_error",
    "code": "validation_code"
  },
  "request_id": "req_abc123",
  "timestamp": "2024-01-15T10:00:00Z"
}
```

### Common Error Codes
- `church_not_found` - Church doesn't exist or access denied
- `event_not_found` - Event doesn't exist or not visible
- `form_not_found` - Form doesn't exist or not active  
- `event_full` - Event at capacity, waitlist may be available
- `registration_closed` - Registration period has ended
- `payment_failed` - Payment processing failed
- `validation_failed` - Form validation errors
- `rate_limit_exceeded` - Too many requests
- `auth_required` - Authentication required for this action
- `insufficient_permissions` - User lacks required permissions

## Rate Limiting

All endpoints are rate limited by church and IP address:
- Public endpoints: 100 requests per minute per IP
- Admin endpoints: 500 requests per minute per authenticated user
- Magic link generation: 5 requests per minute per email
- Recognition checks: 50 requests per minute per church

Rate limit headers included in all responses:
```http
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1642249200
```

This API design provides a seamless, secure, and powerful foundation for the revolutionary church event registration system.