import { auth } from "@/lib/auth";
import { getDevSession, shouldBypassAuth } from "@/lib/dev-auth";
import { NextRequest } from "next/server";
import { db } from "@/db/drizzle";
import { churches, members } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getSessionWithDevBypass(headers: any) {
  // In development mode, check for dev session first
  if (shouldBypassAuth()) {
    // Check if we're in a browser environment and have dev session flag
    if (typeof window !== 'undefined') {
      const hasDevSession = localStorage.getItem('dev-session') === 'true';
      if (hasDevSession) {
        return getDevSession();
      }
    } else {
      // On server side, we'll assume dev session if dev mode is enabled
      // This handles the case where the page is server-rendered after redirect
      return getDevSession();
    }
  }

  // Fall back to real auth
  try {
    return await auth.api.getSession({ headers });
  } catch (error) {
    // If auth fails and we're in dev mode, return dev session
    if (shouldBypassAuth()) {
      return getDevSession();
    }
    throw error;
  }
}

export function redirectToSignIn(returnPath?: string) {
  const returnTo = returnPath ? `?returnTo=${encodeURIComponent(returnPath)}` : '';
  return `/sign-in${returnTo}`;
}

/**
 * Validate that the current user has access to the specified church
 * This is crucial for multi-tenant security
 */
export async function validateChurchAccess(
  churchId: string,
  request?: NextRequest
): Promise<boolean> {
  try {
    // In development mode, always allow access
    if (shouldBypassAuth()) {
      return true;
    }

    // Get the current session
    const session = request 
      ? await getSessionWithDevBypass(request.headers)
      : await auth.api.getSession({ headers: {} });

    if (!session?.user?.id) {
      return false;
    }

    // Check if the church exists
    const church = await db
      .select({ id: churches.id })
      .from(churches)
      .where(eq(churches.id, churchId))
      .limit(1);

    if (!church[0]) {
      return false;
    }

    // For now, we'll assume all authenticated users have access to all churches
    // In a real multi-tenant setup, you'd check church membership or staff roles
    // This could involve checking a church_users table or similar
    
    // TODO: Implement proper church access control based on:
    // - Church staff/admin roles
    // - Church membership
    // - Subscription status
    // - Permission levels
    
    return true;

  } catch (error) {
    console.error('Church access validation error:', error);
    return false;
  }
}

/**
 * Get the church ID(s) that the current user has access to
 * Useful for filtering queries and ensuring data isolation
 */
export async function getUserChurches(
  request?: NextRequest
): Promise<string[]> {
  try {
    // In development mode, return all churches
    if (shouldBypassAuth()) {
      const allChurches = await db
        .select({ id: churches.id })
        .from(churches);
      return allChurches.map(c => c.id);
    }

    // Get the current session
    const session = request 
      ? await getSessionWithDevBypass(request.headers)
      : await auth.api.getSession({ headers: {} });

    if (!session?.user?.id) {
      return [];
    }

    // For now, return all churches (this would be filtered in production)
    const userChurches = await db
      .select({ id: churches.id })
      .from(churches);

    return userChurches.map(c => c.id);

  } catch (error) {
    console.error('Get user churches error:', error);
    return [];
  }
}