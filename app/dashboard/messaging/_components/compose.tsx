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
  CheckCircle2,
  Search,
  Plus,
  X,
  ArrowLeft,
  ArrowRight,
  Home
} from "lucide-react";
import Link from "next/link";

interface Recipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: "individual" | "group";
}

interface GroupData {
  id: string;
  name: string;
  count: number;
  description?: string;
}

interface MemberData {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  membershipStatus: string;
}

type WizardStep = 1 | 2 | 3;

export function Compose() {
  // Wizard state
  const [currentStep, setCurrentStep] = useState<WizardStep>(1);
  
  // Form state
  const [selectedChannel, setSelectedChannel] = useState<"email" | "sms" | null>(null);
  const [subject, setSubject] = useState("");
  const [content, setContent] = useState("");
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [recipientTab, setRecipientTab] = useState<"contacts" | "groups">("contacts");
  const [contactSearch, setContactSearch] = useState("");

  // Calculations
  const smsMessages = Math.ceil(content.length / 160);
  const recipientCount = recipients.reduce((acc, r) => {
    return acc + (r.type === "group" ? getGroupSize(r.id) : 1);
  }, 0);
  const estimatedCost = selectedChannel === "sms" ? (recipientCount * smsMessages * 0.01) : 0;

  // Sample church groups data
  const churchGroups: GroupData[] = [
    { id: "eastside_bible_study", name: "Eastside Bible Study", count: 1, description: "Weekly Bible study group" },
    { id: "event_volunteers", name: "Event Volunteers", count: 0, description: "Volunteers for church events" },
    { id: "first_time_guests", name: "First Time Guests", count: 1, description: "New visitors to our church" },
    { id: "first_timers", name: "First Timers", count: 0, description: "First-time attendees" },
    { id: "interested_in_baptism", name: "Interested in Baptism", count: 3, description: "Members considering baptism" },
    { id: "youth_group", name: "Youth Ministry", count: 45, description: "Young people ages 13-18" },
    { id: "senior_adults", name: "Senior Saints", count: 67, description: "Beloved members 65 and older" },
    { id: "prayer_team", name: "Prayer Team", count: 12, description: "Dedicated prayer warriors" },
    { id: "worship_team", name: "Worship Team", count: 18, description: "Music and worship leaders" },
    { id: "small_groups", name: "Small Groups", count: 89, description: "Community fellowship groups" }
  ];

  // Sample church members data
  const churchMembers: MemberData[] = [
    { id: "member_1", firstName: "Fred", lastName: "Flintstone", email: "fred.flintstone@bbcc.org", phone: "+1 (555) 123-FRED", membershipStatus: "Deacon" },
    { id: "member_2", firstName: "Wilma", lastName: "Flintstone", email: "wilma.flintstone@bbcc.org", phone: "+1 (555) 123-FRED", membershipStatus: "Active" },
    { id: "member_3", firstName: "John", lastName: "Smith", email: "john.smith@bbcc.org", phone: "+1 (555) 234-5678", membershipStatus: "Elder" },
    { id: "member_4", firstName: "Betty", lastName: "Johnson", email: "betty.johnson@bbcc.org", phone: "+1 (555) 345-6789", membershipStatus: "Active" },
    { id: "member_5", firstName: "Tom", lastName: "Wilson", email: "tom.wilson@bbcc.org", phone: "+1 (555) 456-7890", membershipStatus: "Active" },
    { id: "member_6", firstName: "Sarah", lastName: "Davis", email: "sarah.davis@bbcc.org", phone: "+1 (555) 567-8901", membershipStatus: "Active" },
    { id: "member_7", firstName: "Michael", lastName: "Brown", email: "michael.brown@bbcc.org", phone: "+1 (555) 678-9012", membershipStatus: "Visitor" },
    { id: "member_8", firstName: "Lisa", lastName: "Anderson", email: "lisa.anderson@bbcc.org", phone: "+1 (555) 789-0123", membershipStatus: "Active" }
  ];

  // Filter members based on search and channel requirements
  const filteredMembers = churchMembers.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const hasEmailContact = selectedChannel === "email" ? member.email : true;
    const hasSmsContact = selectedChannel === "sms" ? member.phone : true;
    return fullName.includes(contactSearch.toLowerCase()) && hasEmailContact && hasSmsContact;
  });

  const handleSendMessage = async () => {
    if (!content.trim() || recipients.length === 0 || !selectedChannel) return;
    if (selectedChannel === "email" && !subject.trim()) return;
    
    setIsSending(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset form
      setSubject("");
      setContent("");
      setRecipients([]);
      setSelectedChannel(null);
      setCurrentStep(1);
      
      // Show success message
      const channelText = selectedChannel === "email" ? "Email" : "Text message";
      alert(`${channelText} sent successfully to ${recipientCount} church members!`);
    } catch (error) {
      alert("Failed to send message. Please try again.");
    } finally {
      setIsSending(false);
    }
  };

  const canProceedToStep2 = selectedChannel !== null;
  const canProceedToStep3 = recipients.length > 0;
  const canSend = content.trim() && recipients.length > 0 && selectedChannel &&
    (selectedChannel === "sms" || subject.trim());

  const handleNext = () => {
    if (currentStep === 1 && canProceedToStep2) {
      setCurrentStep(2);
    } else if (currentStep === 2 && canProceedToStep3) {
      setCurrentStep(3);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as WizardStep);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50" style={{backgroundColor: '#F5F7FA'}}>
      <div className="max-w-5xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8 bg-white rounded-lg p-6" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.12)', border: '1px solid #E1E8ED'}}>
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/dashboard/messaging" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <Home className="h-4 w-4" />
            </Link>
            <span className="text-gray-300">/</span>
            <Link href="/dashboard/messaging" className="hover:text-blue-600 transition-colors font-medium">
              Messages
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-gray-900 font-semibold">Compose</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">Send Message</h1>
              <p className="text-gray-600 text-sm">Reach your church family with a personalized message</p>
            </div>
            <Link href="/dashboard/messaging">
              <Button variant="outline" className="flex items-center gap-2 font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all">
                <ArrowLeft className="h-4 w-4" />
                Back to Messages
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="mb-8 bg-white rounded-lg p-6" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.12)', border: '1px solid #E1E8ED'}}>
          <div className="flex items-center justify-center space-x-8">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step === currentStep 
                    ? "bg-blue-600 text-white" 
                    : step < currentStep 
                    ? "bg-green-600 text-white" 
                    : "bg-gray-300 text-gray-600"
                }`}>
                  {step < currentStep ? <CheckCircle2 className="h-5 w-5" /> : step}
                </div>
                <div className="ml-3">
                  <div className={`text-sm font-semibold ${
                    step === currentStep ? "text-blue-600" : step < currentStep ? "text-green-600" : "text-gray-500"
                  }`}>
                    Step {step}
                  </div>
                  <div className="text-xs text-gray-500 font-medium">
                    {step === 1 ? "Choose Channel" : step === 2 ? "Select Recipients" : "Write Message"}
                  </div>
                </div>
                {step < 3 && (
                  <div className={`w-16 h-0.5 ml-6 ${
                    step < currentStep ? "bg-green-600" : "bg-gray-300"
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card className="bg-white border border-gray-200" style={{boxShadow: '0 1px 3px rgba(0,0,0,0.12)'}}>
          {/* Step 1: Choose Channel */}
          {currentStep === 1 && (
            <>
              <CardHeader className="border-b" style={{borderColor: '#E1E8ED'}}>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  Choose How to Send Your Message
                </CardTitle>
                <p className="text-gray-600 mt-2 text-sm">Select either email or text message to reach your church family</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                  <div
                    onClick={() => setSelectedChannel("email")}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedChannel === "email"
                        ? "border-blue-500 bg-blue-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                        selectedChannel === "email" ? "bg-blue-100" : "bg-gray-100"
                      }`}>
                        <Mail className={`h-8 w-8 ${
                          selectedChannel === "email" ? "text-blue-600" : "text-gray-600"
                        }`} />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">Email Message</h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        Send formatted emails with subjects, links, and personalization
                      </p>
                      <div className="text-xs text-gray-500 font-medium">
                        Perfect for announcements, newsletters, and detailed information
                      </div>
                      {selectedChannel === "email" && (
                        <div className="mt-4 flex items-center justify-center text-blue-600">
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          <span className="font-medium">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div
                    onClick={() => setSelectedChannel("sms")}
                    className={`p-6 border-2 rounded-lg cursor-pointer transition-all hover:shadow-md ${
                      selectedChannel === "sms"
                        ? "border-green-500 bg-green-50 shadow-md"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="text-center">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-4 ${
                        selectedChannel === "sms" ? "bg-green-100" : "bg-gray-100"
                      }`}>
                        <MessageSquare className={`h-8 w-8 ${
                          selectedChannel === "sms" ? "text-green-600" : "text-gray-600"
                        }`} />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900 mb-2">Text Message</h3>
                      <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                        Send quick, direct text messages that reach members instantly
                      </p>
                      <div className="text-xs text-gray-500 font-medium">
                        Great for urgent updates, reminders, and short announcements
                      </div>
                      {selectedChannel === "sms" && (
                        <div className="mt-4 flex items-center justify-center text-green-600">
                          <CheckCircle2 className="h-5 w-5 mr-2" />
                          <span className="font-medium">Selected</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedToStep2}
                    className="px-8 py-3 text-base font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-all"
                  >
                    Continue to Recipients
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 2: Select Recipients */}
          {currentStep === 2 && (
            <>
              <CardHeader className="border-b" style={{borderColor: '#E1E8ED'}}>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="h-5 w-5 text-gray-600" />
                  Select Recipients
                </CardTitle>
                <p className="text-gray-600 mt-2 text-sm">Choose who will receive your message</p>
              </CardHeader>
              <CardContent className="p-8">
                {/* Quick Select Buttons */}
                <div className="mb-8 p-4 bg-gray-50 rounded-lg" style={{border: '1px solid #E1E8ED'}}>
                  <h3 className="text-base font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Users className="h-4 w-4 text-gray-600" />
                    Quick Select
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const allMembers = {id: "all_members", name: "All Members", type: "group" as const};
                        setRecipients([allMembers]);
                      }}
                      className="h-16 flex flex-col gap-1 hover:bg-blue-50 hover:border-blue-300 border-gray-300 bg-white transition-all"
                    >
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="font-semibold text-gray-900">All Members</span>
                      <span className="text-xs text-gray-500 font-medium">247 people</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const activeMembers = {id: "active_members", name: "Active Members", type: "group" as const};
                        setRecipients([activeMembers]);
                      }}
                      className="h-16 flex flex-col gap-1 hover:bg-green-50 hover:border-green-300 border-gray-300 bg-white transition-all"
                    >
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <span className="font-semibold text-gray-900">Active Members</span>
                      <span className="text-xs text-gray-500 font-medium">241 people</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const visitors = {id: "first_time_guests", name: "First Time Guests", type: "group" as const};
                        setRecipients([visitors]);
                      }}
                      className="h-16 flex flex-col gap-1 hover:bg-purple-50 hover:border-purple-300 border-gray-300 bg-white transition-all"
                    >
                      <Plus className="h-4 w-4 text-purple-600" />
                      <span className="font-semibold text-gray-900">Visitors</span>
                      <span className="text-xs text-gray-500 font-medium">6 people</span>
                    </Button>
                  </div>
                </div>

                {/* Tabs for Contacts/Groups */}
                <div className="border-b mb-6" style={{borderColor: '#E1E8ED'}}>
                  <div className="flex space-x-8">
                    <button
                      onClick={() => setRecipientTab("contacts")}
                      className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                        recipientTab === "contacts"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      Individual Contacts
                    </button>
                    <button
                      onClick={() => setRecipientTab("groups")}
                      className={`py-3 text-sm font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                        recipientTab === "groups"
                          ? "border-blue-500 text-blue-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Users className="h-4 w-4" />
                      Groups
                    </button>
                  </div>
                </div>

                {/* Tab Content */}
                {recipientTab === "contacts" ? (
                  <div className="space-y-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search for church members..."
                        value={contactSearch}
                        onChange={(e) => setContactSearch(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto space-y-2">
                      {filteredMembers.length === 0 ? (
                        <p className="text-center text-gray-500 py-8">
                          {contactSearch ? "No members found." : "Start typing to search for members."}
                        </p>
                      ) : (
                        filteredMembers.map((member) => {
                          const isSelected = recipients.find(r => r.id === member.id);
                          return (
                            <div
                              key={member.id}
                              onClick={() => {
                                const recipient: Recipient = {
                                  id: member.id,
                                  name: `${member.firstName} ${member.lastName}`,
                                  email: member.email,
                                  phone: member.phone,
                                  type: "individual"
                                };
                                if (!isSelected) {
                                  setRecipients([...recipients, recipient]);
                                }
                              }}
                              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                                isSelected 
                                  ? "bg-blue-50 border-blue-300 shadow-sm" 
                                  : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-semibold text-gray-900">{member.firstName} {member.lastName}</p>
                                  <p className="text-sm text-gray-500 font-medium">
                                    {selectedChannel === "email" ? member.email : member.phone}
                                  </p>
                                </div>
                                {isSelected && (
                                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                                )}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {churchGroups.map((group) => {
                      const isSelected = recipients.find(r => r.id === group.id);
                      return (
                        <div
                          key={group.id}
                          onClick={() => {
                            const recipient: Recipient = {
                              id: group.id,
                              name: group.name,
                              type: "group"
                            };
                            if (!isSelected) {
                              setRecipients([...recipients, recipient]);
                            }
                          }}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            isSelected 
                              ? "bg-blue-50 border-blue-300 shadow-sm" 
                              : "bg-white border-gray-200 hover:bg-gray-50 hover:border-gray-300 hover:shadow-sm"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{group.name}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className="text-sm text-gray-500 font-medium">{group.description}</span>
                                <Badge variant="outline" className="text-xs font-medium bg-gray-50">
                                  {group.count} members
                                </Badge>
                              </div>
                            </div>
                            {isSelected && (
                              <CheckCircle2 className="h-5 w-5 text-blue-600" />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Selected Recipients */}
                {recipients.length > 0 && (
                  <div className="mt-6 p-4 bg-white rounded-lg" style={{border: '1px solid #E1E8ED', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        Selected: {recipientCount} members
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setRecipients([])}
                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 font-medium"
                      >
                        Clear all
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {recipients.map((recipient) => (
                        <div
                          key={recipient.id}
                          className="flex items-center gap-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                        >
                          <span>{recipient.name}</span>
                          {recipient.type === "group" && (
                            <span className="text-xs">({getGroupSize(recipient.id)})</span>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRecipients(recipients.filter(r => r.id !== recipient.id))}
                            className="h-4 w-4 p-0 hover:bg-blue-200 rounded-full ml-1"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8 pt-6" style={{borderTop: '1px solid #E1E8ED'}}>
                  <Button variant="outline" onClick={handleBack} className="font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canProceedToStep3}
                    className="px-8 font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-all"
                  >
                    Continue to Message
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </>
          )}

          {/* Step 3: Write Message with Live Preview */}
          {currentStep === 3 && (
            <>
              <CardHeader className="border-b" style={{borderColor: '#E1E8ED'}}>
                <CardTitle className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gray-600" />
                  Write Your Message
                </CardTitle>
                <p className="text-gray-600 mt-2 text-sm">Compose your message with live preview</p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                  {/* Message Composer - 60% */}
                  <div className="lg:col-span-3 space-y-6">
                    {selectedChannel === "email" && (
                      <div>
                        <Label htmlFor="subject" className="text-sm font-semibold block mb-2 text-gray-900">
                          Email Subject
                        </Label>
                        <Input
                          id="subject"
                          placeholder="What's this message about?"
                          value={subject}
                          onChange={(e) => setSubject(e.target.value)}
                          className="text-base"
                        />
                      </div>
                    )}

                    <div>
                      <Label htmlFor="content" className="text-sm font-semibold block mb-2 text-gray-900">
                        Your Message
                      </Label>
                      <Textarea
                        id="content"
                        placeholder={
                          selectedChannel === "email" 
                            ? "Write your message here. You can use {firstName} for personalization."
                            : "Write a clear, concise message. Longer messages may be split into multiple texts."
                        }
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="min-h-[300px] text-base leading-relaxed resize-none"
                      />
                      
                      {selectedChannel === "sms" && (
                        <div className="mt-2 text-sm">
                          <span className={content.length > 160 ? "text-orange-600 font-medium" : "text-gray-500"}>
                            {content.length}/160 characters
                          </span>
                          {content.length > 160 && (
                            <div className="text-orange-600 font-medium">
                              Will send {smsMessages} messages per person (${(smsMessages * 0.01).toFixed(2)} each)
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Preview - 40% */}
                  <div className="lg:col-span-2">
                    <div className="sticky top-8">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-gray-600" />
                        Live Preview
                      </h3>
                      <div className="border rounded-lg p-4 bg-white" style={{border: '1px solid #E1E8ED', boxShadow: '0 1px 3px rgba(0,0,0,0.12)'}}>
                        {selectedChannel === "email" ? (
                          <div className="space-y-3">
                            <div className="border-b border-gray-100 pb-3">
                              <div className="text-xs text-gray-500 mb-1">Subject:</div>
                              <div className="font-semibold">
                                {subject || "Your message subject will appear here"}
                              </div>
                            </div>
                            <div className="text-sm">
                              <div className="text-xs text-gray-500 mb-2">Message:</div>
                              <div className="whitespace-pre-wrap">
                                {content.replace(/\{firstName\}/g, "John") || "Your message content will appear here as you type..."}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-3">
                            <div className="text-xs text-gray-500">Text Message Preview:</div>
                            <div className="bg-blue-500 text-white p-3 rounded-lg rounded-bl-none text-sm max-w-[80%]">
                              {content || "Your text message will appear here..."}
                            </div>
                            {content.length > 160 && (
                              <div className="text-xs text-orange-600">
                                Note: This will be sent as {smsMessages} separate messages
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Summary */}
                      <div className="mt-6 p-4 bg-white rounded-lg" style={{border: '1px solid #E1E8ED', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-blue-600" />
                          Summary
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Channel:</span>
                            <span className="font-semibold text-gray-900">
                              {selectedChannel === "email" ? "Email" : "SMS"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Recipients:</span>
                            <span className="font-semibold text-gray-900">{recipientCount} members</span>
                          </div>
                          {selectedChannel === "sms" && estimatedCost > 0 && (
                            <div className="flex justify-between">
                              <span className="text-gray-600">Estimated cost:</span>
                              <span className="font-semibold text-orange-600">
                                ${estimatedCost.toFixed(2)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between mt-8 pt-6" style={{borderTop: '1px solid #E1E8ED'}}>
                  <Button variant="outline" onClick={handleBack} className="font-medium border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!canSend || isSending}
                    className="px-8 font-semibold bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500 transition-all"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </>
          )}
        </Card>
      </div>
    </div>
  );
}

// Helper function to get group size
function getGroupSize(groupId: string): number {
  const groupSizes = {
    "all_members": 247,  // Entire Church Family
    "active_members": 241,  // Active Church Members  
    "first_time_guests": 6,  // First Time Guests
    "eastside_bible_study": 1,  // Eastside Bible Study
    "event_volunteers": 0,  // Event Volunteers
    "first_timers": 0,  // First Timers
    "interested_in_baptism": 3,  // Interested in Baptism
    "youth_group": 45,  // Youth Ministry
    "senior_adults": 67,  // Senior Saints
    "prayer_team": 12,  // Prayer Team
    "worship_team": 18,  // Worship Team
    "small_groups": 89  // Small Groups
  };
  return groupSizes[groupId as keyof typeof groupSizes] || 1;
}