"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle, 
  User, 
  Mail, 
  Phone, 
  Home, 
  Play, 
  RotateCcw,
  Sparkles,
  Users,
  Clock
} from "lucide-react";

export function ProgressiveRecognitionDemo() {
  const [demoStep, setDemoStep] = useState<"start" | "typing" | "recognized">("start");
  const [emailValue, setEmailValue] = useState("");

  const startDemo = () => {
    setDemoStep("typing");
    setEmailValue("");
    
    // Simulate typing
    const email = "sarah.johnson@email.com";
    let i = 0;
    const typeInterval = setInterval(() => {
      if (i < email.length) {
        setEmailValue(email.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typeInterval);
        // Wait a moment then show recognition
        setTimeout(() => {
          setDemoStep("recognized");
        }, 500);
      }
    }, 100);
  };

  const resetDemo = () => {
    setDemoStep("start");
    setEmailValue("");
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-600" />
          Progressive Recognition Demo
        </CardTitle>
        <CardDescription>
          See how the "Looks like you're already in our system!" feature works to save time for returning visitors.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Demo Controls */}
        <div className="flex gap-2">
          <Button 
            onClick={startDemo} 
            disabled={demoStep !== "start"}
            size="sm"
            variant="outline"
          >
            <Play className="mr-2 h-3 w-3" />
            {demoStep === "start" ? "Start Demo" : "Running..."}
          </Button>
          <Button 
            onClick={resetDemo} 
            size="sm"
            variant="ghost"
          >
            <RotateCcw className="mr-2 h-3 w-3" />
            Reset
          </Button>
        </div>

        {/* Demo Form */}
        <div className="border rounded-lg bg-white">
          {/* Form Header */}
          <div className="p-4 bg-blue-600 text-white rounded-t-lg">
            <h3 className="font-semibold">Easter Service Registration</h3>
            <p className="text-sm opacity-90">Join us for our special Easter celebration</p>
          </div>

          {/* Progressive Recognition Banner */}
          {demoStep === "recognized" && (
            <div className="px-4 py-3 bg-green-50 border-b border-green-200 animate-in slide-in-from-top duration-300">
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Looks like you're already in our system!</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                We've pre-filled your information to save you time. Please review and update as needed.
              </p>
            </div>
          )}

          {/* Form Fields */}
          <div className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="demo-email">Email Address *</Label>
              <Input
                id="demo-email"
                type="email"
                value={emailValue}
                onChange={(e) => setEmailValue(e.target.value)}
                placeholder="Enter your email"
                className={demoStep === "typing" ? "border-blue-300" : ""}
              />
            </div>

            {demoStep === "recognized" && (
              <>
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom duration-500">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input value="Sarah" className="bg-green-50 border-green-200" />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input value="Johnson" className="bg-green-50 border-green-200" />
                  </div>
                </div>

                <div className="space-y-2 animate-in slide-in-from-bottom duration-700">
                  <Label>Phone Number</Label>
                  <Input value="(555) 123-4567" className="bg-green-50 border-green-200" />
                </div>

                <div className="space-y-2 animate-in slide-in-from-bottom duration-1000">
                  <Label>Address</Label>
                  <Input value="123 Maple Street, Springfield, IL 62701" className="bg-green-50 border-green-200" />
                </div>

                {/* Family Recognition */}
                <div className="border rounded-lg p-3 bg-blue-50 animate-in slide-in-from-bottom duration-1200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900">Family Members Found</span>
                  </div>
                  <p className="text-xs text-blue-700 mb-3">
                    We found other family members in your household. Would you like to register them too?
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Michael Johnson</span>
                        <Badge variant="outline" className="text-xs">Spouse</Badge>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-2">
                        <input type="checkbox" className="rounded" />
                        <span className="text-sm">Emma Johnson</span>
                        <Badge variant="outline" className="text-xs">Child</Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Saved Indicator */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 animate-in slide-in-from-bottom duration-1500">
                  <div className="flex items-center gap-2 text-purple-700">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm font-medium">Time Saved: ~2 minutes</span>
                  </div>
                  <p className="text-xs text-purple-600 mt-1">
                    No need to re-enter information we already have on file!
                  </p>
                </div>
              </>
            )}

            {(demoStep === "start" || demoStep === "typing") && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input placeholder="First name" disabled />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input placeholder="Last name" disabled />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input placeholder="Phone number" disabled />
                </div>

                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input placeholder="Street address" disabled />
                </div>
              </>
            )}

            <Button 
              className="w-full" 
              disabled={demoStep !== "recognized"}
            >
              {demoStep === "recognized" ? "Register for Easter Service" : "Continue to Registration"}
            </Button>
          </div>
        </div>

        {/* Explanation */}
        <div className="space-y-3 text-sm">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-blue-600">1</span>
            </div>
            <div>
              <p className="font-medium">Smart Recognition</p>
              <p className="text-muted-foreground">
                When someone enters their email, we instantly check if they're already in your church database.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-green-600">2</span>
            </div>
            <div>
              <p className="font-medium">Auto-Fill Information</p>
              <p className="text-muted-foreground">
                We pre-populate their contact details, family members, and preferences from previous interactions.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-medium text-purple-600">3</span>
            </div>
            <div>
              <p className="font-medium">Seamless Experience</p>
              <p className="text-muted-foreground">
                Members spend less time filling forms and more time engaging with your church community.
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="text-sm">
              <p className="font-medium text-blue-900">Why This Matters for Churches</p>
              <p className="text-blue-700 mt-1">
                Progressive recognition eliminates frustration for returning members while still capturing new visitor information. 
                It makes your forms feel personal and welcoming, not bureaucratic.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}