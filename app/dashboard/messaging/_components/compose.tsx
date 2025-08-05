"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
  X,
  Bold,
  Italic,
  Link as LinkIcon,
  Save,
  ArrowLeft,
  Home
} from "lucide-react";
import { RecipientPicker } from "./recipient-picker";
import Link from "next/link";

interface Recipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: "individual" | "group";
}

export function Compose() {
  const [channels, setChannels] = useState<{email: boolean, sms: boolean}>({email: true, sms: false});
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduledDate, setScheduledDate] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [showRecipientPicker, setShowRecipientPicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const characterLimit = 160; // SMS limit
  const smsMessages = Math.ceil(content.length / 160);
  const recipientCount = recipients.reduce((acc, r) => {
    return acc + (r.type === "group" ? getGroupSize(r.id) : 1);
  }, 0);
  const estimatedCost = channels.sms ? (recipientCount * smsMessages * 0.01) : 0;

  const handleSendMessage = async () => {
    if (!content.trim() || recipients.length === 0) return;
    if (channels.email && !subject.trim()) return;
    if (!channels.email && !channels.sms) return;
    
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
      const channelText = channels.email && channels.sms ? "email and text messages" : 
                          channels.email ? "email" : "text messages";
      alert(`${channelText.charAt(0).toUpperCase() + channelText.slice(1)} sent successfully to ${recipientCount} church members!`);
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!content.trim()) return;
    
    setIsSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Message template saved successfully!");
    } catch (error) {
      alert("Failed to save template. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    if (content.trim() || subject.trim() || recipients.length > 0) {
      if (confirm("Are you sure you want to cancel? Your message will be lost.")) {
        // Reset form
        setSubject("");
        setContent("");
        setRecipients([]);
        setChannels({email: true, sms: false});
        setIsScheduled(false);
        setScheduledDate("");
      }
    }
  };

  const canSend = content.trim() && recipients.length > 0 && 
    (channels.email || channels.sms) &&
    (!channels.email || subject.trim()) &&
    (!isScheduled || scheduledDate);

  const hasAnyChannel = channels.email || channels.sms;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header with Navigation */}
      <div className="space-y-4">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Link href="/dashboard/messaging" className="hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
          </Link>
          <span>/</span>
          <Link href="/dashboard/messaging" className="hover:text-primary transition-colors">
            Messages
          </Link>
          <span>/</span>
          <span className="text-foreground font-medium">Compose</span>
        </div>
        
        {/* Back Button */}
        <div className="flex items-center gap-4">
          <Link href="/dashboard/messaging">
            <Button
              variant="outline"
              className="h-11 px-4 text-sm font-medium border-2 hover:bg-gray-50"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Messages
            </Button>
          </Link>
        </div>
        
        {/* Page Header */}
        <div className="border-b border-gray-200 pb-4">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Mail className="h-6 w-6 text-blue-600" />
              <MessageSquare className="h-6 w-6 text-green-600" />
            </div>
            Send Message to Church Members
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Reach your church family via email, text message, or both channels
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Main Compose Area */}
        <div className="xl:col-span-3 space-y-6">
          {/* Channel Selection */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">1. Choose How to Send</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Select email, text message, or both channels</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button
                    variant={channels.email ? "default" : "outline"}
                    onClick={() => setChannels(prev => ({...prev, email: !prev.email}))}
                    className="h-16 text-sm font-medium border hover:shadow-sm transition-all flex flex-col gap-2 min-h-[44px]"
                  >
                    <Mail className="h-5 w-5" />
                    <span>Email Message</span>
                    {channels.email && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </Button>
                  <Button
                    variant={channels.sms ? "default" : "outline"}
                    onClick={() => setChannels(prev => ({...prev, sms: !prev.sms}))}
                    className="h-16 text-sm font-medium border hover:shadow-sm transition-all flex flex-col gap-2 min-h-[44px]"
                  >
                    <MessageSquare className="h-5 w-5" />
                    <span>Text Message</span>
                    {channels.sms && <CheckCircle2 className="h-4 w-4 text-green-600" />}
                  </Button>
                </div>
                
                {!hasAnyChannel && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <div className="flex items-center gap-2 text-red-700">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="font-medium text-sm">Please select at least one way to send your message</span>
                    </div>
                  </div>
                )}
                
                {channels.sms && (
                  <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
                    <div className="flex items-center gap-2 text-orange-700">
                      <DollarSign className="h-4 w-4" />
                      <span className="font-semibold text-sm">Text Message Costs</span>
                    </div>
                    <p className="text-orange-700 mt-2 text-sm">
                      Each text message costs 1 cent per member. Long messages split into multiple texts.
                    </p>
                    {recipientCount > 0 && (
                      <div className="mt-3 p-3 bg-white rounded border border-orange-300">
                        <p className="text-orange-800 font-semibold text-sm">
                          Estimated cost: ${estimatedCost.toFixed(2)} for {recipientCount} members
                        </p>
                        {smsMessages > 1 && (
                          <p className="text-orange-700 text-xs mt-1">
                            ({smsMessages} messages per member = ${(smsMessages * 0.01).toFixed(2)} each)
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recipients */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-5 w-5" />
                2. Choose Who Gets the Message
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Select church members or groups to receive your message</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Group Buttons */}
              <div className="space-y-3">
                <p className="text-sm font-semibold">Send to Groups:</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const allMembers = {id: "all_members", name: "All Members", type: "group" as const};
                      if (!recipients.find(r => r.id === allMembers.id)) {
                        setRecipients([allMembers]);
                      }
                    }}
                    className="h-12 text-sm font-medium border hover:bg-blue-50 hover:border-blue-300 transition-all min-h-[44px]"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    All Members (247)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const activeMembers = {id: "active_members", name: "Active Members", type: "group" as const};
                      if (!recipients.find(r => r.id === activeMembers.id)) {
                        setRecipients([activeMembers]);
                      }
                    }}
                    className="h-12 text-sm font-medium border hover:bg-green-50 hover:border-green-300 transition-all min-h-[44px]"
                  >
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Active Members (241)
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      const visitors = {id: "first_time_guests", name: "First Time Guests", type: "group" as const};
                      if (!recipients.find(r => r.id === visitors.id)) {
                        setRecipients([visitors]);
                      }
                    }}
                    className="h-12 text-sm font-medium border hover:bg-purple-50 hover:border-purple-300 transition-all min-h-[44px]"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    First Time Guests (6)
                  </Button>
                </div>
              </div>

              {/* Individual Selection */}
              <div>
                <Button
                  variant="outline"
                  onClick={() => setShowRecipientPicker(true)}
                  className="w-full h-12 text-sm font-medium border border-dashed hover:bg-blue-50 hover:border-blue-300 transition-all min-h-[44px]"
                >
                  <Search className="h-4 w-4 mr-2" />
                  Choose Specific Members
                </Button>
              </div>

              {recipients.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Badge variant="default" className="text-sm px-3 py-1">
                      {recipientCount} Church Members Selected
                    </Badge>
                    {channels.sms && estimatedCost > 0 && (
                      <Badge variant="destructive" className="text-sm px-3 py-1">
                        Will Cost: ${estimatedCost.toFixed(2)}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    {recipients.map((recipient) => (
                      <div
                        key={recipient.id}
                        className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-2 rounded border border-blue-200 text-sm"
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
                          className="h-6 w-6 p-0 hover:bg-blue-200 rounded"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Message Content */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">3. Write Your Message</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Compose the message you want to send to your church family</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {channels.email && (
                <div>
                  <Label htmlFor="subject" className="text-sm font-semibold block mb-2">
                    Email Subject (What's this about?)
                  </Label>
                  <Input
                    id="subject"
                    placeholder="Example: Sunday Service Update, Prayer Request, Church Event, etc."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="h-11 text-sm border focus:border-primary transition-colors"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="content" className="text-sm font-semibold">
                    Your Message
                  </Label>
                  {channels.email && (
                    <div className="flex gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          const textarea = document.getElementById('content') as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = content.substring(start, end);
                          const newContent = content.substring(0, start) + '**' + selectedText + '**' + content.substring(end);
                          setContent(newContent);
                        }}
                      >
                        <Bold className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          const textarea = document.getElementById('content') as HTMLTextAreaElement;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const selectedText = content.substring(start, end);
                          const newContent = content.substring(0, start) + '*' + selectedText + '*' + content.substring(end);
                          setContent(newContent);
                        }}
                      >
                        <Italic className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 px-2"
                        onClick={() => {
                          const url = prompt('Enter website link:');
                          if (url) {
                            const linkText = prompt('Enter link text (leave empty to use URL):') || url;
                            setContent(prev => prev + ` [${linkText}](${url})`);
                          }
                        }}
                      >
                        <LinkIcon className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
                <Textarea
                  id="content"
                  placeholder={
                    channels.email && channels.sms 
                      ? "Write your message here. Keep it clear and loving. This will be sent via both email and text message."
                      : channels.email 
                      ? "Write your message here. Keep it clear and friendly. You can use formatting and personalize with {{firstName}} for member names."
                      : "Write a short, clear message. Remember: longer messages cost more to send and may be split into multiple texts."
                  }
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="min-h-[200px] text-sm border resize-none focus:border-primary transition-colors leading-relaxed"
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                  <div className="space-y-1">
                    {channels.sms && (
                      <div className="text-sm">
                        <span className={content.length > 160 ? "text-orange-600 font-medium" : "text-muted-foreground"}>
                          {content.length}/160 characters
                        </span>
                        {content.length > 160 && (
                          <div className="text-orange-600 font-medium text-sm mt-1">
                            Will send {smsMessages} text messages per member
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {channels.email && (
                    <div className="text-right">
                      <div className="text-sm text-muted-foreground">
                        <div className="font-medium">Personal touches available:</div>
                        <div className="text-xs">{{firstName}}, {{lastName}}, {{preferredName}}</div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Bottom Action Buttons */}
              <div className="pt-4 border-t">
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={handleSendMessage}
                    disabled={!canSend || isSending}
                    className="flex-1 h-11 text-sm font-semibold shadow-sm hover:shadow transition-all min-h-[44px]"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Now
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleSaveTemplate}
                    disabled={!content.trim() || isSaving}
                    variant="outline"
                    className="flex-1 h-11 text-sm font-semibold border shadow-sm hover:shadow transition-all min-h-[44px]"
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save as Template
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleCancel}
                    variant="ghost"
                    className="h-11 text-sm font-semibold hover:bg-gray-100 transition-all min-h-[44px]"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Summary & Options */}
        <div className="space-y-6">
          {/* Message Summary */}
          <Card className="border shadow-sm bg-gray-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Message Summary</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">Review before sending</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Sending via:</span>
                  <div className="flex gap-1">
                    {channels.email && <Badge variant="default" className="text-xs px-2 py-1">Email</Badge>}
                    {channels.sms && <Badge variant="secondary" className="text-xs px-2 py-1">SMS</Badge>}
                    {!hasAnyChannel && <Badge variant="outline" className="text-xs px-2 py-1">None Selected</Badge>}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold">Recipients:</span>
                  <span className="font-semibold text-sm text-blue-600">{recipientCount} members</span>
                </div>
                
                {channels.sms && estimatedCost > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold">SMS cost:</span>
                    <span className="font-semibold text-sm text-red-600">${estimatedCost.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {!canSend && (
                <div className="p-3 bg-orange-50 border border-orange-200 rounded">
                  <div className="flex items-center gap-2 text-orange-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="font-semibold text-sm">Still Need To:</span>
                  </div>
                  <ul className="text-orange-700 mt-2 text-sm space-y-1">
                    {!content.trim() && <li>• Write your message</li>}
                    {recipients.length === 0 && <li>• Choose who to send to</li>}
                    {channels.email && !subject.trim() && <li>• Add email subject</li>}
                    {!hasAnyChannel && <li>• Select email or SMS</li>}
                  </ul>
                </div>
              )}

              {canSend && (
                <div className="p-3 bg-green-50 border border-green-200 rounded">
                  <div className="flex items-center gap-2 text-green-700">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="font-semibold text-sm">Ready to Send!</span>
                  </div>
                  <p className="text-green-700 mt-2 text-sm">
                    Your message is ready to reach {recipientCount} church members.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Schedule Options */}
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold">Schedule Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="schedule"
                  checked={isScheduled}
                  onChange={(e) => setIsScheduled(e.target.checked)}
                  className="h-4 w-4"
                />
                <Label htmlFor="schedule" className="text-sm font-medium cursor-pointer">
                  Schedule for later
                </Label>
              </div>

              {isScheduled && (
                <div>
                  <Label htmlFor="scheduledDate" className="text-sm font-semibold block mb-2">
                    When to send:
                  </Label>
                  <Input
                    id="scheduledDate"
                    type="datetime-local"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="h-10 text-sm border"
                    min={new Date().toISOString().slice(0, 16)}
                  />
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
            // Remove duplicates and add new recipients
            const existingIds = recipients.map(r => r.id);
            const uniqueNewRecipients = newRecipients.filter(r => !existingIds.includes(r.id));
            setRecipients([...recipients, ...uniqueNewRecipients]);
            setShowRecipientPicker(false);
          }}
          channels={channels}
        />
      )}
    </div>
  );
}

// Helper function to get group size
function getGroupSize(groupId: string): number {
  const groupSizes = {
    "all_members": 247,  // Entire Church Family
    "active_members": 241,  // Active Church Members  
    "first_time_guests": 6,  // First Time Guests
    "eastside_bible_study": 28,  // Eastside Bible Study
    "event_volunteers": 45,  // Event Volunteers
    "youth_group": 45,  // Youth Ministry
    "senior_adults": 67  // Senior Saints
  };
  return groupSizes[groupId as keyof typeof groupSizes] || 1;
}