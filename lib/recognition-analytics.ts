/**
 * Recognition Analytics System
 * 
 * This module provides analytics and success rate tracking for the progressive
 * recognition system. It helps church administrators understand how well the
 * recognition system is performing and identify areas for improvement.
 */

import { db } from "@/db/drizzle";
import { 
  formSubmissions, 
  personProfiles, 
  profileMatchSuggestions, 
  adminReviewQueue 
} from "@/db/schema";
import { eq, and, gte, lte, sql, desc } from "drizzle-orm";

// ============================================================================
// Types and Interfaces
// ============================================================================

export interface RecognitionAnalytics {
  overview: {
    totalRecognitionAttempts: number;
    successfulRecognitions: number;
    successRate: number;
    averageConfidenceScore: number;
    timesSaved: number; // in minutes
  };
  recognitionBreakdown: {
    autoLinked: number;
    suggestedMatches: number;
    adminReviews: number;
    noMatches: number;
  };
  confidenceDistribution: {
    range: string;
    count: number;
    successRate: number;
  }[];
  userFeedback: {
    confirmations: number;
    rejections: number;
    confirmationRate: number;
  };
  adminPerformance: {
    pendingReviews: number;
    averageReviewTime: number; // in hours
    approvalRate: number;
  };
  trendsOverTime: {
    date: string;
    attempts: number;
    successes: number;
    avgConfidence: number;
  }[];
}

export interface RecognitionMetrics {
  churchId: string;
  dateRange: {
    start: Date;
    end: Date;
  };
  metrics: RecognitionAnalytics;
}

// ============================================================================
// Analytics Functions
// ============================================================================

/**
 * Get comprehensive recognition analytics for a church
 */
export async function getRecognitionAnalytics(
  churchId: string,
  startDate: Date,
  endDate: Date
): Promise<RecognitionAnalytics> {
  try {
    // Parallel queries for different metrics
    const [
      overviewData,
      recognitionBreakdown,
      confidenceDistribution,
      userFeedback,
      adminPerformance,
      trendsData
    ] = await Promise.all([
      getOverviewMetrics(churchId, startDate, endDate),
      getRecognitionBreakdown(churchId, startDate, endDate),
      getConfidenceDistribution(churchId, startDate, endDate),
      getUserFeedback(churchId, startDate, endDate),
      getAdminPerformance(churchId, startDate, endDate),
      getTrendsOverTime(churchId, startDate, endDate)
    ]);

    return {
      overview: overviewData,
      recognitionBreakdown,
      confidenceDistribution,
      userFeedback,
      adminPerformance,
      trendsOverTime: trendsData
    };

  } catch (error) {
    console.error('Get recognition analytics error:', error);
    throw error;
  }
}

/**
 * Get overview metrics
 */
async function getOverviewMetrics(
  churchId: string,
  startDate: Date,
  endDate: Date
) {
  // Get total submissions with recognition data
  const submissionsWithRecognition = await db
    .select({
      count: sql`count(*)`,
      avgConfidence: sql`avg(CASE WHEN pp.confidence_score > 0 THEN pp.confidence_score ELSE null END)`,
      successfulRecognitions: sql`count(CASE WHEN pp.confidence_score >= 85 THEN 1 ELSE null END)`
    })
    .from(formSubmissions)
    .leftJoin(personProfiles, eq(formSubmissions.personProfileId, personProfiles.id))
    .where(
      and(
        eq(formSubmissions.churchId, churchId),
        gte(formSubmissions.submittedAt, startDate),
        lte(formSubmissions.submittedAt, endDate)
      )
    );

  const totalAttempts = Number(submissionsWithRecognition[0]?.count) || 0;
  const successfulRecognitions = Number(submissionsWithRecognition[0]?.successfulRecognitions) || 0;
  const avgConfidence = Number(submissionsWithRecognition[0]?.avgConfidence) || 0;

  return {
    totalRecognitionAttempts: totalAttempts,
    successfulRecognitions,
    successRate: totalAttempts > 0 ? (successfulRecognitions / totalAttempts) * 100 : 0,
    averageConfidenceScore: avgConfidence,
    timesSaved: successfulRecognitions * 2 // Assume 2 minutes saved per successful recognition
  };
}

/**
 * Get recognition breakdown by type
 */
async function getRecognitionBreakdown(
  churchId: string,
  startDate: Date,
  endDate: Date
) {
  const breakdown = await db
    .select({
      autoLinked: sql`count(CASE WHEN pp.confidence_score >= 98 THEN 1 ELSE null END)`,
      suggestedMatches: sql`count(CASE WHEN pp.confidence_score >= 85 AND pp.confidence_score < 98 THEN 1 ELSE null END)`,
      adminReviews: sql`count(CASE WHEN pp.confidence_score >= 70 AND pp.confidence_score < 85 THEN 1 ELSE null END)`,
      noMatches: sql`count(CASE WHEN pp.confidence_score < 70 OR pp.confidence_score IS NULL THEN 1 ELSE null END)`
    })
    .from(formSubmissions)
    .leftJoin(personProfiles, eq(formSubmissions.personProfileId, personProfiles.id))
    .where(
      and(
        eq(formSubmissions.churchId, churchId),
        gte(formSubmissions.submittedAt, startDate),
        lte(formSubmissions.submittedAt, endDate)
      )
    );

  return {
    autoLinked: Number(breakdown[0]?.autoLinked) || 0,
    suggestedMatches: Number(breakdown[0]?.suggestedMatches) || 0,
    adminReviews: Number(breakdown[0]?.adminReviews) || 0,
    noMatches: Number(breakdown[0]?.noMatches) || 0
  };
}

/**
 * Get confidence score distribution
 */
async function getConfidenceDistribution(
  churchId: string,
  startDate: Date,
  endDate: Date
) {
  const confidenceRanges = [
    { range: '90-100%', min: 90, max: 100 },
    { range: '80-89%', min: 80, max: 89 },
    { range: '70-79%', min: 70, max: 79 },
    { range: '60-69%', min: 60, max: 69 },
    { range: 'Below 60%', min: 0, max: 59 }
  ];

  const results = await Promise.all(
    confidenceRanges.map(async ({ range, min, max }) => {
      const data = await db
        .select({
          count: sql`count(*)`,
          confirmations: sql`count(CASE WHEN pp.profile_status = 'verified' THEN 1 ELSE null END)`
        })
        .from(formSubmissions)
        .leftJoin(personProfiles, eq(formSubmissions.personProfileId, personProfiles.id))
        .where(
          and(
            eq(formSubmissions.churchId, churchId),
            gte(formSubmissions.submittedAt, startDate),
            lte(formSubmissions.submittedAt, endDate),
            gte(personProfiles.confidenceScore, min),
            lte(personProfiles.confidenceScore, max)
          )
        );

      const count = Number(data[0]?.count) || 0;
      const confirmations = Number(data[0]?.confirmations) || 0;

      return {
        range,
        count,
        successRate: count > 0 ? (confirmations / count) * 100 : 0
      };
    })
  );

  return results;
}

/**
 * Get user feedback metrics
 */
async function getUserFeedback(
  churchId: string,
  startDate: Date,
  endDate: Date
) {
  const feedback = await db
    .select({
      confirmations: sql`count(CASE WHEN pp.profile_status = 'verified' THEN 1 ELSE null END)`,
      total: sql`count(CASE WHEN pp.confidence_score >= 85 THEN 1 ELSE null END)`
    })
    .from(formSubmissions)
    .leftJoin(personProfiles, eq(formSubmissions.personProfileId, personProfiles.id))
    .where(
      and(
        eq(formSubmissions.churchId, churchId),
        gte(formSubmissions.submittedAt, startDate),
        lte(formSubmissions.submittedAt, endDate)
      )
    );

  const confirmations = Number(feedback[0]?.confirmations) || 0;
  const total = Number(feedback[0]?.total) || 0;
  const rejections = total - confirmations;

  return {
    confirmations,
    rejections,
    confirmationRate: total > 0 ? (confirmations / total) * 100 : 0
  };
}

/**
 * Get admin performance metrics
 */
async function getAdminPerformance(
  churchId: string,
  startDate: Date,
  endDate: Date
) {
  // Get pending reviews
  const pendingReviews = await db
    .select({ count: sql`count(*)` })
    .from(adminReviewQueue)
    .where(
      and(
        eq(adminReviewQueue.churchId, churchId),
        eq(adminReviewQueue.status, 'pending'),
        eq(adminReviewQueue.itemType, 'profile_match')
      )
    );

  // Get completed reviews with timing data
  const completedReviews = await db
    .select({
      count: sql`count(*)`,
      avgReviewTime: sql`avg((reviewed_at - created_at) / 3600.0)`, // Hours
      approvals: sql`count(CASE WHEN review_action = 'approved' THEN 1 ELSE null END)`
    })
    .from(adminReviewQueue)
    .where(
      and(
        eq(adminReviewQueue.churchId, churchId),
        eq(adminReviewQueue.status, 'completed'),
        eq(adminReviewQueue.itemType, 'profile_match'),
        gte(adminReviewQueue.createdAt, startDate),
        lte(adminReviewQueue.createdAt, endDate)
      )
    );

  const totalCompleted = Number(completedReviews[0]?.count) || 0;
  const approvals = Number(completedReviews[0]?.approvals) || 0;

  return {
    pendingReviews: Number(pendingReviews[0]?.count) || 0,
    averageReviewTime: Number(completedReviews[0]?.avgReviewTime) || 0,
    approvalRate: totalCompleted > 0 ? (approvals / totalCompleted) * 100 : 0
  };
}

/**
 * Get trends over time
 */
async function getTrendsOverTime(
  churchId: string,
  startDate: Date,
  endDate: Date
) {
  // Generate date intervals (daily for periods <= 30 days, weekly for longer)
  const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const useDaily = daysDiff <= 30;
  
  const dateFormat = useDaily ? 'DATE(submitted_at)' : 'DATE(submitted_at, "weekday 0", "-6 days")';

  const trends = await db
    .select({
      date: sql`${sql.raw(dateFormat)}`,
      attempts: sql`count(*)`,
      successes: sql`count(CASE WHEN pp.confidence_score >= 85 THEN 1 ELSE null END)`,
      avgConfidence: sql`avg(CASE WHEN pp.confidence_score > 0 THEN pp.confidence_score ELSE null END)`
    })
    .from(formSubmissions)
    .leftJoin(personProfiles, eq(formSubmissions.personProfileId, personProfiles.id))
    .where(
      and(
        eq(formSubmissions.churchId, churchId),
        gte(formSubmissions.submittedAt, startDate),
        lte(formSubmissions.submittedAt, endDate)
      )
    )
    .groupBy(sql`${sql.raw(dateFormat)}`)
    .orderBy(sql`${sql.raw(dateFormat)}`);

  return trends.map(trend => ({
    date: String(trend.date),
    attempts: Number(trend.attempts),
    successes: Number(trend.successes),
    avgConfidence: Number(trend.avgConfidence) || 0
  }));
}

/**
 * Log recognition event for analytics
 */
export async function logRecognitionEvent(
  churchId: string,
  eventType: 'attempt' | 'success' | 'failure' | 'confirmation' | 'rejection',
  metadata: {
    profileId?: string;
    confidenceScore?: number;
    matchReasons?: string[];
    userAgent?: string;
    ipAddress?: string;
  }
): Promise<void> {
  try {
    // In a production system, this would log to a dedicated analytics table
    // or send to an analytics service like Mixpanel, Amplitude, etc.
    
    console.log(`Recognition event logged - Church: ${churchId}, Type: ${eventType}`, {
      timestamp: new Date().toISOString(),
      ...metadata
    });

    // You could also implement a recognition_events table here:
    /*
    await db.insert(recognitionEvents).values({
      id: crypto.randomUUID(),
      churchId,
      eventType,
      profileId: metadata.profileId,
      confidenceScore: metadata.confidenceScore,
      matchReasons: metadata.matchReasons ? JSON.stringify(metadata.matchReasons) : null,
      userAgent: metadata.userAgent,
      ipAddress: metadata.ipAddress,
      createdAt: new Date()
    });
    */

  } catch (error) {
    console.error('Error logging recognition event:', error);
    // Don't throw - analytics logging shouldn't break the main flow
  }
}

/**
 * Get recognition performance comparison
 */
export async function getRecognitionComparison(
  churchId: string,
  currentPeriod: { start: Date; end: Date },
  previousPeriod: { start: Date; end: Date }
): Promise<{
  current: RecognitionAnalytics;
  previous: RecognitionAnalytics;
  improvements: {
    successRate: number;
    avgConfidence: number;
    confirmationRate: number;
  };
}> {
  const [current, previous] = await Promise.all([
    getRecognitionAnalytics(churchId, currentPeriod.start, currentPeriod.end),
    getRecognitionAnalytics(churchId, previousPeriod.start, previousPeriod.end)
  ]);

  const improvements = {
    successRate: current.overview.successRate - previous.overview.successRate,
    avgConfidence: current.overview.averageConfidenceScore - previous.overview.averageConfidenceScore,
    confirmationRate: current.userFeedback.confirmationRate - previous.userFeedback.confirmationRate
  };

  return { current, previous, improvements };
}