/**
 * Progressive Recognition Components
 * 
 * This module exports all components related to the progressive recognition system.
 * These components work together to provide the magical "looks like you're already
 * in our system" experience for church event registrations.
 */

// Core provider and hooks
export { RecognitionProvider, useRecognition, useFormRecognition } from './recognition-provider';

// UI components
export { RecognitionBanner, CompactRecognitionBanner } from './recognition-banner';
export { 
  RecognitionFormField,
  RecognitionEmailField,
  RecognitionPhoneField,
  RecognitionFirstNameField,
  RecognitionLastNameField
} from './recognition-form-field';

// Admin components
export { AdminReviewQueue } from './admin-review-queue';

// Family and household components
export { FamilyRegistration } from './family-registration';

// Analytics components
export { AnalyticsDashboard } from './analytics-dashboard';

// Re-export types for convenience
export type { RecognitionInput, RecognitionResult, RecognitionMatch } from '@/lib/progressive-recognition';