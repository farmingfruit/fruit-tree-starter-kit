"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Globe, 
  Copy, 
  CheckCircle, 
  ExternalLink, 
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  ArrowLeft,
  Clock
} from "lucide-react";

interface DNSSetupWizardProps {
  onClose: () => void;
  currentDomain?: string;
}

interface DNSRecord {
  type: string;
  name: string;
  value: string;
  description: string;
}

export function DNSSetupWizard({ onClose, currentDomain }: DNSSetupWizardProps) {
  const [step, setStep] = useState(1);
  const [churchDomain, setChurchDomain] = useState(currentDomain || "");
  const [subdomain, setSubdomain] = useState("mail");
  const [provider, setProvider] = useState("general");
  const [dnsRecords, setDnsRecords] = useState<DNSRecord[]>([]);
  const [verificationStatus, setVerificationStatus] = useState<string>("pending");
  const [loading, setLoading] = useState(false);
  const [copiedRecord, setCopiedRecord] = useState<string | null>(null);

  useEffect(() => {
    if (step === 2 && churchDomain) {
      generateDNSRecords();
    }
  }, [step, churchDomain, subdomain]);

  const generateDNSRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/communications/dns-setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          churchDomain,
          subdomain,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setDnsRecords(data.records);
      }
    } catch (error) {
      console.error('Error generating DNS records:', error);
    } finally {
      setLoading(false);
    }
  };

  const verifyDNSRecords = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/communications/dns-setup?domain=${subdomain}.${churchDomain}`);
      
      if (response.ok) {
        const data = await response.json();
        setVerificationStatus(data.verified ? 'verified' : 'failed');
      }
    } catch (error) {
      console.error('Error verifying DNS records:', error);
      setVerificationStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string, recordType: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedRecord(recordType);
      setTimeout(() => setCopiedRecord(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const getProviderInstructions = () => {
    const instructions = {
      godaddy: [
        "Log in to your GoDaddy account",
        "Go to your domain management dashboard",
        "Click on your domain name",
        "Click on the 'DNS' tab or 'Manage DNS'",
        "Add each record using the 'Add' button",
        "Select the record type and enter the Name and Value",
        "Save your changes"
      ],
      namecheap: [
        "Log in to your Namecheap account",
        "Go to Domain List and click 'Manage' next to your domain",
        "Click on the 'Advanced DNS' tab",
        "Use 'Add New Record' button for each record",
        "Select the record type and fill in the details",
        "Save changes"
      ],
      cloudflare: [
        "Log in to your Cloudflare account",
        "Select your domain",
        "Go to the 'DNS' tab",
        "Click 'Add record' for each DNS record",
        "Enter the record details and save",
        "Make sure proxy status is set to 'DNS only' (gray cloud)"
      ],
      general: [
        "Access your domain registrar's DNS management panel",
        "Look for 'DNS Settings', 'DNS Records', or 'Zone File'",
        "Add each record using the provided Type, Name, and Value",
        "Save your changes",
        "DNS changes may take up to 24 hours to take effect"
      ]
    };

    return instructions[provider as keyof typeof instructions] || instructions.general;
  };

  const nextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const canProceed = () => {
    switch (step) {
      case 1:
        return churchDomain.length > 0 && subdomain.length > 0;
      case 2:
        return dnsRecords.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[95vh] overflow-y-auto">
        <DialogHeader className="text-center">
          <DialogTitle className="flex items-center justify-center gap-3 text-2xl">
            <Globe className="h-8 w-8 text-blue-600" />
            Email Setup Wizard
          </DialogTitle>
          <DialogDescription className="text-lg mt-2">
            We'll help you set up professional email for your church - no technical knowledge required!
          </DialogDescription>
        </DialogHeader>

        {/* Step Progress - Elder Friendly */}
        <div className="flex items-center justify-between mb-8 bg-blue-50 p-6 rounded-xl">
          {[
            { num: 1, title: "Church Info" },
            { num: 2, title: "Copy Records" },
            { num: 3, title: "Add to Website" },
            { num: 4, title: "Test & Done" }
          ].map((stepInfo, index) => (
            <div key={stepInfo.num} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-4 ${
                  step >= stepInfo.num 
                    ? 'bg-green-500 text-white border-green-500' 
                    : step === stepInfo.num
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-gray-200 text-gray-500 border-gray-300'
                }`}>
                  {step > stepInfo.num ? '✓' : stepInfo.num}
                </div>
                <span className={`mt-2 text-sm font-medium text-center ${
                  step >= stepInfo.num ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {stepInfo.title}
                </span>
              </div>
              {index < 3 && (
                <div className={`flex-1 h-1 mx-4 rounded ${
                  step > stepInfo.num ? 'bg-green-400' : 'bg-gray-300'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="space-y-4">
          {/* Step 1: Domain Configuration */}
          {step === 1 && (
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">1</span>
                  Tell Us About Your Church Website
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Just enter your church's website address - we'll handle the technical details
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                <div className="space-y-3">
                  <Label htmlFor="churchDomain" className="text-lg font-medium">Your Church Website Address</Label>
                  <Input
                    id="churchDomain"
                    value={churchDomain}
                    onChange={(e) => setChurchDomain(e.target.value)}
                    placeholder="Example: firstbaptist.org"
                    className="text-lg p-4 h-14"
                  />
                  <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                    <p className="text-base text-yellow-800">
                      💡 <strong>Tip:</strong> Enter your website address without "www" or "https://"
                      <br />Examples: firstbaptist.org, mychurch.com, stpauls.net
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <Label htmlFor="subdomain" className="text-lg font-medium">Email Setup Name (We recommend "mail")</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      id="subdomain"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      placeholder="mail"
                      className="flex-1 text-lg p-4 h-14"
                    />
                    <span className="text-lg font-medium text-gray-600">
                      .{churchDomain || "yourchurch.org"}
                    </span>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-base text-blue-800">
                      📧 This creates your professional email address: pastor@mail.{churchDomain || "yourchurch.org"}
                      <br />Church members will see emails from this address
                    </p>
                  </div>
                </div>

                {churchDomain && subdomain && (
                  <Alert className="border-green-200 bg-green-50">
                    <CheckCircle className="h-6 w-6 text-green-600" />
                    <AlertDescription className="text-lg text-green-800">
                      Perfect! Your church email will be: <strong className="text-xl">{subdomain}.{churchDomain}</strong>
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 2: DNS Records */}
          {step === 2 && (
            <Card className="border-2 border-blue-200">
              <CardHeader className="bg-blue-50 rounded-t-lg">
                <CardTitle className="text-xl flex items-center gap-2">
                  <span className="bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-lg font-bold">2</span>
                  Copy These Settings
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  These are the special codes you'll add to your website settings (don't worry, we'll show you exactly where)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-8">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin w-12 h-12 border-4 border-blue-500 rounded-full border-t-transparent mx-auto mb-4" />
                    <p className="text-lg text-gray-600">Creating your email settings...</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="bg-yellow-50 border border-yellow-200 p-6 rounded-lg">
                      <h3 className="text-lg font-bold text-yellow-800 mb-2">📋 What You Need to Do</h3>
                      <p className="text-base text-yellow-800">
                        Copy each setting below by clicking the "Copy" button, then paste it into your website's DNS settings.
                        <strong> Don't worry about what these mean - just copy and paste exactly as shown!</strong>
                      </p>
                    </div>
                    
                    {dnsRecords.map((record, index) => (
                      <div key={index} className="bg-white border-2 border-gray-200 rounded-xl p-6 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                              Setting #{index + 1}
                            </span>
                            <Badge variant="outline" className="text-base px-3 py-1">{record.type} Record</Badge>
                          </div>
                          <Button
                            size="lg"
                            onClick={() => copyToClipboard(record.value, record.type)}
                            className={`gap-2 min-w-[120px] h-12 text-base ${
                              copiedRecord === record.type 
                                ? 'bg-green-500 hover:bg-green-600' 
                                : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                          >
                            {copiedRecord === record.type ? (
                              <>
                                <CheckCircle className="h-5 w-5" />
                                Copied!
                              </>
                            ) : (
                              <>
                                <Copy className="h-5 w-5" />
                                Copy This
                              </>
                            )}
                          </Button>
                        </div>
                        
                        <div className="grid gap-4 lg:grid-cols-2">
                          <div className="space-y-2">
                            <p className="text-base font-bold text-gray-700">Name/Host:</p>
                            <div className="bg-gray-50 border border-gray-300 p-3 rounded-lg">
                              <code className="text-base font-mono break-all">
                                {record.name}
                              </code>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <p className="text-base font-bold text-gray-700">Value/Points To:</p>
                            <div className="bg-gray-50 border border-gray-300 p-3 rounded-lg">
                              <code className="text-base font-mono break-all">
                                {record.value}
                              </code>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                          <p className="text-base text-blue-800">
                            💡 <strong>What this does:</strong> {record.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <Alert className="border-orange-200 bg-orange-50">
                  <Clock className="h-6 w-6 text-orange-600" />
                  <AlertDescription className="text-base text-orange-800">
                    <strong>⏰ Don't Worry About Timing:</strong> These changes can take up to 24 hours to work completely. 
                    You can continue to the next step and come back to test later.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Provider Instructions */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Provider-Specific Instructions</CardTitle>
                <CardDescription>
                  Follow these steps for your DNS provider
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="provider">Your DNS Provider</Label>
                  <Select value={provider} onValueChange={setProvider}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="godaddy">GoDaddy</SelectItem>
                      <SelectItem value="namecheap">Namecheap</SelectItem>
                      <SelectItem value="cloudflare">Cloudflare</SelectItem>
                      <SelectItem value="general">Other Provider</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Step-by-step instructions:</h4>
                  <ol className="space-y-2">
                    {getProviderInstructions().map((instruction, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-medium">
                          {index + 1}
                        </span>
                        <span className="text-sm">{instruction}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                {provider !== "general" && (
                  <Button
                    variant="outline"
                    className="gap-2"
                    onClick={() => {
                      const urls = {
                        godaddy: "https://dcc.godaddy.com/",
                        namecheap: "https://ap.www.namecheap.com/",
                        cloudflare: "https://dash.cloudflare.com/"
                      };
                      window.open(urls[provider as keyof typeof urls], '_blank');
                    }}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open {provider.charAt(0).toUpperCase() + provider.slice(1)} Dashboard
                  </Button>
                )}
              </CardContent>
            </Card>
          )}

          {/* Step 4: Verification */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle>Step 4: Verify DNS Records</CardTitle>
                <CardDescription>
                  Check if your DNS records have been properly configured
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-4">
                  <div className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center ${
                    verificationStatus === 'verified' 
                      ? 'bg-green-100 text-green-600' 
                      : verificationStatus === 'failed'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-yellow-100 text-yellow-600'
                  }`}>
                    {verificationStatus === 'verified' ? (
                      <CheckCircle className="h-8 w-8" />
                    ) : verificationStatus === 'failed' ? (
                      <AlertTriangle className="h-8 w-8" />
                    ) : (
                      <RefreshCw className="h-8 w-8" />
                    )}
                  </div>

                  <div>
                    <h3 className="font-medium">
                      {verificationStatus === 'verified' 
                        ? 'DNS Records Verified!' 
                        : verificationStatus === 'failed'
                        ? 'DNS Records Not Found'
                        : 'Checking DNS Records...'}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {verificationStatus === 'verified' 
                        ? 'Your email domain is properly configured and ready to use.'
                        : verificationStatus === 'failed'
                        ? 'DNS records are not yet propagated. This can take up to 24 hours.'
                        : 'We\'ll check if your DNS records have been added correctly.'}
                    </p>
                  </div>

                  <Button
                    onClick={verifyDNSRecords}
                    disabled={loading}
                    className="gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin w-4 h-4 border-2 border-white rounded-full border-t-transparent" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Check DNS Records
                      </>
                    )}
                  </Button>
                </div>

                {verificationStatus === 'failed' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      Don't worry if verification fails initially. DNS changes can take up to 24 hours 
                      to propagate worldwide. You can come back and verify later, or your email system 
                      will automatically verify once the records are active.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 1}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <span className="text-sm text-muted-foreground">
            Step {step} of 4
          </span>

          {step < 4 ? (
            <Button
              onClick={nextStep}
              disabled={!canProceed()}
              className="gap-2"
            >
              Next
              <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={onClose}>
              Complete Setup
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}