"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Mail, 
  MessageSquare, 
  Users, 
  Clock, 
  Send, 
  Eye,
  DollarSign,
  AlertTriangle,
  Calendar
} from "lucide-react";
import { RecipientSelector } from "./recipient-selector";

interface MessageComposerProps {
  onSend?: (messageData: any) => void;
  onSave?: (messageData: any) => void;
  onCancel?: () => void;
}

export function MessageComposer({ onSend, onSave, onCancel }: MessageComposerProps) {
  const [messageType, setMessageType] = useState<"email" | "sms">("email");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [fromName, setFromName] = useState("Church Name");
  const [replyTo, setReplyTo] = useState("");
  const [recipientType, setRecipientType] = useState("all_members");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>([]);
  const [scheduledSend, setScheduledSend] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [scheduledTime, setScheduledTime] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(0);
  const [recipientCount, setRecipientCount] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  // Calculate SMS cost estimate
  useEffect(() => {
    if (messageType === "sms" && content && recipientCount > 0) {
      // Estimate SMS cost based on message length and recipient count
      const segments = Math.ceil(content.length / 160);
      const costPerSegment = 0.75; // 0.75 cents per segment
      setEstimatedCost(segments * recipientCount * costPerSegment);
    } else {
      setEstimatedCost(0);
    }
  }, [messageType, content, recipientCount]);

  const handleSend = () => {
    const messageData = {
      type: messageType,
      subject: messageType === "email" ? subject : undefined,
      content,
      fromName,
      replyTo: messageType === "email" ? replyTo : undefined,
      recipientType,
      recipientIds: recipientType === "custom_selection" ? selectedRecipients : undefined,
      scheduledFor: scheduledSend ? `${scheduledDate}T${scheduledTime}:00.000Z` : undefined,
    };

    onSend?.(messageData);
  };

  const handleSave = () => {
    const messageData = {
      type: messageType,
      subject: messageType === "email" ? subject : undefined,
      content,
      fromName,
      replyTo: messageType === "email" ? replyTo : undefined,
      recipientType,
      recipientIds: recipientType === "custom_selection" ? selectedRecipients : undefined,
      scheduledFor: scheduledSend ? `${scheduledDate}T${scheduledTime}:00.000Z` : undefined,
    };

    onSave?.(messageData);
  };

  const canSend = () => {
    if (!content.trim()) return false;
    if (messageType === "email" && !subject.trim()) return false;
    if (recipientType === "custom_selection" && selectedRecipients.length === 0) return false;
    if (scheduledSend && (!scheduledDate || !scheduledTime)) return false;
    return true;
  };

  return (
    <div className="space-y-6">
      {/* Header - Elder Friendly */}
      <div className="flex items-center justify-between bg-blue-50 p-6 rounded-xl mb-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-blue-900">Send Message to Church Members</h2>
          <p className="text-lg text-blue-700 mt-2">
            Reach out to your congregation with email or text messages
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" size="lg" onClick={onCancel} className="h-12 px-6 text-base">
            Cancel
          </Button>
          <Button variant="outline" size="lg" onClick={handleSave} className="h-12 px-6 text-base">
            Save for Later
          </Button>
          <Button 
            onClick={handleSend} 
            disabled={!canSend()}
            size="lg"
            className="min-w-[140px] h-12 text-base font-semibold"
          >
            {scheduledSend ? (
              <>
                <Clock className="h-5 w-5 mr-2" />
                Schedule Message
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-2" />
                Send Now
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Composer */}
        <div className="lg:col-span-2 space-y-4">
          {/* Message Type - Elder Friendly */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-xl">Choose How to Send Your Message</CardTitle>
              <CardDescription className="text-base">
                Select email for longer messages or text (SMS) for quick updates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <Tabs value={messageType} onValueChange={(value) => setMessageType(value as "email" | "sms")}>
                <TabsList className="grid w-full grid-cols-2 h-16">
                  <TabsTrigger value="email" className="flex items-center gap-3 text-lg p-4">
                    <Mail className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold">Email Message</div>
                      <div className="text-sm text-gray-600">Newsletters, announcements</div>
                    </div>
                  </TabsTrigger>
                  <TabsTrigger value="sms" className="flex items-center gap-3 text-lg p-4">
                    <MessageSquare className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-semibold">Text Message (SMS)</div>
                      <div className="text-sm text-gray-600">Quick reminders, alerts</div>
                    </div>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              
              {messageType === "email" && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-base text-blue-800">
                    📧 <strong>Email is perfect for:</strong> Weekly newsletters, event announcements, detailed information
                  </p>
                </div>
              )}
              
              {messageType === "sms" && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-base text-green-800">
                    📱 <strong>Text messages are great for:</strong> Service reminders, weather cancellations, urgent updates
                  </p>
                  <p className="text-sm text-green-700 mt-2">
                    Note: Text messages are charged based on length. Keep messages short and clear.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Content - Elder Friendly */}
          <Card className="border-2 border-gray-200">
            <CardHeader className="bg-gray-50">
              <CardTitle className="text-xl">Write Your Message</CardTitle>
              {messageType === "sms" && (
                <CardDescription className="text-base">
                  📱 Text messages cost money based on length. Current length: <strong>{content.length} characters</strong>
                  {content.length > 160 && <span className="text-orange-600"> (This will cost extra - consider shortening)</span>}
                </CardDescription>
              )}
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              {/* From Information */}
              <div className="grid gap-6 sm:grid-cols-2">
                <div className="space-y-3">
                  <Label htmlFor="fromName" className="text-lg font-medium">Sender Name (Who is this from?)</Label>
                  <Input
                    id="fromName"
                    value={fromName}
                    onChange={(e) => setFromName(e.target.value)}
                    placeholder="Pastor John Smith"
                    className="text-lg p-4 h-12"
                  />
                  <p className="text-sm text-gray-600">This name will appear as the sender</p>
                </div>
                {messageType === "email" && (
                  <div className="space-y-3">
                    <Label htmlFor="replyTo" className="text-lg font-medium">Reply Email Address</Label>
                    <Input
                      id="replyTo"
                      type="email"
                      value={replyTo}
                      onChange={(e) => setReplyTo(e.target.value)}
                      placeholder="pastor@yourchurch.org"
                      className="text-lg p-4 h-12"
                    />
                    <p className="text-sm text-gray-600">Where replies will be sent</p>
                  </div>
                )}
              </div>

              {/* Subject (Email only) */}
              {messageType === "email" && (
                <div className="space-y-3">
                  <Label htmlFor="subject" className="text-lg font-medium">Email Subject (What is this message about?)</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Sunday Service Update - Important Information"
                    className="text-lg p-4 h-12"
                  />
                  <p className="text-sm text-gray-600">This appears in the member's inbox</p>
                </div>
              )}

              {/* Message Content */}
              <div className="space-y-3">
                <Label htmlFor="content" className="text-lg font-medium">
                  {messageType === "email" ? "Your Email Message" : "Your Text Message"}
                </Label>
                <Textarea
                  id="content"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                    messageType === "email"
                      ? "Dear church family,\n\nWrite your message here. You can personalize it with member names using the buttons below.\n\nBlessings,\nPastor John"
                      : "Quick reminder: Sunday service at 10am. See you there! - Pastor John"
                  }
                  className={`text-lg p-4 ${messageType === "email" ? "min-h-[250px]" : "min-h-[120px]"}`}
                />
                {messageType === "sms" && (
                  <div className="flex justify-between text-base">
                    <span className={`font-medium ${content.length > 160 ? 'text-orange-600' : 'text-green-600'}`}>
                      Characters: {content.length} / 160
                    </span>
                    <span className={`font-medium ${Math.ceil(content.length / 160) > 1 ? 'text-orange-600' : 'text-green-600'}`}>
                      Message parts: {Math.ceil(content.length / 160) || 1}
                    </span>
                  </div>
                )}
              </div>

              {/* Merge Fields Helper - Elder Friendly */}
              <div className="bg-blue-50 border border-blue-200 p-6 rounded-lg">
                <p className="text-lg font-medium mb-3 text-blue-900">✨ Personalize Your Message</p>
                <p className="text-base text-blue-800 mb-4">Click these buttons to add member names to your message:</p>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { field: "{{firstName}}", label: "First Name", example: "John" },
                    { field: "{{lastName}}", label: "Last Name", example: "Smith" },
                    { field: "{{preferredName}}", label: "Preferred Name", example: "Johnny" },
                    { field: "{{fullName}}", label: "Full Name", example: "John Smith" }
                  ].map((item) => (
                    <Button
                      key={item.field}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-start text-left"
                      onClick={() => setContent(content + item.field)}
                    >
                      <span className="font-semibold text-base">{item.label}</span>
                      <span className="text-sm text-gray-600">Becomes: "{item.example}"</span>
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Scheduling */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Scheduling</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="scheduled-send"
                  checked={scheduledSend}
                  onCheckedChange={setScheduledSend}
                />
                <Label htmlFor="scheduled-send">Schedule for later</Label>
              </div>

              {scheduledSend && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="scheduledDate">Date</Label>
                    <Input
                      id="scheduledDate"
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="scheduledTime">Time</Label>
                    <Input
                      id="scheduledTime"
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Recipients */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="h-4 w-4" />
                Recipients
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecipientSelector
                value={recipientType}
                onChange={setRecipientType}
                selectedRecipients={selectedRecipients}
                onRecipientsChange={setSelectedRecipients}
                onCountChange={setRecipientCount}
              />
            </CardContent>
          </Card>

          {/* Cost Estimate (SMS only) */}
          {messageType === "sms" && estimatedCost > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Cost Estimate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${(estimatedCost / 100).toFixed(2)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {recipientCount} recipients × {Math.ceil(content.length / 160)} segments
                </p>
              </CardContent>
            </Card>
          )}

          {/* Delivery Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Delivery Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Recipients:</span>
                <span className="font-medium">{recipientCount}</span>
              </div>
              
              {messageType === "email" && (
                <>
                  <div className="flex justify-between">
                    <span className="text-sm">From:</span>
                    <span className="font-medium text-xs">
                      {fromName}@mail.yourchurch.org
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Reply-to:</span>
                    <span className="font-medium text-xs">
                      {replyTo || "pastor@yourchurch.org"}
                    </span>
                  </div>
                </>
              )}

              {messageType === "sms" && (
                <div className="flex justify-between">
                  <span className="text-sm">From:</span>
                  <span className="font-medium">+1 (555) CHURCH</span>
                </div>
              )}

              {scheduledSend && scheduledDate && scheduledTime && (
                <div className="pt-2 border-t">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Scheduled for {new Date(`${scheduledDate}T${scheduledTime}`).toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Button */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showPreview ? "Hide Preview" : "Show Preview"}
          </Button>
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Message Preview</CardTitle>
            <CardDescription>
              This is how your message will appear to recipients
            </CardDescription>
          </CardHeader>
          <CardContent>
            {messageType === "email" ? (
              <div className="space-y-4 p-4 border rounded-lg bg-white">
                <div className="border-b pb-4">
                  <div className="text-sm text-muted-foreground">
                    From: {fromName} &lt;{fromName.toLowerCase().replace(/\s+/g, '')}@mail.yourchurch.org&gt;
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Reply-To: {replyTo || "pastor@yourchurch.org"}
                  </div>
                  <div className="font-medium mt-2">Subject: {subject || "No subject"}</div>
                </div>
                <div className="whitespace-pre-wrap">
                  {content.replace(/{{firstName}}/g, "John")
                    .replace(/{{lastName}}/g, "Smith")
                    .replace(/{{preferredName}}/g, "John")
                    .replace(/{{fullName}}/g, "John Smith")}
                </div>
              </div>
            ) : (
              <div className="p-4 border rounded-lg bg-green-50 max-w-sm">
                <div className="text-sm text-muted-foreground mb-2">
                  From: +1 (555) CHURCH
                </div>
                <div className="whitespace-pre-wrap">
                  {content.replace(/{{firstName}}/g, "John")
                    .replace(/{{lastName}}/g, "Smith")
                    .replace(/{{preferredName}}/g, "John")
                    .replace(/{{fullName}}/g, "John Smith")}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}