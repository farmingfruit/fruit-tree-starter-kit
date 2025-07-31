"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  ArrowRight, 
  Save, 
  Eye, 
  Settings, 
  Palette, 
  Users, 
  CreditCard, 
  Calendar,
  UserCheck,
  Plus,
  GripVertical,
  Trash2,
  Copy,
  AlertCircle
} from "lucide-react";
import Link from "next/link";
import { FormBuilder } from "./components/form-builder";
import { FormPreview } from "./components/form-preview";
import { FormSettings } from "./components/form-settings";
import { ProgressiveRecognitionDemo } from "./components/progressive-recognition-demo";

type FormType = "general" | "registration";
type Step = "basics" | "builder" | "settings" | "preview";

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
  type: FormType;
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

const defaultFormData: FormData = {
  name: "",
  description: "",
  type: "general",
  fields: [
    { id: "1", type: "text", label: "First Name", required: true },
    { id: "2", type: "text", label: "Last Name", required: true },
    { id: "3", type: "email", label: "Email Address", required: true },
    { id: "4", type: "phone", label: "Phone Number", required: false },
  ],
  settings: {
    requiresAuth: false,
    allowAnonymous: true,
    enableProgressiveRecognition: true,
    enableFamilyRegistration: false,
    enableWaitlist: true,
    requiresPayment: false,
    brandColor: "#3B82F6",
    confirmationMessage: "Thank you for your submission! We'll be in touch soon."
  }
};

export default function FormBuilderPage() {
  const searchParams = useSearchParams();
  const typeParam = searchParams?.get("type") as FormType;
  
  const [currentStep, setCurrentStep] = useState<Step>("basics");
  const [formData, setFormData] = useState<FormData>({
    ...defaultFormData,
    type: typeParam || "general"
  });
  const [saving, setSaving] = useState(false);

  // Update form type based on URL parameter
  useEffect(() => {
    if (typeParam && (typeParam === "general" || typeParam === "registration")) {
      setFormData(prev => ({ ...prev, type: typeParam }));
    }
  }, [typeParam]);

  const steps: { key: Step; label: string; description: string; icon: any }[] = [
    { 
      key: "basics", 
      label: "Form Details", 
      description: "Name and describe your form",
      icon: UserCheck 
    },
    { 
      key: "builder", 
      label: "Build Form", 
      description: "Add and arrange form fields",
      icon: Plus 
    },
    { 
      key: "settings", 
      label: "Settings", 
      description: "Configure options and appearance",
      icon: Settings 
    },
    { 
      key: "preview", 
      label: "Preview & Publish", 
      description: "Review and publish your form",
      icon: Eye 
    }
  ];

  const currentStepIndex = steps.findIndex(s => s.key === currentStep);
  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  const canProceed = () => {
    switch (currentStep) {
      case "basics":
        return formData.name.trim().length > 0;
      case "builder":
        return formData.fields.length > 0;
      case "settings":
        return true;
      case "preview":
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (!isLastStep) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const prevStep = () => {
    if (!isFirstStep) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStep(steps[prevIndex].key);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSaving(false);
    // In real app, redirect to forms list or show success message
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/forms">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Forms
                </Button>
              </Link>
              <Separator orientation="vertical" className="h-6" />
              <div>
                <h1 className="text-xl font-semibold">
                  {formData.name || "New Form"}
                </h1>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={formData.type === "registration" ? "default" : "secondary"}>
                    {formData.type === "registration" ? "Event Registration" : "Contact Form"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Step {currentStepIndex + 1} of {steps.length}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleSave} disabled={saving}>
                <Save className="mr-2 h-4 w-4" />
                {saving ? "Saving..." : "Save Draft"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-background border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = step.key === currentStep;
              const isCompleted = index < currentStepIndex;
              
              return (
                <div key={step.key} className="flex items-center">
                  <button
                    onClick={() => setCurrentStep(step.key)}
                    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : isCompleted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      isActive 
                        ? "bg-primary-foreground/20" 
                        : isCompleted
                        ? "bg-green-200"
                        : "bg-muted"
                    }`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="text-left hidden sm:block">
                      <div className="font-medium text-sm">{step.label}</div>
                      <div className="text-xs opacity-70">{step.description}</div>
                    </div>
                  </button>
                  {index < steps.length - 1 && (
                    <div className="w-8 h-px bg-border mx-2 hidden md:block" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Builder Content */}
          <div className="space-y-6">
            {currentStep === "basics" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="h-5 w-5" />
                    Form Details
                  </CardTitle>
                  <CardDescription>
                    Give your form a clear name and description so people know what it's for.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="form-name">Form Name *</Label>
                    <Input
                      id="form-name"
                      placeholder="e.g., Sunday Service Visitor Card"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="text-lg"
                    />
                    <p className="text-xs text-muted-foreground">
                      This will appear at the top of your form
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="form-description">Description</Label>
                    <Textarea
                      id="form-description"
                      placeholder="Brief description of what this form is for..."
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                    <p className="text-xs text-muted-foreground">
                      Optional: Help people understand what information you're collecting
                    </p>
                  </div>

                  <div className="space-y-4">
                    <Label>Form Type</Label>
                    <div className="grid grid-cols-1 gap-3">
                      <label className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.type === "general" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                      }`}>
                        <input
                          type="radio"
                          name="formType"
                          value="general"
                          checked={formData.type === "general"}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as FormType }))}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <UserCheck className="h-5 w-5 mt-0.5 text-blue-600" />
                          <div>
                            <div className="font-medium">Contact Form</div>
                            <div className="text-sm text-muted-foreground">
                              For visitor cards, volunteer signups, prayer requests, surveys
                            </div>
                          </div>
                        </div>
                      </label>
                      
                      <label className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                        formData.type === "registration" ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground"
                      }`}>
                        <input
                          type="radio"
                          name="formType"
                          value="registration"
                          checked={formData.type === "registration"}
                          onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as FormType }))}
                          className="sr-only"
                        />
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 mt-0.5 text-green-600" />
                          <div>
                            <div className="font-medium">Event Registration</div>
                            <div className="text-sm text-muted-foreground">
                              For events with capacity limits, payments, and family registration
                            </div>
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {currentStep === "builder" && (
              <FormBuilder 
                formData={formData} 
                setFormData={setFormData} 
              />
            )}

            {currentStep === "settings" && (
              <FormSettings 
                formData={formData} 
                setFormData={setFormData} 
              />
            )}

            {currentStep === "preview" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Ready to Publish
                  </CardTitle>
                  <CardDescription>
                    Your form is ready! Review the preview and publish when you're satisfied.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <div className="bg-green-100 rounded-full p-1">
                        <Eye className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-green-900">Form Preview</h4>
                        <p className="text-sm text-green-700 mt-1">
                          This is exactly how your form will appear to users. The preview on the right shows the mobile version.
                        </p>
                      </div>
                    </div>
                  </div>

                  <ProgressiveRecognitionDemo />

                  <div className="flex gap-3">
                    <Button className="flex-1" size="lg">
                      <Save className="mr-2 h-4 w-4" />
                      Publish Form
                    </Button>
                    <Button variant="outline" size="lg">
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Preview Panel */}
          <div className="lg:sticky lg:top-8">
            <FormPreview formData={formData} />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={prevStep} 
            disabled={isFirstStep}
            size="lg"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Step {currentStepIndex + 1} of {steps.length}
            </p>
          </div>
          
          <Button 
            onClick={nextStep} 
            disabled={isLastStep || !canProceed()}
            size="lg"
          >
            Next
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}