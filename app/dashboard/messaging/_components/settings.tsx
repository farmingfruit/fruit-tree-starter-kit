"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { 
  Settings2, 
  Phone, 
  Mail, 
  Clock, 
  DollarSign,
  Shield,
  Bell,
  Users,
  MessageSquare,
  Save,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react";

export function MessagingSettings() {
  const [settings, setSettings] = useState({
    // SMS Settings
    smsEnabled: true,
    smsPhoneNumber: "+1 (555) 123-CHURCH",
    smsReplyToEmail: "pastor@yourchurch.org",
    autoReplyEnabled: true,
    autoReplyMessage: "Thank you for your message! We'll get back to you soon. For urgent matters, please call our church office.",
    
    // Email Settings
    emailEnabled: true,
    fromEmail: "church@yourchurch.org",
    fromName: "Your Church Name",
    replyToEmail: "pastor@yourchurch.org",
    emailSignature: "Blessings,\\nPastor John & The Church Leadership Team\\n\\nYour Church Name\\n123 Church Street\\nYour City, State 12345\\n(555) 123-CHURCH",
    
    // Notification Settings
    newMessageNotifications: true,
    unreadMessageAlerts: true,
    dailyDigestEnabled: true,
    digestTime: "18:00",
    
    // Security & Privacy
    requireApproval: false,
    archiveAfterDays: 90,
    backupEnabled: true,
    
    // Business Hours
    businessHoursEnabled: true,
    businessStart: "09:00",
    businessEnd: "17:00",
    businessDays: ["monday", "tuesday", "wednesday", "thursday", "friday"],
    afterHoursMessage: "Thank you for your message! Our office hours are Monday-Friday 9AM-5PM. We'll respond during our next business day."
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Messaging Settings</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Configure your church's messaging preferences and communication settings
          </p>
        </div>
        
        <div className="flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="h-12 px-6 text-base font-bold rounded-xl border-2"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Reset to Defaults
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="h-12 px-6 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Saving...
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 className="h-5 w-5 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {/* SMS Settings */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-green-600" />
            Text Message (SMS) Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-bold">Enable SMS Messaging</Label>
              <p className="text-sm text-muted-foreground mt-1">Allow sending and receiving text messages</p>
            </div>
            <Switch 
              checked={settings.smsEnabled}
              onCheckedChange={(checked) => updateSetting('smsEnabled', checked)}
              className="data-[state=checked]:bg-green-600"
            />
          </div>

          {settings.smsEnabled && (
            <>
              <div className="space-y-3">
                <Label className="text-base font-bold">Church Phone Number</Label>
                <Input
                  value={settings.smsPhoneNumber}
                  onChange={(e) => updateSetting('smsPhoneNumber', e.target.value)}
                  className="h-12 text-base border-2 rounded-xl"
                  placeholder="+1 (555) 123-CHURCH"
                />
                <p className="text-sm text-muted-foreground">
                  The phone number members will text to reach your church
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-bold">SMS Reply-To Email</Label>
                <Input
                  type="email"
                  value={settings.smsReplyToEmail}
                  onChange={(e) => updateSetting('smsReplyToEmail', e.target.value)}
                  className="h-12 text-base border-2 rounded-xl"
                  placeholder="pastor@yourchurch.org"
                />
                <p className="text-sm text-muted-foreground">
                  Email address that receives notifications of new text messages
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-base font-bold">Auto-Reply to New Messages</Label>
                  <p className="text-sm text-muted-foreground mt-1">Send automatic confirmation when someone texts your church</p>
                </div>
                <Switch 
                  checked={settings.autoReplyEnabled}
                  onCheckedChange={(checked) => updateSetting('autoReplyEnabled', checked)}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>

              {settings.autoReplyEnabled && (
                <div className="space-y-3">
                  <Label className="text-base font-bold">Auto-Reply Message</Label>
                  <Textarea
                    value={settings.autoReplyMessage}
                    onChange={(e) => updateSetting('autoReplyMessage', e.target.value)}
                    className="min-h-[100px] text-base border-2 rounded-xl"
                    maxLength={160}
                  />
                  <p className="text-sm text-muted-foreground">
                    {settings.autoReplyMessage.length}/160 characters (SMS limit)
                  </p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Email Settings */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <Mail className="h-6 w-6 text-blue-600" />
            Email Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-bold">Enable Email Messaging</Label>
              <p className="text-sm text-muted-foreground mt-1">Allow sending email messages to church members</p>
            </div>
            <Switch 
              checked={settings.emailEnabled}
              onCheckedChange={(checked) => updateSetting('emailEnabled', checked)}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {settings.emailEnabled && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-bold">From Email Address</Label>
                  <Input
                    type="email"
                    value={settings.fromEmail}
                    onChange={(e) => updateSetting('fromEmail', e.target.value)}
                    className="h-12 text-base border-2 rounded-xl"
                    placeholder="church@yourchurch.org"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-bold">From Name</Label>
                  <Input
                    value={settings.fromName}
                    onChange={(e) => updateSetting('fromName', e.target.value)}
                    className="h-12 text-base border-2 rounded-xl"
                    placeholder="Your Church Name"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-bold">Reply-To Email Address</Label>
                <Input
                  type="email"
                  value={settings.replyToEmail}
                  onChange={(e) => updateSetting('replyToEmail', e.target.value)}
                  className="h-12 text-base border-2 rounded-xl"
                  placeholder="pastor@yourchurch.org"
                />
                <p className="text-sm text-muted-foreground">
                  Where replies to your emails will be sent
                </p>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-bold">Email Signature</Label>
                <Textarea
                  value={settings.emailSignature}
                  onChange={(e) => updateSetting('emailSignature', e.target.value)}
                  className="min-h-[120px] text-base border-2 rounded-xl"
                  placeholder="Add your church signature here..."
                />
                <p className="text-sm text-muted-foreground">
                  This signature will be automatically added to all emails
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Settings */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <Bell className="h-6 w-6 text-orange-600" />
            Notification Preferences
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-bold">New Message Notifications</Label>
                <p className="text-sm text-muted-foreground mt-1">Get notified when new messages arrive</p>
              </div>
              <Switch 
                checked={settings.newMessageNotifications}
                onCheckedChange={(checked) => updateSetting('newMessageNotifications', checked)}
                className="data-[state=checked]:bg-orange-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-bold">Unread Message Alerts</Label>
                <p className="text-sm text-muted-foreground mt-1">Remind you about messages needing replies</p>
              </div>
              <Switch 
                checked={settings.unreadMessageAlerts}
                onCheckedChange={(checked) => updateSetting('unreadMessageAlerts', checked)}
                className="data-[state=checked]:bg-orange-600"
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label className="text-base font-bold">Daily Activity Digest</Label>
                <p className="text-sm text-muted-foreground mt-1">Receive a daily summary of messaging activity</p>
              </div>
              <Switch 
                checked={settings.dailyDigestEnabled}
                onCheckedChange={(checked) => updateSetting('dailyDigestEnabled', checked)}
                className="data-[state=checked]:bg-orange-600"
              />
            </div>

            {settings.dailyDigestEnabled && (
              <div className="space-y-3 ml-4">
                <Label className="text-base font-bold">Digest Time</Label>
                <Input
                  type="time"
                  value={settings.digestTime}
                  onChange={(e) => updateSetting('digestTime', e.target.value)}
                  className="h-12 text-base border-2 rounded-xl w-48"
                />
                <p className="text-sm text-muted-foreground">
                  What time should we send your daily digest?
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Business Hours */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <Clock className="h-6 w-6 text-purple-600" />
            Business Hours
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-bold">Enable Business Hours</Label>
              <p className="text-sm text-muted-foreground mt-1">Send automatic after-hours responses</p>
            </div>
            <Switch 
              checked={settings.businessHoursEnabled}
              onCheckedChange={(checked) => updateSetting('businessHoursEnabled', checked)}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>

          {settings.businessHoursEnabled && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label className="text-base font-bold">Office Opens</Label>
                  <Input
                    type="time"
                    value={settings.businessStart}
                    onChange={(e) => updateSetting('businessStart', e.target.value)}
                    className="h-12 text-base border-2 rounded-xl"
                  />
                </div>

                <div className="space-y-3">
                  <Label className="text-base font-bold">Office Closes</Label>
                  <Input
                    type="time"
                    value={settings.businessEnd}
                    onChange={(e) => updateSetting('businessEnd', e.target.value)}
                    className="h-12 text-base border-2 rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-base font-bold">After-Hours Message</Label>
                <Textarea
                  value={settings.afterHoursMessage}
                  onChange={(e) => updateSetting('afterHoursMessage', e.target.value)}
                  className="min-h-[100px] text-base border-2 rounded-xl"
                  maxLength={160}
                />
                <p className="text-sm text-muted-foreground">
                  Sent automatically when someone messages outside business hours
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Security & Privacy */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <Shield className="h-6 w-6 text-red-600" />
            Security & Privacy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-bold">Require Approval for New Contacts</Label>
              <p className="text-sm text-muted-foreground mt-1">Review messages from unknown numbers before responding</p>
            </div>
            <Switch 
              checked={settings.requireApproval}
              onCheckedChange={(checked) => updateSetting('requireApproval', checked)}
              className="data-[state=checked]:bg-red-600"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-base font-bold">Auto-Archive Messages After</Label>
            <div className="flex items-center gap-3">
              <Input
                type="number"
                value={settings.archiveAfterDays}
                onChange={(e) => updateSetting('archiveAfterDays', parseInt(e.target.value))}
                className="h-12 text-base border-2 rounded-xl w-32"
                min="1"
                max="365"
              />
              <span className="text-base text-muted-foreground">days</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Old messages will be automatically archived to keep your inbox organized
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-bold">Enable Data Backup</Label>
              <p className="text-sm text-muted-foreground mt-1">Automatically backup your messages and settings</p>
            </div>
            <Switch 
              checked={settings.backupEnabled}
              onCheckedChange={(checked) => updateSetting('backupEnabled', checked)}
              className="data-[state=checked]:bg-red-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Status */}
      <Card className="border-2 bg-green-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <Info className="h-6 w-6 text-green-600" />
            Current Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <Badge variant={settings.smsEnabled ? "default" : "secondary"} className="text-sm">
                {settings.smsEnabled ? "SMS Active" : "SMS Disabled"}
              </Badge>
              <MessageSquare className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={settings.emailEnabled ? "default" : "secondary"} className="text-sm">
                {settings.emailEnabled ? "Email Active" : "Email Disabled"}
              </Badge>
              <Mail className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={settings.newMessageNotifications ? "default" : "secondary"} className="text-sm">
                {settings.newMessageNotifications ? "Notifications On" : "Notifications Off"}
              </Badge>
              <Bell className="h-4 w-4 text-orange-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}