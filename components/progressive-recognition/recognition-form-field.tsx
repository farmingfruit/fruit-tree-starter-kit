/**
 * Progressive Recognition Form Field
 * 
 * This component wraps form input fields to provide real-time progressive
 * recognition capabilities. As users type their information, it automatically
 * triggers recognition lookups and provides visual feedback.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  Search,
  Sparkles
} from "lucide-react";
import { useFormRecognition } from "./recognition-provider";
import { RecognitionInput } from "@/lib/progressive-recognition";

interface RecognitionFormFieldProps {
  churchId: string;
  fieldName: keyof RecognitionInput;
  label: string;
  type?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  
  // Recognition settings
  triggerRecognition?: boolean;
  recognitionDelay?: number;
  
  // Form context - other fields needed for recognition
  formData?: Partial<RecognitionInput>;
  
  // Callbacks
  onRecognitionTriggered?: () => void;
  onRecognitionComplete?: (hasMatch: boolean) => void;
}

export function RecognitionFormField({
  churchId,
  fieldName,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  disabled = false,
  required = false,
  className = "",
  triggerRecognition = true,
  recognitionDelay = 800,
  formData = {},
  onRecognitionTriggered,
  onRecognitionComplete
}: RecognitionFormFieldProps) {
  const { triggerRecognition: performRecognition, currentRecognition, isRecognizing } = useFormRecognition(
    churchId, 
    recognitionDelay
  );
  
  const [fieldState, setFieldState] = useState<'idle' | 'typing' | 'recognized' | 'no_match'>('idle');
  const [lastRecognitionValue, setLastRecognitionValue] = useState('');

  /**
   * Handle input change and trigger recognition
   */
  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (!triggerRecognition || disabled) return;
    
    setFieldState('typing');
    
    // Build recognition input from current field and form data
    const recognitionInput: RecognitionInput = {
      ...formData,
      [fieldName]: inputValue
    };
    
    // Only trigger recognition for meaningful inputs
    const shouldTrigger = (
      (fieldName === 'email' && inputValue.includes('@')) ||
      (fieldName === 'phone' && inputValue.replace(/\D/g, '').length >= 10) ||
      (fieldName === 'firstName' && inputValue.length >= 2) ||
      (fieldName === 'lastName' && inputValue.length >= 2)
    );
    
    if (shouldTrigger && inputValue !== lastRecognitionValue) {
      setLastRecognitionValue(inputValue);
      onRecognitionTriggered?.();
      
      // Trigger recognition with debouncing handled by the hook
      performRecognition(recognitionInput);
    }
  };

  /**
   * Update field state based on recognition results
   */
  useEffect(() => {
    if (!isRecognizing && currentRecognition) {
      const hasMatch = currentRecognition.status !== 'no_match';
      setFieldState(hasMatch ? 'recognized' : 'no_match');
      onRecognitionComplete?.(hasMatch);
    } else if (isRecognizing) {
      setFieldState('typing');
    }
  }, [currentRecognition, isRecognizing, onRecognitionComplete]);

  /**
   * Get field styling based on state
   */
  const getFieldStyling = () => {
    switch (fieldState) {
      case 'typing':
        return {
          className: "border-blue-300 focus:border-blue-400",
          icon: <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        };
      case 'recognized':
        return {
          className: "border-green-300 focus:border-green-400 bg-green-50",
          icon: <CheckCircle className="h-4 w-4 text-green-600" />
        };
      case 'no_match':
        return {
          className: "border-gray-300",
          icon: null
        };
      default:
        return {
          className: "",
          icon: null
        };
    }
  };

  const { className: stateClassName, icon } = getFieldStyling();

  /**
   * Render recognition status indicator
   */
  const renderStatusIndicator = () => {
    if (!triggerRecognition) return null;

    switch (fieldState) {
      case 'typing':
        return (
          <div className="flex items-center gap-1 mt-1 text-xs text-blue-600">
            <Search className="h-3 w-3" />
            <span>Checking our records...</span>
          </div>
        );
      
      case 'recognized':
        const matchStatus = currentRecognition?.status;
        if (matchStatus === 'auto_linked') {
          return (
            <div className="flex items-center gap-1 mt-1 text-xs text-green-700">
              <Sparkles className="h-3 w-3" />
              <span>Information automatically filled</span>
            </div>
          );
        } else if (matchStatus === 'suggest_match') {
          return (
            <div className="flex items-center gap-1 mt-1 text-xs text-blue-700">
              <AlertCircle className="h-3 w-3" />
              <span>Possible match found - please confirm above</span>
            </div>
          );
        }
        break;
      
      case 'no_match':
        // Only show for email fields to avoid being too noisy
        if (fieldName === 'email' && value.includes('@')) {
          return (
            <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
              <span>Welcome! Looks like this is your first time with us.</span>
            </div>
          );
        }
        break;
    }
    
    return null;
  };

  /**
   * Check if field should be pre-filled from recognition
   */
  const getEffectiveValue = () => {
    if (currentRecognition?.status === 'auto_linked' && currentRecognition.match?.profile) {
      const profileValue = currentRecognition.match.profile[fieldName];
      if (profileValue && !value) {
        // Auto-fill empty fields
        return String(profileValue);
      }
    }
    return value;
  };

  const effectiveValue = getEffectiveValue();

  return (
    <div className="space-y-2">
      <Label htmlFor={`field-${fieldName}`} className="flex items-center gap-2">
        {label}
        {required && <span className="text-red-500">*</span>}
        
        {/* Recognition confidence badge */}
        {currentRecognition?.status === 'auto_linked' && currentRecognition.match?.profile[fieldName] && (
          <Badge variant="secondary" className="text-xs h-4 bg-green-100 text-green-700">
            <Sparkles className="h-2 w-2 mr-1" />
            Auto-filled
          </Badge>
        )}
      </Label>
      
      <div className="relative">
        <Input
          id={`field-${fieldName}`}
          type={type}
          placeholder={placeholder}
          value={effectiveValue}
          onChange={(e) => handleInputChange(e.target.value)}
          disabled={disabled}
          className={`${stateClassName} ${className} ${icon ? 'pr-10' : ''}`}
        />
        
        {/* Status icon */}
        {icon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            {icon}
          </div>
        )}
      </div>
      
      {/* Status indicator */}
      {renderStatusIndicator()}
    </div>
  );
}

/**
 * Email field with built-in recognition
 */
export function RecognitionEmailField(props: Omit<RecognitionFormFieldProps, 'fieldName' | 'type'>) {
  return (
    <RecognitionFormField
      {...props}
      fieldName="email"
      type="email"
      placeholder="Enter your email address"
    />
  );
}

/**
 * Phone field with built-in recognition
 */
export function RecognitionPhoneField(props: Omit<RecognitionFormFieldProps, 'fieldName' | 'type'>) {
  return (
    <RecognitionFormField
      {...props}
      fieldName="phone"
      type="tel"
      placeholder="Enter your phone number"
    />
  );
}

/**
 * First name field with built-in recognition
 */
export function RecognitionFirstNameField(props: Omit<RecognitionFormFieldProps, 'fieldName'>) {
  return (
    <RecognitionFormField
      {...props}
      fieldName="firstName"
      placeholder="Enter your first name"
    />
  );
}

/**
 * Last name field with built-in recognition
 */
export function RecognitionLastNameField(props: Omit<RecognitionFormFieldProps, 'fieldName'>) {
  return (
    <RecognitionFormField
      {...props}
      fieldName="lastName"
      placeholder="Enter your last name"
    />
  );
}