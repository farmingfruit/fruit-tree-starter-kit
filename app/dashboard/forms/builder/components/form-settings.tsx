"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { 
  Settings, 
  Palette, 
  Shield, 
  Users, 
  CreditCard, 
  Calendar,
  Mail,
  Upload,
  AlertCircle,
  CheckCircle,
  Eye,
  Clock
} from "lucide-react";

interface FormData {
  name: string;
  description: string;
  type: "general" | "registration";
  fields: any[];
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

interface FormSettingsProps {
  formData: FormData;
  setFormData: (data: FormData | ((prev: FormData) => FormData)) => void;
}

const brandColors = [
  { name: "Blue", value: "#3B82F6" },
  { name: "Green", value: "#10B981" },
  { name: "Purple", value: "#8B5CF6" },
  { name: "Red", value: "#EF4444" },
  { name: "Orange", value: "#F97316" },
  { name: "Teal", value: "#14B8A6" },
  { name: "Indigo", value: "#6366F1" },
  { name: "Pink", value: "#EC4899" },
];

export function FormSettings({ formData, setFormData }: FormSettingsProps) {
  const updateSettings = (key: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [key]: value
      }
    }));
  };

  return (
    <div className="space-y-6">
      {/* Appearance Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Appearance & Branding
          </CardTitle>
          <CardDescription>
            Customize how your form looks to match your church's branding
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <Label>Brand Color</Label>
            <div className="grid grid-cols-4 gap-3">
              {brandColors.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateSettings("brandColor", color.value)}
                  className={`w-full h-12 rounded-lg border-2 transition-all ${
                    formData.settings.brandColor === color.value
                      ? "border-foreground scale-105"
                      : "border-border hover:border-muted-foreground"
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {formData.settings.brandColor === color.value && (
                    <CheckCircle className="h-4 w-4 text-white mx-auto" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                type="color"
                value={formData.settings.brandColor}
                onChange={(e) => updateSettings("brandColor", e.target.value)}
                className="w-16 h-10 p-1 border rounded"
              />
              <Input
                type="text"
                value={formData.settings.brandColor}
                onChange={(e) => updateSettings("brandColor", e.target.value)}
                placeholder="#3B82F6"
                className="flex-1"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo-upload">Church Logo</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-2">
                  Upload your church logo (optional)
                </p>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Choose File
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: PNG or JPG, max 2MB, 200x200px or larger
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Access & Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access & Security
          </CardTitle>
          <CardDescription>
            Control who can access and submit your form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Allow Anonymous Submissions</Label>
              <p className="text-sm text-muted-foreground">
                People can submit without logging in or providing contact info
              </p>
            </div>
            <Switch
              checked={formData.settings.allowAnonymous}
              onCheckedChange={(checked) => updateSettings("allowAnonymous", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Progressive Recognition</Label>
              <p className="text-sm text-muted-foreground">
                Automatically recognize returning visitors and pre-fill their information
              </p>
            </div>
            <Switch
              checked={formData.settings.enableProgressiveRecognition}
              onCheckedChange={(checked) => updateSettings("enableProgressiveRecognition", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Require Login</Label>
              <p className="text-sm text-muted-foreground">
                Only logged-in church members can access this form
              </p>
            </div>
            <Switch
              checked={formData.settings.requiresAuth}
              onCheckedChange={(checked) => updateSettings("requiresAuth", checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Registration-specific Settings */}
      {formData.type === "registration" && (
        <>
          {/* Capacity Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Capacity & Registration
              </CardTitle>
              <CardDescription>
                Manage event capacity and registration limits
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="max-capacity">Maximum Capacity</Label>
                <Input
                  id="max-capacity"
                  type="number"
                  min="1"
                  placeholder="e.g., 200"
                  value={formData.settings.maxCapacity || ""}
                  onChange={(e) => updateSettings("maxCapacity", e.target.value ? parseInt(e.target.value) : undefined)}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty for unlimited capacity
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Enable Waitlist</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow people to join a waitlist when capacity is reached
                  </p>
                </div>
                <Switch
                  checked={formData.settings.enableWaitlist}
                  onCheckedChange={(checked) => updateSettings("enableWaitlist", checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Family Registration</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow registering multiple family members at once
                  </p>
                </div>
                <Switch
                  checked={formData.settings.enableFamilyRegistration}
                  onCheckedChange={(checked) => updateSettings("enableFamilyRegistration", checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Settings
              </CardTitle>
              <CardDescription>
                Configure payment collection for paid events
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Require Payment</Label>
                  <p className="text-sm text-muted-foreground">
                    Collect payment as part of registration
                  </p>
                </div>
                <Switch
                  checked={formData.settings.requiresPayment}
                  onCheckedChange={(checked) => updateSettings("requiresPayment", checked)}
                />
              </div>

              {formData.settings.requiresPayment && (
                <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                  <div className="space-y-2">
                    <Label htmlFor="payment-amount">Registration Fee</Label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
                      <Input
                        id="payment-amount"
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="25.00"
                        className="pl-8"
                        value={formData.settings.paymentAmount ? (formData.settings.paymentAmount / 100).toFixed(2) : ""}
                        onChange={(e) => updateSettings("paymentAmount", e.target.value ? Math.round(parseFloat(e.target.value) * 100) : undefined)}
                      />
                    </div>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                      <div className="text-sm">
                        <p className="font-medium text-blue-900">Payment Processing</p>
                        <p className="text-blue-700 mt-1">
                          Payments are processed securely through Stripe. Processing fees (2.9% + 30¢) will be deducted from each transaction.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}

      {/* Confirmation & Communication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Confirmation & Follow-up
          </CardTitle>
          <CardDescription>
            Customize what happens after someone submits your form
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="confirmation-message">Thank You Message</Label>
            <Textarea
              id="confirmation-message"
              rows={4}
              placeholder="Thank you for your submission! We'll be in touch soon."
              value={formData.settings.confirmationMessage}
              onChange={(e) => updateSettings("confirmationMessage", e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              This message will be shown after successful form submission
            </p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                <Mail className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <Label>Email Confirmations</Label>
                <p className="text-sm text-muted-foreground">
                  Automatic confirmation emails are sent to all form submitters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <Label>Data Security</Label>
                <p className="text-sm text-muted-foreground">
                  All form data is encrypted and securely stored in your church database
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Eye className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <Label>Privacy Compliant</Label>
                <p className="text-sm text-muted-foreground">
                  Forms automatically comply with privacy regulations and church policies
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Advanced Options
          </CardTitle>
          <CardDescription>
            Additional configuration options for power users
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Form Timing</Label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="open-date" className="text-sm">Opens On</Label>
                <Input
                  id="open-date"
                  type="datetime-local"
                  className="text-sm"
                />
              </div>
              <div>
                <Label htmlFor="close-date" className="text-sm">Closes On</Label>
                <Input
                  id="close-date"
                  type="datetime-local"
                  className="text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Leave empty to keep the form always available
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="redirect-url">Redirect URL (Optional)</Label>
            <Input
              id="redirect-url"
              type="url"
              placeholder="https://your-church.com/thank-you"
            />
            <p className="text-xs text-muted-foreground">
              Redirect users to a specific page after form submission
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-amber-900">Need Help?</p>
                <p className="text-amber-700 mt-1">
                  These settings are optional. The default configuration works great for most church forms. Contact support if you need assistance.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}