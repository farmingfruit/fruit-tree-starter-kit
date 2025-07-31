/**
 * Progressive Recognition Banner
 * 
 * This component displays the magical "Looks like you're already in our system!"
 * banner and handles user confirmation flows. It provides different UI states
 * based on the confidence level and recognition status.
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle, 
  AlertCircle, 
  User, 
  Users, 
  Clock, 
  X,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useRecognition } from "./recognition-provider";
import { maskEmail, maskPhone } from "@/lib/progressive-recognition";

interface RecognitionBannerProps {
  churchId: string;
  onConfirm?: (confirmed: boolean, feedback?: string) => void;
  className?: string;
}

export function RecognitionBanner({ 
  churchId, 
  onConfirm, 
  className = "" 
}: RecognitionBannerProps) {
  const { 
    currentRecognition, 
    confirmMatch, 
    showRecognitionUI, 
    setShowRecognitionUI 
  } = useRecognition();

  const [isConfirming, setIsConfirming] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [showFamilyDetails, setShowFamilyDetails] = useState(false);

  // Don't render if no recognition or UI is hidden
  if (!currentRecognition || !showRecognitionUI) {
    return null;
  }

  const { status, confidence, match, displayMessage, maskedData } = currentRecognition;

  /**
   * Handle user confirmation of a suggested match
   */
  const handleConfirmation = async (confirmed: boolean) => {
    if (!match) return;

    setIsConfirming(true);
    
    try {
      const success = await confirmMatch(
        churchId, 
        match.profileId, 
        confirmed, 
        feedback || undefined
      );

      if (success) {
        onConfirm?.(confirmed, feedback);
        if (!confirmed) {
          setShowRecognitionUI(false);
        }
      }
    } catch (error) {
      console.error('Confirmation error:', error);
    } finally {
      setIsConfirming(false);
      setShowFeedback(false);
      setFeedback("");
    }
  };

  /**
   * Render high confidence (auto-linked) banner
   */
  const renderAutoLinkedBanner = () => (
    <Card className={`border-green-200 bg-green-50 animate-in slide-in-from-top duration-300 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-green-900">
                  Welcome back{match?.profile.firstName ? `, ${match.profile.firstName}` : ''}!
                </span>
                <Sparkles className="h-3 w-3 text-green-600" />
              </div>
              <p className="text-xs text-green-700">
                We've pre-filled your information to save you time. Please review and update as needed.
              </p>
              
              {/* Time saved indicator */}
              <div className="flex items-center gap-1 mt-2 text-xs text-green-600">
                <Clock className="h-3 w-3" />
                <span>Time saved: ~2 minutes</span>
              </div>

              {/* Family members preview */}
              {match?.familyMembers && match.familyMembers.length > 0 && (
                <div className="mt-2">
                  <button
                    onClick={() => setShowFamilyDetails(!showFamilyDetails)}
                    className="flex items-center gap-1 text-xs text-green-700 hover:text-green-800"
                  >
                    <Users className="h-3 w-3" />
                    <span>{match.familyMembers.length} family member{match.familyMembers.length > 1 ? 's' : ''} found</span>
                    {showFamilyDetails ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                  </button>
                  
                  {showFamilyDetails && (
                    <div className="mt-2 space-y-1">
                      {match.familyMembers.map((member, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-green-700">
                          <User className="h-3 w-3" />
                          <span>{member.firstName} {member.lastName}</span>
                          {member.relationship && (
                            <Badge variant="outline" className="text-xs h-4">
                              {member.relationship}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowRecognitionUI(false)}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  /**
   * Render medium confidence (suggest match) banner
   */
  const renderSuggestMatchBanner = () => (
    <Card className={`border-blue-200 bg-blue-50 animate-in slide-in-from-top duration-300 ${className}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 mb-3">
              {displayMessage}
            </p>
            
            {/* Show masked profile data */}
            {maskedData && (
              <div className="text-xs text-blue-700 mb-3 space-y-1">
                {maskedData.firstName && maskedData.lastName && (
                  <div>Name: {maskedData.firstName} {maskedData.lastName}</div>
                )}
                {maskedData.email && (
                  <div>Email: {maskedData.email}</div>
                )}
                {maskedData.phone && (
                  <div>Phone: {maskedData.phone}</div>
                )}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                size="sm"
                onClick={() => handleConfirmation(true)}
                disabled={isConfirming}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isConfirming ? "Confirming..." : "Yes, that's me"}
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleConfirmation(false)}
                disabled={isConfirming}
                className="border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                No, this is my first time
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowFeedback(!showFeedback)}
                className="text-blue-600 hover:text-blue-700"
              >
                That's someone else
              </Button>
            </div>
            
            {/* Feedback textarea */}
            {showFeedback && (
              <div className="mt-3 space-y-2">
                <label className="text-xs text-blue-700">
                  Help us improve (optional):
                </label>
                <Textarea
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Let us know what went wrong with this match..."
                  className="text-xs h-16 resize-none"
                />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Render appropriate banner based on status
  switch (status) {
    case 'auto_linked':
      return renderAutoLinkedBanner();
    
    case 'suggest_match':
      return renderSuggestMatchBanner();
    
    default:
      return null;
  }
}

/**
 * Compact version of the recognition banner for inline use
 */
export function CompactRecognitionBanner({ 
  churchId, 
  onConfirm, 
  className = "" 
}: RecognitionBannerProps) {
  const { currentRecognition, confirmMatch } = useRecognition();
  const [isConfirming, setIsConfirming] = useState(false);

  if (!currentRecognition || currentRecognition.status === 'no_match') {
    return null;
  }

  const { status, match } = currentRecognition;

  const handleQuickConfirm = async (confirmed: boolean) => {
    if (!match) return;

    setIsConfirming(true);
    try {
      const success = await confirmMatch(churchId, match.profileId, confirmed);
      if (success) {
        onConfirm?.(confirmed);
      }
    } catch (error) {
      console.error('Quick confirmation error:', error);
    } finally {
      setIsConfirming(false);
    }
  };

  if (status === 'auto_linked') {
    return (
      <div className={`flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-xs ${className}`}>
        <CheckCircle className="h-3 w-3 text-green-600" />
        <span className="text-green-900 flex-1">
          Welcome back{match?.profile.firstName ? `, ${match.profile.firstName}` : ''}! Information pre-filled.
        </span>
      </div>
    );
  }

  if (status === 'suggest_match') {
    return (
      <div className={`p-2 bg-blue-50 border border-blue-200 rounded ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <AlertCircle className="h-3 w-3 text-blue-600" />
          <span className="text-xs text-blue-900 flex-1">
            Is this you: {match?.maskedData?.email || 'existing member'}?
          </span>
        </div>
        <div className="flex gap-1">
          <Button
            size="sm"
            onClick={() => handleQuickConfirm(true)}
            disabled={isConfirming}
            className="h-6 text-xs px-2"
          >
            Yes
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={() => handleQuickConfirm(false)}
            disabled={isConfirming}
            className="h-6 text-xs px-2"
          >
            No
          </Button>
        </div>
      </div>
    );
  }

  return null;
}