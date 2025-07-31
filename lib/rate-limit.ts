/**
 * Rate Limiting Utility
 * 
 * Provides rate limiting functionality for API endpoints to prevent abuse
 * and ensure fair usage across all churches using the platform.
 */

import { NextRequest } from "next/server";

interface RateLimitConfig {
  window: number; // Time window in milliseconds
  max: number;    // Maximum requests allowed in the window
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfter?: number;
}

// In-memory store for rate limiting
// In production, this should be replaced with Redis or another persistent store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Cleanup old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitStore.entries()) {
    if (now > value.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 5 * 60 * 1000);

/**
 * Get client identifier from request
 */
function getClientId(request: NextRequest): string {
  // Try to get IP address from various headers
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0] || real || 'unknown';
  
  // Include user agent for additional uniqueness
  const userAgent = request.headers.get('user-agent') || '';
  const userAgentHash = userAgent ? 
    Buffer.from(userAgent).toString('base64').substring(0, 8) : 'unknown';
  
  return `${ip}:${userAgentHash}`;
}

/**
 * Rate limiting function
 */
export function rateLimit(config: RateLimitConfig) {
  return async (request: NextRequest): Promise<RateLimitResult> => {
    const clientId = getClientId(request);
    const now = Date.now();
    const windowStart = now - config.window;
    
    // Get or create rate limit entry
    let entry = rateLimitStore.get(clientId);
    
    if (!entry || now > entry.resetTime) {
      // Create new entry or reset expired one
      entry = {
        count: 0,
        resetTime: now + config.window
      };
    }
    
    // Check if limit exceeded
    if (entry.count >= config.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      return {
        success: false,
        remaining: 0,
        retryAfter
      };
    }
    
    // Increment counter
    entry.count++;
    rateLimitStore.set(clientId, entry);
    
    return {
      success: true,
      remaining: config.max - entry.count
    };
  };
}

/**
 * Church-specific rate limiting
 * More restrictive limits for church data access
 */
export const churchDataRateLimit = rateLimit({
  window: 300000, // 5 minutes
  max: 50 // 50 requests per 5 minutes
});

/**
 * Recognition-specific rate limiting
 * Balanced for real-time usage while preventing abuse
 */
export const recognitionRateLimit = rateLimit({
  window: 900000, // 15 minutes
  max: 100 // 100 recognition requests per 15 minutes
});

/**
 * Admin action rate limiting
 * More restrictive for sensitive operations
 */
export const adminActionRateLimit = rateLimit({
  window: 600000, // 10 minutes
  max: 20 // 20 admin actions per 10 minutes
});