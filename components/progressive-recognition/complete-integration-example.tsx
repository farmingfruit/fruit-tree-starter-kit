/**
 * Complete Progressive Recognition Integration Example
 * 
 * This component demonstrates how to integrate all progressive recognition
 * features into a real church event registration form. It showcases the
 * complete user journey from initial form interaction to family registration.
 * 
 * This serves as both a demonstration and a template for implementing
 * progressive recognition in actual church forms.
 */

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  RecognitionProvider, 
  RecognitionBanner,
  RecognitionEmailField,
  RecognitionPhoneField,
  RecognitionFirstNameField,
  RecognitionLastNameField,
  FamilyRegistration,
  useRecognition
} from "./index";
import { RecognitionInput } from "@/lib/progressive-recognition";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar, MapPin, Clock, Users, Star } from "lucide-react";

// Mock church and event data
const CHURCH_ID = "church_123";
const EVENT_DATA = {
  name: "Easter Sunday Service 2024",
  date: "Sunday, March 31, 2024",
  time: "10:00 AM - 12:00 PM",
  location: "Main Sanctuary",
  description: "Join us for our special Easter celebration with worship, communion, and fellowship.",
  requiresAge: false,
  minAge: undefined,
  maxAge: undefined
};

interface RegistrationFormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  
  // Additional Information
  address: string;
  city: string;
  state: string;
  zipCode: string;
  dateOfBirth: string;
  
  // Event-specific fields
  specialNeeds: string;
  firstTimeVisitor: boolean;
  howDidYouHear: string;
  
  // Family registration
  selectedFamilyMembers: any[];
}

/**
 * Main registration form component
 */
function RegistrationFormContent() {
  const { currentRecognition } = useRecognition();
  const [formData, setFormData] = useState<RegistrationFormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    dateOfBirth: "",
    specialNeeds: "",
    firstTimeVisitor: false,
    howDidYouHear: "",
    selectedFamilyMembers: []
  });
  
  const [formStep, setFormStep] = useState<'personal' | 'family' | 'details' | 'confirmation'>('personal');
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * Update form field
   */
  const updateField = (field: keyof RegistrationFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  /**
   * Get current form data for recognition
   */
  const getCurrentRecognitionInput = (): RecognitionInput => ({
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    phone: formData.phone,
    address: formData.address,
    city: formData.city,
    state: formData.state,
    zipCode: formData.zipCode,
    dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined
  });

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Simulate API submission
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      console.log('Registration submitted:', {
        personalInfo: formData,
        familyMembers: formData.selectedFamilyMembers,
        recognitionMatch: currentRecognition?.match
      });
      
      setFormStep('confirmation');
      
    } catch (error) {
      console.error('Submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Render personal information step
   */
  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      {/* Recognition Banner */}
      <RecognitionBanner 
        churchId={CHURCH_ID}
        onConfirm={(confirmed) => {
          if (confirmed && currentRecognition?.match?.profile) {
            const profile = currentRecognition.match.profile;
            setFormData(prev => ({
              ...prev,
              firstName: profile.firstName || prev.firstName,
              lastName: profile.lastName || prev.lastName,
              email: profile.email || prev.email,
              phone: profile.phone || prev.phone,
              address: profile.address || prev.address,
              city: profile.city || prev.city,
              state: profile.state || prev.state,
              zipCode: profile.zipCode || prev.zipCode
            }));
          }
        }}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <RecognitionFirstNameField
          churchId={CHURCH_ID}
          label="First Name"
          value={formData.firstName}
          onChange={(value) => updateField('firstName', value)}
          required
          formData={getCurrentRecognitionInput()}
        />
        
        <RecognitionLastNameField
          churchId={CHURCH_ID}
          label="Last Name"
          value={formData.lastName}
          onChange={(value) => updateField('lastName', value)}
          required
          formData={getCurrentRecognitionInput()}
        />
      </div>

      <RecognitionEmailField
        churchId={CHURCH_ID}
        label="Email Address"
        value={formData.email}
        onChange={(value) => updateField('email', value)}
        required
        formData={getCurrentRecognitionInput()}
      />

      <RecognitionPhoneField
        churchId={CHURCH_ID}
        label="Phone Number"
        value={formData.phone}
        onChange={(value) => updateField('phone', value)}
        formData={getCurrentRecognitionInput()}
      />

      {/* Address Information */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-gray-900">Address Information</h3>
        
        <div className="space-y-2">
          <Label htmlFor="address">Street Address</Label>
          <Input
            id="address"
            value={formData.address}
            onChange={(e) => updateField('address', e.target.value)}
            placeholder="123 Main Street"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            <Input
              id="city"
              value={formData.city}
              onChange={(e) => updateField('city', e.target.value)}
              placeholder="City"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="state">State</Label>
            <Input
              id="state"
              value={formData.state}
              onChange={(e) => updateField('state', e.target.value)}
              placeholder="State"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="zipCode">ZIP Code</Label>
            <Input
              id="zipCode"
              value={formData.zipCode}
              onChange={(e) => updateField('zipCode', e.target.value)}
              placeholder="12345"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth (Optional)</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateField('dateOfBirth', e.target.value)}
        />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={() => setFormStep('family')}
          disabled={!formData.firstName || !formData.lastName || !formData.email}
        >
          Continue to Family Registration
        </Button>
      </div>
    </div>
  );

  /**
   * Render family registration step
   */
  const renderFamilyStep = () => (
    <div className="space-y-6">
      {currentRecognition?.match?.familyMembers && currentRecognition.match.familyMembers.length > 0 ? (
        <FamilyRegistration
          familyMembers={currentRecognition.match.familyMembers}
          onSelectionChange={(selectedMembers) => {
            updateField('selectedFamilyMembers', selectedMembers);
          }}
          eventContext={EVENT_DATA}
        />
      ) : (
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Family Members Found</h3>
            <p className="text-gray-600">
              We didn't find any family members associated with your profile. 
              You can continue with just your registration.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setFormStep('personal')}>
          Back to Personal Info
        </Button>
        <Button onClick={() => setFormStep('details')}>
          Continue to Event Details
        </Button>
      </div>
    </div>
  );

  /**
   * Render event details step
   */
  const renderDetailsStep = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="specialNeeds">Special Needs or Accommodations</Label>
        <Textarea
          id="specialNeeds"
          value={formData.specialNeeds}
          onChange={(e) => updateField('specialNeeds', e.target.value)}
          placeholder="Please let us know if you need any special accommodations..."
          rows={3}
        />
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="firstTimeVisitor"
          checked={formData.firstTimeVisitor}
          onCheckedChange={(checked) => updateField('firstTimeVisitor', checked)}
        />
        <Label htmlFor="firstTimeVisitor">This is my first time visiting this church</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="howDidYouHear">How did you hear about this event?</Label>
        <Input
          id="howDidYouHear"
          value={formData.howDidYouHear}
          onChange={(e) => updateField('howDidYouHear', e.target.value)}
          placeholder="Website, friend, social media, etc."
        />
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setFormStep('family')}>
          Back to Family Registration
        </Button>
        <Button onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Complete Registration'}
        </Button>
      </div>
    </div>
  );

  /**
   * Render confirmation step
   */
  const renderConfirmationStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        <Star className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete!</h2>
        <p className="text-gray-600">
          Thank you for registering for {EVENT_DATA.name}. 
          {formData.selectedFamilyMembers.length > 0 && (
            ` We've also registered ${formData.selectedFamilyMembers.length} family member${formData.selectedFamilyMembers.length > 1 ? 's' : ''}.`
          )}
        </p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
        <h3 className="font-medium text-blue-900 mb-2">Event Details:</h3>
        <div className="space-y-1 text-sm text-blue-800">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span>{EVENT_DATA.date}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>{EVENT_DATA.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            <span>{EVENT_DATA.location}</span>
          </div>
        </div>
      </div>

      <p className="text-sm text-gray-500">
        You should receive a confirmation email shortly with all the details.
      </p>
    </div>
  );

  /**
   * Render current step
   */
  const renderCurrentStep = () => {
    switch (formStep) {
      case 'personal':
        return renderPersonalInfoStep();
      case 'family':
        return renderFamilyStep();
      case 'details':
        return renderDetailsStep();
      case 'confirmation':
        return renderConfirmationStep();
      default:
        return renderPersonalInfoStep();
    }
  };

  /**
   * Render step indicator
   */
  const renderStepIndicator = () => {
    if (formStep === 'confirmation') return null;

    const steps = [
      { key: 'personal', label: 'Personal Info' },
      { key: 'family', label: 'Family' },
      { key: 'details', label: 'Event Details' }
    ];

    return (
      <div className="flex items-center justify-center space-x-4 mb-8">
        {steps.map((step, index) => {
          const isActive = step.key === formStep;
          const isCompleted = steps.findIndex(s => s.key === formStep) > index;

          return (
            <div key={step.key} className="flex items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                ${isActive ? 'bg-blue-600 text-white' : 
                  isCompleted ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-600'}
              `}>
                {index + 1}
              </div>
              <span className={`ml-2 text-sm font-medium ${
                isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <div className={`ml-4 w-8 h-0.5 ${
                  isCompleted ? 'bg-green-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {renderStepIndicator()}
      {renderCurrentStep()}
    </div>
  );
}

/**
 * Main component with provider wrapper
 */
export function CompleteIntegrationExample() {
  return (
    <RecognitionProvider>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">
                {EVENT_DATA.name}
              </CardTitle>
              <CardDescription className="mt-2">
                {EVENT_DATA.description}
              </CardDescription>
              
              <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
                <div className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>{EVENT_DATA.date}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{EVENT_DATA.time}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  <span>{EVENT_DATA.location}</span>
                </div>
              </div>
            </div>

            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              Free Event
            </Badge>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="p-6">
          <RegistrationFormContent />
        </CardContent>
      </Card>
    </RecognitionProvider>
  );
}

export default CompleteIntegrationExample;