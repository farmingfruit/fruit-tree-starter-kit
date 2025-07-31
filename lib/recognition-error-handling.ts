/**
 * Progressive Recognition Error Handling System
 * 
 * This module provides comprehensive error handling and fallback mechanisms
 * for the progressive recognition system. It ensures graceful degradation
 * when recognition fails while maintaining a positive user experience.
 */

import { RecognitionResult, RecognitionInput } from "./progressive-recognition";

// ============================================================================
// Error Types and Classes
// ============================================================================

export class RecognitionError extends Error {
  public readonly code: string;
  public readonly severity: 'low' | 'medium' | 'high' | 'critical';
  public readonly isRetryable: boolean;
  public readonly userMessage: string;
  public readonly metadata: Record<string, any>;

  constructor(
    message: string,
    code: string,
    severity: 'low' | 'medium' | 'high' | 'critical' = 'medium',
    isRetryable: boolean = false,
    userMessage?: string,
    metadata: Record<string, any> = {}
  ) {
    super(message);
    this.name = 'RecognitionError';
    this.code = code;
    this.severity = severity;
    this.isRetryable = isRetryable;
    this.userMessage = userMessage || this.getDefaultUserMessage(code);
    this.metadata = metadata;
  }

  private getDefaultUserMessage(code: string): string {
    switch (code) {
      case 'NETWORK_ERROR':
        return 'Connection issue. Please check your internet and try again.';
      case 'SERVER_ERROR':
        return 'Temporary server issue. Please try again in a moment.';
      case 'RATE_LIMIT_EXCEEDED':
        return 'Too many requests. Please wait a moment before trying again.';
      case 'DATABASE_ERROR':
        return 'Data access issue. Please try again later.';
      case 'INVALID_INPUT':
        return 'Please check your information and try again.';
      case 'CHURCH_ACCESS_DENIED':
        return 'Access denied. Please contact your administrator.';
      case 'RECOGNITION_TIMEOUT':
        return 'Recognition is taking longer than usual. Please try again.';
      case 'MATCHING_ENGINE_ERROR':
        return 'Recognition service temporarily unavailable.';
      default:
        return 'Something went wrong. Please try again.';
    }
  }
}

// ============================================================================
// Error Handling Utilities
// ============================================================================

/**
 * Categorize errors and determine appropriate response
 */
export function categorizeError(error: any): RecognitionError {
  // Network errors
  if (error.name === 'TypeError' && error.message.includes('fetch')) {
    return new RecognitionError(
      'Network request failed',
      'NETWORK_ERROR',
      'medium',
      true,
      undefined,
      { originalError: error.message }
    );
  }

  // API errors
  if (error.status) {
    switch (error.status) {
      case 400:
        return new RecognitionError(
          'Invalid request',
          'INVALID_INPUT',
          'low',
          false,
          'Please check your information and try again.',
          { status: error.status, response: error.response }
        );
      
      case 401:
      case 403:
        return new RecognitionError(
          'Access denied',
          'CHURCH_ACCESS_DENIED',
          'high',
          false,
          'Access denied. Please contact your administrator.',
          { status: error.status }
        );
      
      case 429:
        return new RecognitionError(
          'Rate limit exceeded',
          'RATE_LIMIT_EXCEEDED',
          'medium',
          true,
          'Too many requests. Please wait a moment before trying again.',
          { status: error.status, retryAfter: error.retryAfter }
        );
      
      case 500:
      case 502:
      case 503:
      case 504:
        return new RecognitionError(
          'Server error',
          'SERVER_ERROR',
          'high',
          true,
          'Temporary server issue. Please try again in a moment.',
          { status: error.status }
        );
      
      default:
        return new RecognitionError(
          `HTTP error ${error.status}`,
          'HTTP_ERROR',
          'medium',
          true,
          undefined,
          { status: error.status }
        );
    }
  }

  // Database errors
  if (error.message?.includes('database') || error.code?.startsWith('DB_')) {
    return new RecognitionError(
      'Database error',
      'DATABASE_ERROR',
      'high',
      true,
      'Data access issue. Please try again later.',
      { originalError: error.message, code: error.code }
    );
  }

  // Timeout errors
  if (error.name === 'TimeoutError' || error.message?.includes('timeout')) {
    return new RecognitionError(
      'Operation timeout',
      'RECOGNITION_TIMEOUT',
      'medium',
      true,
      'Recognition is taking longer than usual. Please try again.',
      { originalError: error.message }
    );
  }

  // Recognition-specific errors
  if (error instanceof RecognitionError) {
    return error;
  }

  // Unknown errors
  return new RecognitionError(
    error.message || 'Unknown error',
    'UNKNOWN_ERROR',
    'medium',
    true,
    'Something went wrong. Please try again.',
    { originalError: error }
  );
}

// ============================================================================
// Fallback Mechanisms
// ============================================================================

/**
 * Fallback recognition result for when the system fails
 */
export function createFallbackResult(
  input: RecognitionInput,
  error: RecognitionError
): RecognitionResult {
  return {
    status: 'no_match',
    confidence: 0,
    displayMessage: undefined,
    maskedData: undefined,
    requiresAdminReview: false,
    // Include error information for debugging (not shown to users)
    ...(process.env.NODE_ENV === 'development' && {
      debug: {
        error: {
          code: error.code,
          message: error.message,
          severity: error.severity,
          isRetryable: error.isRetryable
        },
        input,
        timestamp: new Date().toISOString()
      }
    })
  };
}

/**
 * Simple fallback matching for critical scenarios
 */
export function performSimpleFallbackMatching(
  input: RecognitionInput,
  cachedProfiles?: any[]
): RecognitionResult {
  // If we have cached profiles, do simple exact matching
  if (cachedProfiles && input.email) {
    const exactMatch = cachedProfiles.find(
      profile => profile.email?.toLowerCase() === input.email?.toLowerCase()
    );

    if (exactMatch) {
      return {
        status: 'suggest_match',
        confidence: 75, // Lower confidence for fallback matching
        displayMessage: `It looks like you might be ${exactMatch.firstName} ${exactMatch.lastName}. Is this correct?`,
        match: {
          profileId: exactMatch.id,
          confidence: 75,
          matchReasons: ['exact_email_match_fallback'],
          profile: {
            firstName: exactMatch.firstName,
            lastName: exactMatch.lastName,
            email: exactMatch.email
          }
        }
      };
    }
  }

  return {
    status: 'no_match',
    confidence: 0
  };
}

// ============================================================================
// Retry Logic
// ============================================================================

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  retryCondition?: (error: RecognitionError) => boolean;
}

const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxAttempts: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  backoffMultiplier: 2,
  retryCondition: (error) => error.isRetryable && error.severity !== 'critical'
};

/**
 * Retry wrapper with exponential backoff
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const config = { ...DEFAULT_RETRY_OPTIONS, ...options };
  let lastError: RecognitionError;
  
  for (let attempt = 1; attempt <= config.maxAttempts; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = categorizeError(error);
      
      // Don't retry if not retryable or last attempt
      if (!config.retryCondition?.(lastError) || attempt === config.maxAttempts) {
        throw lastError;
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        config.baseDelay * Math.pow(config.backoffMultiplier, attempt - 1),
        config.maxDelay
      );
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay * (0.5 + Math.random() * 0.5);
      
      await new Promise(resolve => setTimeout(resolve, jitteredDelay));
    }
  }
  
  throw lastError!;
}

// ============================================================================
// Circuit Breaker Pattern
// ============================================================================

export class CircuitBreaker {
  private failures: number = 0;
  private nextAttempt: number = Date.now();
  private state: 'closed' | 'open' | 'half-open' = 'closed';

  constructor(
    private failureThreshold: number = 5,
    private resetTimeout: number = 60000, // 1 minute
    private monitorWindow: number = 300000 // 5 minutes
  ) {}

  public async execute<T>(operation: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() < this.nextAttempt) {
        throw new RecognitionError(
          'Circuit breaker is open',
          'CIRCUIT_BREAKER_OPEN',
          'high',
          true,
          'Recognition service is temporarily unavailable. Please try again later.'
        );
      }
      this.state = 'half-open';
    }

    try {
      const result = await operation();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess(): void {
    this.failures = 0;
    this.state = 'closed';
  }

  private onFailure(): void {
    this.failures++;
    if (this.failures >= this.failureThreshold) {
      this.state = 'open';
      this.nextAttempt = Date.now() + this.resetTimeout;
    }
  }

  public getState(): { state: string; failures: number; nextAttempt?: Date } {
    return {
      state: this.state,
      failures: this.failures,
      ...(this.state === 'open' && { nextAttempt: new Date(this.nextAttempt) })
    };
  }
}

// Global circuit breaker for recognition service
export const recognitionCircuitBreaker = new CircuitBreaker();

// ============================================================================
// Health Monitoring
// ============================================================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  errorRate: number;
  averageResponseTime: number;
  circuitBreakerState: string;
  lastError?: {
    code: string;
    timestamp: Date;
    count: number;
  };
}

class HealthMonitor {
  private errors: Map<string, { count: number; lastOccurrence: Date }> = new Map();
  private startTime: Date = new Date();
  private totalRequests: number = 0;
  private totalErrors: number = 0;
  private responseTimes: number[] = [];

  public recordRequest(responseTime: number, error?: RecognitionError): void {
    this.totalRequests++;
    this.responseTimes.push(responseTime);
    
    // Keep only last 100 response times for memory efficiency
    if (this.responseTimes.length > 100) {
      this.responseTimes.shift();
    }

    if (error) {
      this.totalErrors++;
      const existing = this.errors.get(error.code);
      this.errors.set(error.code, {
        count: (existing?.count || 0) + 1,
        lastOccurrence: new Date()
      });
    }
  }

  public getHealth(): HealthStatus {
    const uptime = Date.now() - this.startTime.getTime();
    const errorRate = this.totalRequests > 0 ? (this.totalErrors / this.totalRequests) * 100 : 0;
    const averageResponseTime = this.responseTimes.length > 0 
      ? this.responseTimes.reduce((a, b) => a + b, 0) / this.responseTimes.length 
      : 0;

    // Determine status
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
    if (errorRate > 10 || averageResponseTime > 5000) {
      status = 'unhealthy';
    } else if (errorRate > 5 || averageResponseTime > 2000) {
      status = 'degraded';
    }

    // Get most recent error
    let lastError;
    if (this.errors.size > 0) {
      const mostRecentError = Array.from(this.errors.entries())
        .sort(([, a], [, b]) => b.lastOccurrence.getTime() - a.lastOccurrence.getTime())[0];
      
      lastError = {
        code: mostRecentError[0],
        timestamp: mostRecentError[1].lastOccurrence,
        count: mostRecentError[1].count
      };
    }

    return {
      status,
      uptime,
      errorRate,
      averageResponseTime,
      circuitBreakerState: recognitionCircuitBreaker.getState().state,
      lastError
    };
  }

  public reset(): void {
    this.errors.clear();
    this.startTime = new Date();
    this.totalRequests = 0;
    this.totalErrors = 0;
    this.responseTimes = [];
  }
}

export const healthMonitor = new HealthMonitor();

// ============================================================================
// Error Recovery Strategies
// ============================================================================

/**
 * Comprehensive error recovery for recognition operations
 */
export async function executeWithRecovery<T>(
  operation: () => Promise<T>,
  fallback: () => T,
  options: {
    maxRetries?: number;
    useCircuitBreaker?: boolean;
    cacheFallback?: boolean;
  } = {}
): Promise<T> {
  const { maxRetries = 3, useCircuitBreaker = true, cacheFallback = false } = options;
  const startTime = Date.now();

  try {
    const wrappedOperation = useCircuitBreaker 
      ? () => recognitionCircuitBreaker.execute(operation)
      : operation;

    const result = await withRetry(wrappedOperation, { maxAttempts: maxRetries });
    
    // Record successful request
    const responseTime = Date.now() - startTime;
    healthMonitor.recordRequest(responseTime);
    
    return result;

  } catch (error) {
    const recognitionError = categorizeError(error);
    const responseTime = Date.now() - startTime;
    
    // Record failed request
    healthMonitor.recordRequest(responseTime, recognitionError);
    
    // Log error for monitoring
    console.error('Recognition operation failed:', {
      code: recognitionError.code,
      message: recognitionError.message,
      severity: recognitionError.severity,
      metadata: recognitionError.metadata,
      responseTime
    });

    // Use fallback if available
    if (fallback) {
      try {
        const fallbackResult = fallback();
        
        // Optionally cache fallback result
        if (cacheFallback) {
          // Implementation would cache the fallback result
          console.log('Caching fallback result for future use');
        }
        
        return fallbackResult;
      } catch (fallbackError) {
        console.error('Fallback also failed:', fallbackError);
      }
    }

    // Re-throw the original error if no fallback or fallback failed
    throw recognitionError;
  }
}