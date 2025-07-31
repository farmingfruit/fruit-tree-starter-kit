/**
 * Progressive Recognition Provider
 * 
 * This context provider manages the state and functionality for progressive
 * recognition throughout the application. It provides a clean interface for
 * components to trigger recognition, handle confirmations, and manage the
 * overall recognition flow.
 */

"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { RecognitionInput, RecognitionResult, RecognitionMatch } from "@/lib/progressive-recognition";

interface RecognitionContextType {
  // Current recognition state
  currentRecognition: RecognitionResult | null;
  isRecognizing: boolean;
  error: string | null;

  // Recognition actions
  performRecognition: (churchId: string, input: RecognitionInput) => Promise<RecognitionResult>;
  confirmMatch: (churchId: string, profileId: string, confirmed: boolean, feedback?: string) => Promise<boolean>;
  clearRecognition: () => void;

  // UI state management
  showRecognitionUI: boolean;
  setShowRecognitionUI: (show: boolean) => void;
}

const RecognitionContext = createContext<RecognitionContextType | undefined>(undefined);

export interface RecognitionProviderProps {
  children: ReactNode;
}

export function RecognitionProvider({ children }: RecognitionProviderProps) {
  const [currentRecognition, setCurrentRecognition] = useState<RecognitionResult | null>(null);
  const [isRecognizing, setIsRecognizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRecognitionUI, setShowRecognitionUI] = useState(false);

  /**
   * Perform progressive recognition lookup
   */
  const performRecognition = useCallback(async (
    churchId: string,
    input: RecognitionInput
  ): Promise<RecognitionResult> => {
    setIsRecognizing(true);
    setError(null);

    try {
      const response = await fetch('/api/progressive-recognition/recognize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          churchId,
          input,
          options: {
            maxMatches: 1,
            includeFamily: true,
            respectPrivacy: true
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Recognition request failed');
      }

      const result: RecognitionResult = await response.json();
      setCurrentRecognition(result);

      // Show UI for matches that require user interaction
      if (result.status === 'suggest_match' || result.status === 'auto_linked') {
        setShowRecognitionUI(true);
      }

      return result;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Recognition error:', err);
      
      // Return a no-match result on error
      const fallbackResult: RecognitionResult = {
        status: 'no_match',
        confidence: 0
      };
      setCurrentRecognition(fallbackResult);
      return fallbackResult;

    } finally {
      setIsRecognizing(false);
    }
  }, []);

  /**
   * Confirm or reject a suggested match
   */
  const confirmMatch = useCallback(async (
    churchId: string,
    profileId: string,
    confirmed: boolean,
    feedback?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/progressive-recognition/confirm-match', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          churchId,
          profileId,
          confirmed,
          userFeedback: feedback
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Match confirmation failed');
      }

      const result = await response.json();
      
      if (confirmed && result.success) {
        // Update current recognition to reflect confirmed status
        setCurrentRecognition(prev => prev ? {
          ...prev,
          status: 'auto_linked',
          match: prev.match ? {
            ...prev.match,
            profile: result.profile
          } : undefined
        } : null);
      } else {
        // Clear recognition for rejected matches
        setCurrentRecognition(null);
      }

      setShowRecognitionUI(false);
      return result.success;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Match confirmation error:', err);
      return false;
    }
  }, []);

  /**
   * Clear current recognition state
   */
  const clearRecognition = useCallback(() => {
    setCurrentRecognition(null);
    setError(null);
    setShowRecognitionUI(false);
  }, []);

  const contextValue: RecognitionContextType = {
    currentRecognition,
    isRecognizing,
    error,
    performRecognition,
    confirmMatch,
    clearRecognition,
    showRecognitionUI,
    setShowRecognitionUI
  };

  return (
    <RecognitionContext.Provider value={contextValue}>
      {children}
    </RecognitionContext.Provider>
  );
}

/**
 * Hook to use progressive recognition functionality
 */
export function useRecognition(): RecognitionContextType {
  const context = useContext(RecognitionContext);
  if (!context) {
    throw new Error('useRecognition must be used within a RecognitionProvider');
  }
  return context;
}

/**
 * Custom hook for triggering recognition on form field changes
 */
export function useFormRecognition(churchId: string, debounceMs: number = 500) {
  const { performRecognition, currentRecognition, isRecognizing } = useRecognition();
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

  const triggerRecognition = useCallback((input: RecognitionInput) => {
    // Clear existing timer
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    // Set new timer
    const timer = setTimeout(() => {
      // Only trigger if we have enough information
      if (input.email || (input.firstName && input.lastName)) {
        performRecognition(churchId, input);
      }
    }, debounceMs);

    setDebounceTimer(timer);

    // Cleanup function
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [churchId, debounceMs, debounceTimer, performRecognition]);

  return {
    triggerRecognition,
    currentRecognition,
    isRecognizing
  };
}