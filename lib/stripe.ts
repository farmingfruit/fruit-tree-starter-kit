// Server-side Stripe configuration (for API routes only)
// Re-export from stripe-server for backward compatibility
export { stripe } from './stripe-server';

// Re-export utility functions (safe for client-side use)
export { formatAmountForDisplay, formatAmountForStripe } from './stripe-utils';