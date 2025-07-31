// Development authentication bypass
// Only use in development mode for testing features

// Check for development mode - handle both server and client side
// More robust development detection
const isDevMode = process.env.NODE_ENV === 'development' || 
  process.env.NEXT_PUBLIC_DEV_MODE === 'true' ||
  (typeof window !== 'undefined' && window.location.hostname === 'localhost');

export interface DevUser {
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
  };
}

export const devUser: DevUser = {
  userId: 'dev-user-123',
  user: {
    id: 'dev-user-123',
    name: 'Development User',
    email: 'dev@fruitreechurch.com',
    image: undefined,
  },
  session: {
    id: 'dev-session-123',
    userId: 'dev-user-123',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
    token: 'dev-token-123',
  },
};

export function getDevSession() {
  if (!isDevMode) {
    return null;
  }
  return devUser;
}

export function isDevModeEnabled() {
  return isDevMode;
}

export function shouldBypassAuth() {
  return isDevMode;
}