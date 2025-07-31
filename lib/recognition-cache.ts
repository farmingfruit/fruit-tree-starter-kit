/**
 * Progressive Recognition Caching System
 * 
 * This module provides multi-layer caching for the progressive recognition
 * system to ensure sub-200ms response times and reduce database load.
 * It implements intelligent cache invalidation and preloading strategies.
 */

import crypto from "crypto";

// ============================================================================
// Cache Interfaces and Types
// ============================================================================

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  hits: number;
  lastAccessed: number;
}

export interface CacheStats {
  hitRate: number;
  missRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  averageResponseTime: number;
  cacheSize: number;
  memoryUsage: number;
}

export interface CacheConfig {
  maxSize: number;
  defaultTtl: number;
  maxMemoryMB: number;
  cleanupInterval: number;
  preloadEnabled: boolean;
}

// ============================================================================
// In-Memory Cache Implementation
// ============================================================================

class InMemoryCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats = {
    hits: 0,
    misses: 0,
    responseTimes: [] as number[]
  };
  private cleanupTimer?: NodeJS.Timeout;

  constructor(private config: CacheConfig) {
    this.startCleanupTimer();
  }

  /**
   * Get item from cache
   */
  public get(key: string): T | null {
    const startTime = Date.now();
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      this.recordResponseTime(Date.now() - startTime);
      return null;
    }

    // Check if expired
    if (Date.now() > entry.timestamp + entry.ttl) {
      this.cache.delete(key);
      this.stats.misses++;
      this.recordResponseTime(Date.now() - startTime);
      return null;
    }

    // Update access stats
    entry.hits++;
    entry.lastAccessed = Date.now();
    this.stats.hits++;
    this.recordResponseTime(Date.now() - startTime);

    return entry.data;
  }

  /**
   * Set item in cache
   */
  public set(key: string, data: T, ttl?: number): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.config.defaultTtl,
      hits: 0,
      lastAccessed: Date.now()
    };

    // Check size limits
    if (this.cache.size >= this.config.maxSize) {
      this.evictLeastUsed();
    }

    this.cache.set(key, entry);
  }

  /**
   * Delete item from cache
   */
  public delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * Get cache statistics
   */
  public getStats(): CacheStats {
    const totalRequests = this.stats.hits + this.stats.misses;
    const averageResponseTime = this.stats.responseTimes.length > 0
      ? this.stats.responseTimes.reduce((a, b) => a + b, 0) / this.stats.responseTimes.length
      : 0;

    return {
      hitRate: totalRequests > 0 ? (this.stats.hits / totalRequests) * 100 : 0,
      missRate: totalRequests > 0 ? (this.stats.misses / totalRequests) * 100 : 0,
      totalRequests,
      totalHits: this.stats.hits,
      totalMisses: this.stats.misses,
      averageResponseTime,
      cacheSize: this.cache.size,
      memoryUsage: this.estimateMemoryUsage()
    };
  }

  /**
   * Evict least recently used items
   */
  private evictLeastUsed(): void {
    if (this.cache.size === 0) return;

    // Find the least recently used entry
    let lruKey: string | null = null;
    let lruTime = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }

  /**
   * Cleanup expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.timestamp + entry.ttl) {
        expiredKeys.push(key);
      }
    }

    expiredKeys.forEach(key => this.cache.delete(key));
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }

    this.cleanupTimer = setInterval(
      () => this.cleanup(),
      this.config.cleanupInterval
    );
  }

  /**
   * Record response time for analytics
   */
  private recordResponseTime(time: number): void {
    this.stats.responseTimes.push(time);
    
    // Keep only last 1000 response times
    if (this.stats.responseTimes.length > 1000) {
      this.stats.responseTimes.shift();
    }
  }

  /**
   * Estimate memory usage
   */
  private estimateMemoryUsage(): number {
    // Rough estimation in MB
    const entrySize = 1024; // 1KB average per entry
    return (this.cache.size * entrySize) / (1024 * 1024);
  }

  /**
   * Reset statistics
   */
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      responseTimes: []
    };
  }

  /**
   * Cleanup on destruction
   */
  public destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
    this.cache.clear();
  }
}

// ============================================================================
// Recognition-Specific Cache Layers
// ============================================================================

/**
 * Profile cache for storing person profiles
 */
class ProfileCache extends InMemoryCache<any> {
  constructor() {
    super({
      maxSize: 10000,
      defaultTtl: 30 * 60 * 1000, // 30 minutes
      maxMemoryMB: 50,
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      preloadEnabled: true
    });
  }

  /**
   * Generate cache key for profile lookup
   */
  public generateProfileKey(churchId: string, email?: string, phone?: string): string {
    const identifiers = [
      email?.toLowerCase().trim(),
      phone?.replace(/\D/g, '') // Remove non-digits
    ].filter(Boolean);

    if (identifiers.length === 0) {
      return '';
    }

    const keyData = `${churchId}:${identifiers.join(':')}`;
    return crypto.createHash('md5').update(keyData).digest('hex');
  }

  /**
   * Cache profile with multiple keys for different lookup patterns
   */
  public cacheProfile(profile: any, churchId: string): void {
    if (!profile) return;

    // Cache by email
    if (profile.email) {
      const emailKey = this.generateProfileKey(churchId, profile.email);
      this.set(emailKey, profile);
    }

    // Cache by phone
    if (profile.phone) {
      const phoneKey = this.generateProfileKey(churchId, undefined, profile.phone);
      this.set(phoneKey, profile);
    }

    // Cache by combined identifiers
    if (profile.email && profile.phone) {
      const combinedKey = this.generateProfileKey(churchId, profile.email, profile.phone);
      this.set(combinedKey, profile);
    }
  }
}

/**
 * Recognition result cache for storing complete recognition results
 */
class RecognitionResultCache extends InMemoryCache<any> {
  constructor() {
    super({
      maxSize: 5000,
      defaultTtl: 10 * 60 * 1000, // 10 minutes (shorter TTL for results)
      maxMemoryMB: 25,
      cleanupInterval: 2 * 60 * 1000, // 2 minutes
      preloadEnabled: false
    });
  }

  /**
   * Generate cache key for recognition input
   */
  public generateRecognitionKey(churchId: string, input: any): string {
    const keyData = JSON.stringify({
      churchId,
      email: input.email?.toLowerCase().trim(),
      phone: input.phone?.replace(/\D/g, ''),
      firstName: input.firstName?.toLowerCase().trim(),
      lastName: input.lastName?.toLowerCase().trim()
    });

    return crypto.createHash('md5').update(keyData).digest('hex');
  }
}

/**
 * Family member cache for storing family relationships
 */
class FamilyCache extends InMemoryCache<any[]> {
  constructor() {
    super({
      maxSize: 2000,
      defaultTtl: 60 * 60 * 1000, // 1 hour
      maxMemoryMB: 20,
      cleanupInterval: 10 * 60 * 1000, // 10 minutes
      preloadEnabled: true
    });
  }

  /**
   * Generate cache key for family lookup
   */
  public generateFamilyKey(profileId: string, churchId: string): string {
    return crypto.createHash('md5').update(`${churchId}:family:${profileId}`).digest('hex');
  }
}

// ============================================================================
// Cache Manager
// ============================================================================

export class RecognitionCacheManager {
  private profileCache: ProfileCache;
  private resultCache: RecognitionResultCache;
  private familyCache: FamilyCache;

  constructor() {
    this.profileCache = new ProfileCache();
    this.resultCache = new RecognitionResultCache();
    this.familyCache = new FamilyCache();
  }

  // Profile caching methods
  public getCachedProfile(churchId: string, email?: string, phone?: string): any | null {
    const key = this.profileCache.generateProfileKey(churchId, email, phone);
    return key ? this.profileCache.get(key) : null;
  }

  public cacheProfile(profile: any, churchId: string): void {
    this.profileCache.cacheProfile(profile, churchId);
  }

  // Recognition result caching methods
  public getCachedRecognitionResult(churchId: string, input: any): any | null {
    const key = this.resultCache.generateRecognitionKey(churchId, input);
    return this.resultCache.get(key);
  }

  public cacheRecognitionResult(result: any, churchId: string, input: any): void {
    const key = this.resultCache.generateRecognitionKey(churchId, input);
    this.resultCache.set(key, result);
  }

  // Family member caching methods
  public getCachedFamilyMembers(profileId: string, churchId: string): any[] | null {
    const key = this.familyCache.generateFamilyKey(profileId, churchId);
    return this.familyCache.get(key);
  }

  public cacheFamilyMembers(familyMembers: any[], profileId: string, churchId: string): void {
    const key = this.familyCache.generateFamilyKey(profileId, churchId);
    this.familyCache.set(key, familyMembers);
  }

  // Cache invalidation methods
  public invalidateProfile(churchId: string, email?: string, phone?: string): void {
    const key = this.profileCache.generateProfileKey(churchId, email, phone);
    if (key) {
      this.profileCache.delete(key);
    }
  }

  public invalidateRecognitionResult(churchId: string, input: any): void {
    const key = this.resultCache.generateRecognitionKey(churchId, input);
    this.resultCache.delete(key);
  }

  public invalidateFamily(profileId: string, churchId: string): void {
    const key = this.familyCache.generateFamilyKey(profileId, churchId);
    this.familyCache.delete(key);
  }

  // Bulk invalidation for profile updates
  public invalidateProfileRelated(profile: any, churchId: string): void {
    // Invalidate all caches related to this profile
    this.invalidateProfile(churchId, profile.email, profile.phone);
    this.invalidateFamily(profile.id, churchId);
    
    // Clear recognition results that might be affected
    this.resultCache.clear(); // More aggressive approach for data consistency
  }

  // Statistics and monitoring
  public getStats(): {
    profile: CacheStats;
    result: CacheStats;
    family: CacheStats;
    overall: {
      totalMemoryUsage: number;
      totalCacheSize: number;
      averageHitRate: number;
    };
  } {
    const profileStats = this.profileCache.getStats();
    const resultStats = this.resultCache.getStats();
    const familyStats = this.familyCache.getStats();

    return {
      profile: profileStats,
      result: resultStats,
      family: familyStats,
      overall: {
        totalMemoryUsage: profileStats.memoryUsage + resultStats.memoryUsage + familyStats.memoryUsage,
        totalCacheSize: profileStats.cacheSize + resultStats.cacheSize + familyStats.cacheSize,
        averageHitRate: (profileStats.hitRate + resultStats.hitRate + familyStats.hitRate) / 3
      }
    };
  }

  // Cache warming
  public async warmCache(churchId: string, recentProfiles: any[]): Promise<void> {
    for (const profile of recentProfiles) {
      this.cacheProfile(profile, churchId);
    }
  }

  // Cleanup and shutdown
  public destroy(): void {
    this.profileCache.destroy();
    this.resultCache.destroy();
    this.familyCache.destroy();
  }
}

// ============================================================================
// Global Cache Instance
// ============================================================================

export const recognitionCache = new RecognitionCacheManager();

// ============================================================================
// Cache Decorators and Utilities
// ============================================================================

/**
 * Decorator for caching recognition results
 */
export function withRecognitionCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  getCacheKey: (...args: T) => string,
  ttl?: number
) {
  return async (...args: T): Promise<R> => {
    const cacheKey = getCacheKey(...args);
    
    // Try to get from cache first
    const cached = recognitionCache.getCachedRecognitionResult('', { key: cacheKey });
    if (cached) {
      return cached;
    }

    // Execute function and cache result
    const result = await fn(...args);
    recognitionCache.cacheRecognitionResult(result, '', { key: cacheKey });
    
    return result;
  };
}

/**
 * Cache-aware profile lookup
 */
export async function getCachedOrFetchProfile(
  churchId: string,
  email?: string,
  phone?: string,
  fetchFn?: () => Promise<any>
): Promise<any | null> {
  // Try cache first
  const cached = recognitionCache.getCachedProfile(churchId, email, phone);
  if (cached) {
    return cached;
  }

  // Fetch from database if fetch function provided
  if (fetchFn) {
    try {
      const profile = await fetchFn();
      if (profile) {
        recognitionCache.cacheProfile(profile, churchId);
      }
      return profile;
    } catch (error) {
      console.error('Error fetching profile for cache:', error);
      return null;
    }
  }

  return null;
}

// ============================================================================
// Cache Health Monitoring
// ============================================================================

export function getCacheHealthStatus(): {
  status: 'healthy' | 'degraded' | 'unhealthy';
  metrics: ReturnType<RecognitionCacheManager['getStats']>;
  issues: string[];
} {
  const stats = recognitionCache.getStats();
  const issues: string[] = [];
  let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';

  // Check hit rates
  if (stats.overall.averageHitRate < 50) {
    issues.push('Low cache hit rate');
    status = 'degraded';
  }

  // Check memory usage
  if (stats.overall.totalMemoryUsage > 100) { // 100MB threshold
    issues.push('High memory usage');
    if (status !== 'unhealthy') status = 'degraded';
  }

  // Check response times
  const avgResponseTime = (
    stats.profile.averageResponseTime + 
    stats.result.averageResponseTime + 
    stats.family.averageResponseTime
  ) / 3;

  if (avgResponseTime > 10) { // 10ms threshold
    issues.push('Slow cache response times');
    status = 'unhealthy';
  }

  return { status, metrics: stats, issues };
}