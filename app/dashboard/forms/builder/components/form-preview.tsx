"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Eye, 
  Smartphone, 
  Monitor, 
  Star, 
  Shield, 
  Users, 
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle
} from "lucide-react";

interface FormField {
  id: string;
  type: "text" | "email" | "phone" | "textarea" | "select" | "checkbox" | "radio" | "date" | "number";
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[];
  description?: string;
}

interface FormData {
  name: string;
  description: string;
  type: "general" | "registration";
  fields: FormField[];
  settings: {
    requiresAuth: boolean;
    allowAnonymous: boolean;
    enableProgressiveRecognition: boolean;
    enableFamilyRegistration: boolean;
    maxCapacity?: number;
    enableWaitlist: boolean;
    requiresPayment: boolean;
    paymentAmount?: number;
    brandColor: string;
    logo?: string;
    confirmationMessage: string;
  };
}

interface FormPreviewProps {
  formData: FormData;
}

export function FormPreview({ formData }: FormPreviewProps) {
  const renderField = (field: FormField) => {
    const baseClasses = "w-full";
    
    switch (field.type) {
      case "text":
      case "email":
      case "phone":
      case "number":
        return (
          <Input
            type={field.type === "number" ? "number" : field.type === "email" ? "email" : field.type === "phone" ? "tel" : "text"}
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={baseClasses}
            disabled
          />
        );
      
      case "textarea":
        return (
          <Textarea
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={baseClasses}
            rows={3}
            disabled
          />
        );
      
      case "select":
        return (
          <Select disabled>
            <SelectTrigger className={baseClasses}>
              <SelectValue placeholder={`Select ${field.label.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option, index) => (
                <SelectItem key={index} value={option.toLowerCase().replace(/\\s+/g, '-')}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      
      case "checkbox":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`${field.id}-${index}`} disabled />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      
      case "radio":
        return (
          <div className="space-y-2">
            {field.options?.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <input
                  type="radio"
                  id={`${field.id}-${index}`}
                  name={field.id}
                  className="w-4 h-4"
                  disabled
                />
                <Label htmlFor={`${field.id}-${index}`} className="text-sm">
                  {option}
                </Label>
              </div>
            ))}
          </div>
        );
      
      case "date":
        return (
          <Input
            type="date"
            className={baseClasses}
            disabled
          />
        );
      
      default:
        return (
          <Input
            placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}`}
            className={baseClasses}
            disabled
          />
        );
    }
  };

  const PreviewContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className={`bg-white rounded-lg border ${isMobile ? 'max-w-sm mx-auto' : ''}`}>
      {/* Form Header */}
      <div 
        className="p-6 rounded-t-lg text-white"
        style={{ backgroundColor: formData.settings.brandColor }}
      >
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <Shield className="h-4 w-4" />
          </div>
          <span className="text-sm opacity-90">Secure Form</span>
        </div>
        <h2 className={`font-semibold ${isMobile ? 'text-lg' : 'text-xl'} mb-2`}>
          {formData.name || "Form Preview"}
        </h2>
        {formData.description && (
          <p className={`opacity-90 ${isMobile ? 'text-sm' : ''}`}>
            {formData.description}
          </p>
        )}
      </div>

      {/* Progressive Recognition Banner */}
      {formData.settings.enableProgressiveRecognition && (
        <div className="px-6 py-4 bg-green-50 border-b border-green-200">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-4 w-4" />
            <span className="text-sm font-medium">Looks like you're already in our system!</span>
          </div>
          <p className="text-xs text-green-600 mt-1">
            We've pre-filled some information to save you time.
          </p>
        </div>
      )}

      {/* Form Content */}
      <div className="p-6 space-y-6">
        {formData.fields.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p className={isMobile ? 'text-sm' : ''}>
              Add fields to see them in the preview
            </p>
          </div>
        ) : (
          formData.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label className={`flex items-center gap-1 ${isMobile ? 'text-sm' : ''}`}>
                {field.label}
                {field.required && <Star className="h-3 w-3 text-red-500" />}
              </Label>
              {field.description && (
                <p className="text-xs text-muted-foreground">{field.description}</p>
              )}
              {renderField(field)}
            </div>
          ))
        )}

        {/* Event-specific fields for registration forms */}
        {formData.type === "registration" && (
          <>
            {formData.settings.enableFamilyRegistration && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="h-4 w-4" />
                  <span className="font-medium">Family Registration</span>
                </div>
                <div className="bg-muted/50 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <Checkbox disabled />
                    <Label className="text-sm">Register additional family members</Label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Add family member details after completing your registration
                  </p>
                </div>
              </div>
            )}

            {formData.settings.requiresPayment && (
              <div className="border-t pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="h-4 w-4" />
                  <span className="font-medium">Payment Information</span>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm">Registration Fee</span>
                    <span className="font-medium">
                      ${formData.settings.paymentAmount ? (formData.settings.paymentAmount / 100).toFixed(2) : "0.00"}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Secure payment processing via Stripe
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {/* Submit Button */}
        <div className="pt-4">
          <Button 
            className="w-full"
            style={{ backgroundColor: formData.settings.brandColor }}
            disabled
          >
            {formData.type === "registration" ? "Register Now" : "Submit Form"}
          </Button>
        </div>

        {/* Trust indicators */}
        <div className="flex items-center justify-center gap-4 pt-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            <span>Secure</span>
          </div>
          <div className="flex items-center gap-1">
            <CheckCircle className="h-3 w-3" />
            <span>Encrypted</span>
          </div>
          {formData.settings.allowAnonymous && (
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>Private</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <Card className="sticky top-0">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5" />
          Live Preview
        </CardTitle>
        <CardDescription>
          See exactly how your form will look to users
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="desktop" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="desktop" className="flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Desktop</span>
            </TabsTrigger>
            <TabsTrigger value="mobile" className="flex items-center gap-2">
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="desktop" className="mt-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <PreviewContent />
            </div>
          </TabsContent>
          
          <TabsContent value="mobile" className="mt-4">
            <div className="border rounded-lg p-4 bg-muted/30">
              <PreviewContent isMobile />
            </div>
          </TabsContent>
        </Tabs>

        {/* Form Info */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Fields:</span>
            <span className="font-medium">{formData.fields.length}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Required:</span>
            <span className="font-medium">
              {formData.fields.filter(f => f.required).length}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Type:</span>
            <Badge variant={formData.type === "registration" ? "default" : "secondary"}>
              {formData.type === "registration" ? "Event Registration" : "Contact Form"}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}