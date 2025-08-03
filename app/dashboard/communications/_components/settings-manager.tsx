"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { DNSSetupWizard } from "./dns-setup-wizard";
import { 
  Settings,
  Mail,
  MessageSquare,
  Globe,
  Phone,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  BarChart3,
  RefreshCw,
  ExternalLink,
  Wrench,
  Shield,
  Clock
} from "lucide-react";

interface CommunicationSettings {
  emailDomain: string;
  emailFromName: string;
  emailReplyTo: string;
  smsNumber: string;
  twoWaySmsEnabled: boolean;
  autoReplyEnabled: boolean;
  autoReplyMessage: string;
  unsubscribeHandling: boolean;
  bounceHandling: boolean;
  costAlerts: boolean;
  costLimit: number;
}

interface SystemStatus {
  emailDnsStatus: 'verified' | 'pending' | 'failed';
  emailServiceStatus: 'active' | 'inactive' | 'error';
  smsServiceStatus: 'active' | 'inactive' | 'error';
  deliveryRate: number;
  monthlyCosts: number;
  messagesSent: number;
  activeConversations: number;
}

export function SettingsManager() {
  const [settings, setSettings] = useState<CommunicationSettings>({
    emailDomain: "mail.yourchurch.org",
    emailFromName: "First Baptist Church",
    emailReplyTo: "pastor@yourchurch.org",
    smsNumber: "+1 (555) CHURCH",
    twoWaySmsEnabled: true,
    autoReplyEnabled: false,
    autoReplyMessage: "Thank you for your message. We'll get back to you soon!",
    unsubscribeHandling: true,
    bounceHandling: true,
    costAlerts: true,
    costLimit: 100
  });

  const [status, setStatus] = useState<SystemStatus>({
    emailDnsStatus: 'verified',
    emailServiceStatus: 'active',
    smsServiceStatus: 'active',
    deliveryRate: 98.5,
    monthlyCosts: 45.67,
    messagesSent: 1234,
    activeConversations: 12
  });

  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showDNSWizard, setShowDNSWizard] = useState(false);

  const saveSettings = async () => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving settings:", error);
    } finally {
      setLoading(false);
    }
  };

  const testConnections = async () => {
    setLoading(true);
    try {
      // Simulate testing connections
      await new Promise(resolve => setTimeout(resolve, 2000));
      // Update status with test results
    } catch (error) {
      console.error("Error testing connections:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
        return <CheckCircle className="h-6 w-6 text-green-500" />;
      case 'pending':
        return <Clock className="h-6 w-6 text-yellow-500" />;
      case 'failed':
      case 'inactive':
      case 'error':
        return <AlertTriangle className="h-6 w-6 text-red-500" />;
      default:
        return <AlertTriangle className="h-6 w-6 text-gray-400" />;
    }
  };

  const getStatusText = (type: string, status: string) => {
    if (type === 'dns') {
      switch (status) {
        case 'verified': return 'Working perfectly';
        case 'pending': return 'Checking setup...';
        case 'failed': return 'Needs attention';
        default: return 'Unknown';
      }
    }
    
    switch (status) {
      case 'active': return 'Working perfectly';
      case 'inactive': return 'Not set up';
      case 'error': return 'Needs attention';
      default: return 'Unknown';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'failed':
      case 'inactive':
      case 'error':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header - Elder Friendly */}
      <div className="bg-blue-50 p-6 rounded-xl">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-blue-900">Communication System Settings</h2>
            <p className="text-lg text-blue-700 mt-2">
              Check your email and text message setup - keep everything running smoothly
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="lg" onClick={testConnections} disabled={loading} className="h-12 px-6">
              <RefreshCw className={`h-5 w-5 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Test Everything
            </Button>
            <Button size="lg" onClick={saveSettings} disabled={loading} className="h-12 px-6">
              {loading ? (
                <div className="animate-spin w-5 h-5 border-2 border-white rounded-full border-t-transparent mr-2" />
              ) : null}
              {saved ? "✓ Saved!" : "Save All Changes"}
            </Button>
          </div>
        </div>
      </div>

      {/* System Status Overview - Visual Dashboard */}
      <Card className="border-2 border-gray-200">
        <CardHeader className="bg-gray-50">
          <CardTitle className="text-2xl flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            System Health Check
          </CardTitle>
          <CardDescription className="text-lg">
            Here's how your church communication system is performing right now
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          {/* Main Status Cards */}
          <div className="grid gap-6 md:grid-cols-3 mb-8">
            <div className={`p-6 rounded-xl border-2 ${getStatusColor(status.emailDnsStatus)}`}>
              <div className="flex items-center gap-4 mb-3">
                {getStatusIcon(status.emailDnsStatus)}
                <div>
                  <h3 className="text-lg font-bold">Email System</h3>
                  <p className="text-base">{getStatusText('dns', status.emailDnsStatus)}</p>
                </div>
              </div>
              {status.emailDnsStatus === 'failed' && (
                <Button 
                  size="sm" 
                  className="mt-3"
                  onClick={() => setShowDNSWizard(true)}
                >
                  <Wrench className="h-4 w-4 mr-2" />
                  Fix Email Setup
                </Button>
              )}
            </div>

            <div className={`p-6 rounded-xl border-2 ${getStatusColor(status.smsServiceStatus)}`}>
              <div className="flex items-center gap-4 mb-3">
                {getStatusIcon(status.smsServiceStatus)}
                <div>
                  <h3 className="text-lg font-bold">Text Messages (SMS)</h3>
                  <p className="text-base">{getStatusText('sms', status.smsServiceStatus)}</p>
                </div>
              </div>
              <div className="text-sm mt-2">
                <strong>Your Number:</strong> {settings.smsNumber}
              </div>
            </div>

            <div className="p-6 rounded-xl border-2 border-blue-200 bg-blue-50">
              <div className="flex items-center gap-4 mb-3">
                <DollarSign className="h-6 w-6 text-blue-600" />
                <div>
                  <h3 className="text-lg font-bold text-blue-900">This Month's Costs</h3>
                  <p className="text-2xl font-bold text-blue-600">${status.monthlyCosts.toFixed(2)}</p>
                </div>
              </div>
              <div className="text-sm text-blue-700">
                Limit: ${settings.costLimit} • {((status.monthlyCosts / settings.costLimit) * 100).toFixed(0)}% used
              </div>
            </div>
          </div>

          {/* Performance Stats */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="text-center p-6 bg-green-50 border border-green-200 rounded-xl">
              <div className="text-4xl font-bold text-green-600 mb-2">{status.deliveryRate}%</div>
              <div className="text-lg text-green-800">Messages Delivered Successfully</div>
              <div className="text-sm text-green-600 mt-1">Excellent delivery rate!</div>
            </div>
            <div className="text-center p-6 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="text-4xl font-bold text-blue-600 mb-2">{status.messagesSent.toLocaleString()}</div>
              <div className="text-lg text-blue-800">Total Messages Sent</div>
              <div className="text-sm text-blue-600 mt-1">This month</div>
            </div>
            <div className="text-center p-6 bg-purple-50 border border-purple-200 rounded-xl">
              <div className="text-4xl font-bold text-purple-600 mb-2">{status.activeConversations}</div>
              <div className="text-lg text-purple-800">Active Text Conversations</div>
              <div className="text-sm text-purple-600 mt-1">People you're chatting with</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings Tabs - Elder Friendly */}
      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 h-16">
          <TabsTrigger value="basic" className="flex flex-col gap-1 text-lg p-4">
            <Settings className="h-5 w-5" />
            Basic Settings
          </TabsTrigger>
          <TabsTrigger value="email" className="flex flex-col gap-1 text-lg p-4">
            <Mail className="h-5 w-5" />
            Email Setup
          </TabsTrigger>
          <TabsTrigger value="sms" className="flex flex-col gap-1 text-lg p-4">
            <MessageSquare className="h-5 w-5" />
            Text Messages
          </TabsTrigger>
          <TabsTrigger value="safety" className="flex flex-col gap-1 text-lg p-4">
            <Shield className="h-5 w-5" />
            Safety & Costs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-6">
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-xl">Church Information</CardTitle>
              <CardDescription className="text-base">
                This information appears when you send messages to church members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                <Label className="text-lg font-medium">Church Name (appears as sender)</Label>
                <Input
                  value={settings.emailFromName}
                  onChange={(e) => setSettings({...settings, emailFromName: e.target.value})}
                  placeholder="First Baptist Church"
                  className="text-lg p-4 h-12"
                />
                <p className="text-base text-gray-600">
                  📧 This is what members see as the sender name in their email and texts
                </p>
              </div>

              <div className="space-y-4">
                <Label className="text-lg font-medium">Pastor's Email (for replies)</Label>
                <Input
                  type="email"
                  value={settings.emailReplyTo}
                  onChange={(e) => setSettings({...settings, emailReplyTo: e.target.value})}
                  placeholder="pastor@yourchurch.org"
                  className="text-lg p-4 h-12"
                />
                <p className="text-base text-gray-600">
                  📬 When members reply to emails, they'll go to this address
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card className="border-2 border-blue-200">
            <CardHeader className="bg-blue-50">
              <CardTitle className="text-xl flex items-center gap-2">
                <Mail className="h-6 w-6 text-blue-600" />
                Email System Configuration
              </CardTitle>
              <CardDescription className="text-base">
                Set up professional email delivery for your church
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-lg font-medium">Professional Email Domain</Label>
                    <p className="text-base text-gray-600 mt-1">
                      Your church's professional email address: <strong>{settings.emailDomain}</strong>
                    </p>
                  </div>
                  <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => setShowDNSWizard(true)}
                    className="h-12 px-6"
                  >
                    <Globe className="h-5 w-5 mr-2" />
                    Set Up Email Domain
                  </Button>
                </div>
              </div>

              {status.emailDnsStatus === 'verified' ? (
                <Alert className="border-green-200 bg-green-50">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <AlertDescription className="text-base text-green-800">
                    ✅ Your email system is working perfectly! Members will receive emails from your church domain.
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  <AlertDescription className="text-base text-orange-800">
                    ⚠️ Your email domain needs to be set up. Click "Set Up Email Domain" above to get started.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms" className="space-y-6">
          <Card className="border-2 border-green-200">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-xl flex items-center gap-2">
                <MessageSquare className="h-6 w-6 text-green-600" />
                Text Message Settings
              </CardTitle>
              <CardDescription className="text-base">
                Configure how your church sends and receives text messages
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              <div className="space-y-6">
                <div className="flex items-center justify-between p-6 bg-gray-50 rounded-xl">
                  <div>
                    <Label className="text-lg font-medium">Church Text Number</Label>
                    <p className="text-base text-gray-600 mt-1">
                      📱 <strong>{settings.smsNumber}</strong> - This is your church's dedicated text number
                    </p>
                  </div>
                  <Button variant="outline" size="lg" className="h-12 px-6">
                    <Phone className="h-5 w-5 mr-2" />
                    Change Number
                  </Button>
                </div>

                <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                  <div>
                    <Label className="text-lg font-medium">Allow Members to Reply</Label>
                    <p className="text-base text-gray-600 mt-1">
                      💬 Let church members send text messages back to you
                    </p>
                  </div>
                  <Switch
                    checked={settings.twoWaySmsEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, twoWaySmsEnabled: checked})}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>

                <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                  <div>
                    <Label className="text-lg font-medium">Automatic Replies</Label>
                    <p className="text-base text-gray-600 mt-1">
                      🤖 Send automatic "thank you" messages when people text you
                    </p>
                  </div>
                  <Switch
                    checked={settings.autoReplyEnabled}
                    onCheckedChange={(checked) => setSettings({...settings, autoReplyEnabled: checked})}
                    className="data-[state=checked]:bg-green-500"
                  />
                </div>

                {settings.autoReplyEnabled && (
                  <div className="space-y-4 p-6 bg-blue-50 border border-blue-200 rounded-xl">
                    <Label className="text-lg font-medium">Automatic Reply Message</Label>
                    <Input
                      value={settings.autoReplyMessage}
                      onChange={(e) => setSettings({...settings, autoReplyMessage: e.target.value})}
                      placeholder="Thank you for your message. We'll get back to you soon!"
                      className="text-lg p-4 h-12"
                    />
                    <p className="text-base text-blue-700">
                      💡 This message is sent automatically when someone texts your church
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="safety" className="space-y-6">
          <Card className="border-2 border-purple-200">
            <CardHeader className="bg-purple-50">
              <CardTitle className="text-xl flex items-center gap-2">
                <Shield className="h-6 w-6 text-purple-600" />
                Safety & Cost Protection
              </CardTitle>
              <CardDescription className="text-base">
                Keep your church protected and control your messaging costs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 p-8">
              {/* Cost Controls */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-purple-900">💰 Cost Controls</h3>
                
                <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                  <div>
                    <Label className="text-lg font-medium">Monthly Spending Alerts</Label>
                    <p className="text-base text-gray-600 mt-1">
                      📧 Get notified when you're approaching your monthly limit
                    </p>
                  </div>
                  <Switch
                    checked={settings.costAlerts}
                    onCheckedChange={(checked) => setSettings({...settings, costAlerts: checked})}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>

                {settings.costAlerts && (
                  <div className="space-y-4 p-6 bg-orange-50 border border-orange-200 rounded-xl">
                    <Label className="text-lg font-medium">Monthly Spending Limit</Label>
                    <div className="flex items-center gap-4">
                      <span className="text-lg">$</span>
                      <Input
                        type="number"
                        value={settings.costLimit}
                        onChange={(e) => setSettings({...settings, costLimit: parseInt(e.target.value) || 0})}
                        className="text-lg p-4 h-12 w-32"
                      />
                      <span className="text-base text-gray-600">per month</span>
                    </div>
                    <p className="text-base text-orange-700">
                      ⚠️ You'll get email alerts when you reach 80% of this limit
                    </p>
                  </div>
                )}

                <Alert className="border-blue-200 bg-blue-50">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <AlertDescription className="text-base text-blue-800">
                    💡 <strong>Current month:</strong> ${status.monthlyCosts.toFixed(2)} spent
                    {settings.costAlerts && (
                      <span className="ml-2">
                        ({((status.monthlyCosts / settings.costLimit) * 100).toFixed(0)}% of your ${settings.costLimit} limit)
                      </span>
                    )}
                  </AlertDescription>
                </Alert>
              </div>

              {/* Privacy & Compliance */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-purple-900">🔒 Privacy & Legal Protection</h3>
                
                <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                  <div>
                    <Label className="text-lg font-medium">Automatic Unsubscribe Handling</Label>
                    <p className="text-base text-gray-600 mt-1">
                      ✋ Automatically remove people who ask to unsubscribe
                    </p>
                  </div>
                  <Switch
                    checked={settings.unsubscribeHandling}
                    onCheckedChange={(checked) => setSettings({...settings, unsubscribeHandling: checked})}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>

                <div className="flex items-center justify-between p-6 border border-gray-200 rounded-xl">
                  <div>
                    <Label className="text-lg font-medium">Automatic Bounce Handling</Label>
                    <p className="text-base text-gray-600 mt-1">
                      📧 Automatically handle emails that can't be delivered
                    </p>
                  </div>
                  <Switch
                    checked={settings.bounceHandling}
                    onCheckedChange={(checked) => setSettings({...settings, bounceHandling: checked})}
                    className="data-[state=checked]:bg-purple-500"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DNS Setup Wizard */}
      {showDNSWizard && (
        <DNSSetupWizard 
          onClose={() => setShowDNSWizard(false)}
          currentDomain={settings.emailDomain}
        />
      )}
    </div>
  );
}