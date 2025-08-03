"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Toggle } from "@/components/ui/toggle";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Mail, 
  Users, 
  Send, 
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Search,
  Plus,
  X
} from "lucide-react";
import { RecipientPicker } from "./recipient-picker";

interface Recipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: "individual" | "group";
}

export function Compose() {
  const [messageType, setMessageType] = useState<"email" | "sms">("email");
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);

  const characterLimit = messageType === "sms" ? 160 : 10000;
  const estimatedCost = messageType === "sms" ? recipients.length * 0.01 : 0;
  const recipientCount = recipients.reduce((acc, r) => {
    return acc + (r.type === "group" ? getGroupSize(r.id) : 1);
  }, 0);

  const handleSendMessage = async () => {
    if (!content.trim() || recipients.length === 0) return;
    if (messageType === "email" && !subject.trim()) return;
    
    setIsSending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setSubject("");
      setContent("");
      setRecipients([]);
      setIsScheduled(false);
      setScheduledDate("");
      
      // Show success message (you might want to add a toast notification here)
      alert("Message sent successfully!");
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const canSend = content.trim() && recipients.length > 0 && 
    (messageType === "sms" || subject.trim()) &&
    (!isScheduled || scheduledDate);

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl font-bold flex items-center gap-3">
            <div className="flex items-center gap-2">
              {messageType === "email" ? (
                <Mail className="h-7 w-7 text-blue-600" />
              ) : (
                <MessageSquare className="h-7 w-7 text-green-600" />
              )}
            </div>
            Send Message to Church Family
          </CardTitle>
          <p className="text-base text-muted-foreground leading-relaxed mt-2">
            Choose email or text message to communicate with your church members
          </p>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Compose Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Channel Selection */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl font-bold">Step 1: Choose How to Send</CardTitle>
              <p className="text-base text-muted-foreground mt-1">Pick email for longer messages or text for quick updates</p>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button
                  variant={messageType === "email" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setMessageType("email")}
                  className="flex-1 h-16 text-base font-bold border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <Mail className="h-6 w-6 mr-3" />
                  Email Message
                </Button>
                <Button
                  variant={messageType === "sms" ? "default" : "outline"}
                  size="lg"
                  onClick={() => setMessageType("sms")}
                  className="flex-1 h-16 text-base font-bold border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
                >
                  <MessageSquare className="h-6 w-6 mr-3" />
                  Text Message
                </Button>
              </div>
              
              {messageType === "sms" && (
                <div className="mt-6 p-6 bg-orange-50 border-2 border-orange-200 rounded-xl">
                  <div className="flex items-center gap-3 text-orange-700">
                    <DollarSign className="h-6 w-6" />
                    <span className="font-bold text-xl">Important: Text Message Costs</span>
                  </div>
                  <p className="text-orange-700 mt-3 text-lg leading-relaxed">
                    Each text message costs 1 cent per person. Long messages automatically split into multiple texts and cost more.
                  </p>
                  <p className="text-orange-600 mt-2 text-base font-medium">
                    We'll show you the exact cost before sending.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recipients */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <Users className="h-8 w-8" />
                Step 2: Choose Who Gets the Message
              </CardTitle>
              <p className="text-lg text-muted-foreground mt-2">Select church members or groups to receive your message</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setShowRecipientPicker(true)}
                  className="w-full h-20 text-xl font-bold border-2 border-dashed rounded-xl shadow-sm hover:shadow-md hover:bg-blue-50 hover:border-blue-300 transition-all"
                >
                  <Plus className="h-8 w-8 mr-4" />
                  Choose People to Send To
                </Button>
              </div>

              {recipients.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-xl font-bold">
                    <Badge variant="default" className="text-lg px-4 py-2">
                      {recipientCount} Church Members Selected
                    </Badge>
                    {messageType === "sms" && (
                      <Badge variant="destructive" className="text-lg px-4 py-2 animate-pulse">
                        Will Cost: ${estimatedCost.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {recipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded-lg border border-blue-200"
                      >
                        <span className="font-medium">{recipient.name}</span>
                        {recipient.type === "group" && (
                          <Badge variant="outline" className="text-xs">
                            {getGroupSize(recipient.id)} members
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setRecipients(recipients.filter(r => r.id !== recipient.id))}
                          className="h-6 w-6 p-0 hover:bg-blue-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">Step 3: Write Your Message</CardTitle>
              <p className="text-lg text-muted-foreground mt-2">Compose the message you want to send to your church family</p>
            </CardHeader>
            <CardContent className="space-y-6">
              {messageType === "email" && (
                <div>
                  <Label htmlFor="subject" className="text-xl font-bold block mb-3">
                    Email Subject (What's this about?)
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Example: Sunday Service Update, Prayer Request, etc."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-16 text-xl border-2 rounded-xl shadow-sm focus:shadow-md transition-shadow"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="content" className="text-xl font-bold block mb-3">
                  {messageType === "email" ? "Your Email Message" : "Your Text Message"}
                </Label>
                <Textarea
                  id="content"
                  placeholder={
                    messageType === "email" 
                      ? "Write your message here. Keep it clear and friendly. You can use {{firstName}} to personalize with member names."
                      : "Write a short, clear message. Remember: longer messages cost more to send."
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[240px] text-xl border-2 resize-none rounded-xl shadow-sm focus:shadow-md transition-shadow leading-relaxed"
                  maxLength={characterLimit}
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="text-lg text-muted-foreground font-medium">
                    {content.length} of {characterLimit} characters used
                    {messageType === "sms" && content.length > 160 && (
                      <div className="text-orange-600 font-bold mt-1 text-xl">
                        WARNING: This will send {Math.ceil(content.length / 160)} separate text messages
                      </div>
                    )}
                  </div>
                  
                  {messageType === "email" && (
                    <div className="text-lg text-muted-foreground">
                      <div className="font-medium">Personal touches available:</div>
                      <div className="text-base">{{firstName}}, {{lastName}}, {{preferredName}}</div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Send Options */}
        <div className="space-y-6">
          {/* Send Options */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">When to Send</CardTitle>
              <p className="text-lg text-muted-foreground mt-2">Send now or schedule for later</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <input
                    type="checkbox"
                    id="schedule"
                    checked={isScheduled}
                    onChange={(e) => setIsScheduled(e.target.checked)}
                    className="h-6 w-6"
                  />
                  <Label htmlFor="schedule" className="text-xl font-bold cursor-pointer">
                    Schedule for specific time
                  </Label>
                </div>

                {isScheduled && (
                  <div>
                    <Label htmlFor="scheduledDate" className="text-xl font-bold block mb-3">
                      When should this be sent?
                    </Label>
                    <Input
                      id="scheduledDate"
                      type="datetime-local"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className="h-16 text-xl border-2 rounded-xl shadow-sm focus:shadow-md transition-shadow"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                  </div>
                )}
              </div>

              <div className="pt-6 border-t-2">
                <Button
                  onClick={handleSendMessage}
                  disabled={!canSend || isSending}
                  size="lg"
                  className="w-full h-20 text-2xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white mr-4" />
                      {isScheduled ? "Scheduling Your Message..." : "Sending Your Message..."}
                    </>
                  ) : (
                    <>
                      {isScheduled ? (
                        <>
                          <Calendar className="h-8 w-8 mr-4" />
                          Schedule Message
                        </>
                      ) : (
                        <>
                          <Send className="h-8 w-8 mr-4" />
                          Send Now
                        </>
                      )}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card className="border-2 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-2xl font-bold">Message Review</CardTitle>
              <p className="text-lg text-muted-foreground mt-2">Double-check before sending</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Sending via:</span>
                  <Badge variant={messageType === "email" ? "default" : "secondary"} className="text-lg px-4 py-2">
                    {messageType === "email" ? "Email" : "Text Message"}
                  </Badge>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Going to:</span>
                  <span className="font-bold text-xl text-blue-600">{recipientCount} people</span>
                </div>
                
                {messageType === "sms" && (
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold">Total cost:</span>
                    <span className="font-bold text-xl text-red-600">${estimatedCost.toFixed(2)}</span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">Will send:</span>
                  <span className="font-bold text-lg">
                    {isScheduled ? "At scheduled time" : "Right away"}
                  </span>
                </div>
              </div>

              {!canSend && (
                <div className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl">
                  <div className="flex items-center gap-3 text-orange-700">
                    <AlertTriangle className="h-6 w-6" />
                    <span className="font-bold text-xl">Still Need To:</span>
                  </div>
                  <ul className="text-orange-700 mt-3 text-lg space-y-2">
                    {!content.trim() && <li>• Write your message</li>}
                    {recipients.length === 0 && <li>• Choose who to send to</li>}
                    {messageType === "email" && !subject.trim() && <li>• Add email subject</li>}
                    {isScheduled && !scheduledDate && <li>• Pick when to send</li>}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recipient Picker Modal */}
      {showRecipientPicker && (
        <RecipientPicker
          onClose={() => setShowRecipientPicker(false)}
          onSelect={(newRecipients) => {
            setRecipients([...recipients, ...newRecipients]);
            setShowRecipientPicker(false);
          }}
          messageType={messageType}
        />
      )}
    </div>
  );
}

// Helper function to get group size
function getGroupSize(groupId: string): number {
  const groupSizes = {
    "all_members": 247,  // Entire Church Family
    "active_members": 198,  // Active Church Members
    "visitors": 23,  // Visitors & Newcomers
    "youth_group": 45,  // Youth Ministry
    "senior_adults": 67  // Senior Saints
  };
  return groupSizes[groupId as keyof typeof groupSizes] || 1;
}