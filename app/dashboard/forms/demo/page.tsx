"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  ArrowLeft,
  CheckCircle, 
  Users, 
  Calendar, 
  MapPin, 
  Clock, 
  CreditCard,
  Shield,
  Sparkles,
  Heart,
  Phone,
  Mail,
  Home,
  User,
  Baby,
  Utensils,
  Shirt,
  MessageSquare,
  Star
} from "lucide-react";
import Link from "next/link";

export default function FormDemoPage() {
  const [selectedDemo, setSelectedDemo] = useState<"visitor" | "registration">("visitor");
  const [formStep, setFormStep] = useState(1);
  const [recognitionShown, setRecognitionShown] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    visitReason: "",
    prayers: "",
    familyMembers: [] as any[]
  });

  const handleEmailChange = (email: string) => {
    setFormData(prev => ({ ...prev, email }));
    
    // Simulate progressive recognition for demo
    if (email === "john.smith@email.com" && !recognitionShown) {
      setTimeout(() => {
        setRecognitionShown(true);
        setFormData(prev => ({
          ...prev,
          firstName: "John",
          lastName: "Smith",
          phone: "(555) 123-4567",
          address: "456 Oak Avenue, Springfield, IL 62701"
        }));
      }, 1500);
    }
  };

  const VisitorCardForm = () => (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="bg-blue-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Heart className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Welcome to Grace Community Church!</h2>
            <p className="text-blue-100 text-sm">We're so glad you're here today</p>
          </div>
        </div>
      </div>

      {/* Progressive Recognition */}
      {recognitionShown && (
        <div className="bg-green-50 border-b border-green-200 p-4 animate-in slide-in-from-top">
          <div className="flex items-center gap-2 text-green-700">
            <CheckCircle className="h-5 w-5" />
            <span className="font-medium">Welcome back, John! 👋</span>
          </div>
          <p className="text-sm text-green-600 mt-1">
            We've pre-filled your information to save you time. Please update anything that's changed.
          </p>
        </div>
      )}

      {/* Form */}
      <div className="p-6 space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              placeholder="your.email@example.com"
              value={formData.email}
              onChange={(e) => handleEmailChange(e.target.value)}
              className={recognitionShown ? "border-green-300 bg-green-50" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="(555) 123-4567"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              className={recognitionShown ? "border-green-300 bg-green-50" : ""}
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              placeholder="John"
              value={formData.firstName}
              onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
              className={recognitionShown ? "border-green-300 bg-green-50" : ""}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              placeholder="Smith"
              value={formData.lastName}
              onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
              className={recognitionShown ? "border-green-300 bg-green-50" : ""}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            placeholder="Street address, City, State, ZIP"
            value={formData.address}
            onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
            className={recognitionShown ? "border-green-300 bg-green-50" : ""}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="visitReason">What brought you to Grace Community today?</Label>
          <Select value={formData.visitReason} onValueChange={(value) => setFormData(prev => ({ ...prev, visitReason: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select a reason" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="first-time">First time visiting</SelectItem>
              <SelectItem value="invited">Invited by a friend</SelectItem>
              <SelectItem value="moved">Recently moved to the area</SelectItem>
              <SelectItem value="searching">Searching for a church home</SelectItem>
              <SelectItem value="special-event">Special service/event</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="prayers">Prayer Requests or Comments</Label>
          <Textarea
            id="prayers"
            placeholder="Share any prayer requests or let us know how we can serve you..."
            rows={3}
            value={formData.prayers}
            onChange={(e) => setFormData(prev => ({ ...prev, prayers: e.target.value }))}
          />
        </div>

        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Your Privacy Matters</p>
              <p className="text-blue-700 mt-1">
                We'll only use this information to connect with you about Grace Community Church. 
                We never share your details with third parties.
              </p>
            </div>
          </div>
        </div>

        <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
          <Heart className="mr-2 h-4 w-4" />
          Submit Visitor Card
        </Button>
      </div>
    </div>
  );

  const RegistrationForm = () => (
    <div className="bg-white rounded-lg border shadow-sm">
      {/* Header */}
      <div className="bg-green-600 text-white p-6 rounded-t-lg">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
            <Calendar className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-xl font-semibold">Summer Family Camp 2024</h2>
            <p className="text-green-100 text-sm">August 15-18, 2024 • Camp Woodland Retreat</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1">
            <MapPin className="h-4 w-4" />
            <span>Lake Tahoe, CA</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>142/200 registered</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>Registration closes July 1st</span>
          </div>
        </div>
      </div>

      {/* Form Steps */}
      <div className="border-b bg-muted/30">
        <div className="flex p-2">
          {[1, 2, 3].map((step) => (
            <button
              key={step}
              onClick={() => setFormStep(step)}
              className={`flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                formStep === step
                  ? "bg-green-600 text-white"
                  : formStep > step
                  ? "bg-green-100 text-green-700"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <div className="flex items-center gap-2 justify-center">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                  formStep === step ? "bg-white/20" : formStep > step ? "bg-green-200" : "bg-muted"
                }`}>
                  {step}
                </span>
                <span className="hidden sm:inline">
                  {step === 1 ? "Contact Info" : step === 2 ? "Camp Details" : "Payment"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <div className="p-6">
        {formStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>First Name *</Label>
                  <Input placeholder="John" />
                </div>
                <div className="space-y-2">
                  <Label>Last Name *</Label>
                  <Input placeholder="Smith" />
                </div>
                <div className="space-y-2">
                  <Label>Email Address *</Label>
                  <Input type="email" placeholder="john.smith@email.com" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number *</Label>
                  <Input type="tel" placeholder="(555) 123-4567" />
                </div>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">Family Registration</span>
              </div>
              <p className="text-sm text-blue-700 mb-3">
                Register additional family members for camp at the same time.
              </p>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="rounded" />
                    <div>
                      <p className="font-medium text-sm">Sarah Smith</p>
                      <p className="text-xs text-muted-foreground">Spouse • Adult</p>
                    </div>
                  </div>
                  <Badge variant="outline">$150</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-white rounded border">
                  <div className="flex items-center gap-3">
                    <input type="checkbox" className="rounded" />
                    <div>
                      <p className="font-medium text-sm">Emma Smith</p>
                      <p className="text-xs text-muted-foreground">Child • Age 12</p>
                    </div>
                  </div>
                  <Badge variant="outline">$75</Badge>
                </div>
              </div>
            </div>
          </div>
        )}

        {formStep === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Camp Details</h3>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>T-Shirt Size *</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="xs">Extra Small</SelectItem>
                      <SelectItem value="s">Small</SelectItem>
                      <SelectItem value="m">Medium</SelectItem>
                      <SelectItem value="l">Large</SelectItem>
                      <SelectItem value="xl">Extra Large</SelectItem>
                      <SelectItem value="xxl">2X Large</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Cabin Preference</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select preference" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="no-preference">No Preference</SelectItem>
                      <SelectItem value="lakeside">Lakeside Cabins</SelectItem>
                      <SelectItem value="forest">Forest Cabins</SelectItem>
                      <SelectItem value="family">Family Cabins</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Dietary Restrictions or Allergies</Label>
              <Textarea 
                placeholder="Please list any food allergies or dietary restrictions we should know about..."
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>Emergency Contact</Label>
              <div className="grid md:grid-cols-2 gap-4">
                <Input placeholder="Emergency contact name" />
                <Input placeholder="Emergency contact phone" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Special Needs or Requests</Label>
              <Textarea 
                placeholder="Any special accommodations or requests for camp..."
                rows={2}
              />
            </div>
          </div>
        )}

        {formStep === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Payment Summary</h3>
              <div className="bg-muted/50 rounded-lg p-4 space-y-3">
                <div className="flex justify-between">
                  <span>John Smith (Adult)</span>
                  <span>$150.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Sarah Smith (Adult)</span>
                  <span>$150.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Emma Smith (Child)</span>
                  <span>$75.00</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>$375.00</span>
                </div>
              </div>
            </div>

            <Alert>
              <CreditCard className="h-4 w-4" />
              <AlertDescription>
                Payment will be processed securely through Stripe. You'll receive a confirmation email with your registration details and payment receipt.
              </AlertDescription>
            </Alert>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <div className="border rounded-lg p-4 bg-muted/30">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Credit card details will be collected on the next step</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button 
            variant="outline" 
            onClick={() => setFormStep(Math.max(1, formStep - 1))}
            disabled={formStep === 1}
          >
            Previous
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Step {formStep} of 3
            </p>
          </div>
          
          <Button 
            onClick={() => formStep === 3 ? null : setFormStep(Math.min(3, formStep + 1))}
            className={formStep === 3 ? "bg-green-600 hover:bg-green-700" : ""}
          >
            {formStep === 3 ? (
              <>
                <CreditCard className="mr-2 h-4 w-4" />
                Complete Registration
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-background border-b">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard/forms">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Forms
                </Button>
              </Link>
              <div>
                <h1 className="text-xl font-semibold">Form Builder Demo</h1>
                <p className="text-sm text-muted-foreground">
                  Experience how church forms work for your members and visitors
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Demo Selection */}
        <div className="mb-8">
          <Tabs value={selectedDemo} onValueChange={(value) => setSelectedDemo(value as any)}>
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="visitor" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Visitor Card</span>
                <span className="sm:hidden">Visitor</span>
              </TabsTrigger>
              <TabsTrigger value="registration" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Event Registration</span>
                <span className="sm:hidden">Event</span>
              </TabsTrigger>
            </TabsList>

            <div className="mt-6">
              <TabsContent value="visitor">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Visitor Welcome Card</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    See how new visitors experience your church's welcome process. Try entering "john.smith@email.com" 
                    to see the progressive recognition feature in action.
                  </p>
                </div>
                <VisitorCardForm />
              </TabsContent>

              <TabsContent value="registration">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-semibold mb-2">Event Registration Form</h2>
                  <p className="text-muted-foreground max-w-2xl mx-auto">
                    Experience a multi-step registration form with family signup options, capacity management, 
                    and payment processing.
                  </p>
                </div>
                <RegistrationForm />
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Features Highlight */}
        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <CardTitle className="text-lg">Progressive Recognition</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatically recognize returning visitors and pre-fill their information to create a seamless, 
                welcoming experience that saves time.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-2">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <CardTitle className="text-lg">Family Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Allow families to register multiple members at once, with automatic relationship detection 
                and household management built-in.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-2">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
              <CardTitle className="text-lg">Church-Focused Design</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Every element is designed specifically for churches, with appropriate language, 
                workflows, and features that make sense for religious organizations.
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-semibold mb-3">Ready to Build Your Own Forms?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Create professional, church-specific forms in minutes with our intuitive drag-and-drop builder. 
              No technical skills required.
            </p>
            <Link href="/dashboard/forms/builder">
              <Button size="lg" variant="secondary">
                Start Building Forms
                <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}