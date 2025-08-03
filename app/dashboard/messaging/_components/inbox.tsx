"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Mail, 
  Search, 
  Phone, 
  Clock,
  MoreVertical,
  Archive,
  Star,
  Reply
} from "lucide-react";
import { ConversationThread } from "./conversation-thread";

// Sample data for conversations
const smsConversations = [
  {
    id: "sms_1",
    type: "sms" as const,
    contactName: "Sarah Johnson",
    contactPhone: "+1 (555) 123-4567",
    lastMessage: "Thank you for the prayers. Grandmother's surgery went wonderfully! God is good.",
    timestamp: "2 hours ago",
    unreadCount: 2,
    avatar: "/api/placeholder/32/32",
    isStarred: true,
    status: "active"
  },
  {
    id: "sms_2", 
    type: "sms" as const,
    contactName: "Mike Wilson",
    contactPhone: "+1 (555) 234-5678",
    lastMessage: "Pastor, what time does the men's fellowship breakfast start this Saturday?",
    timestamp: "1 day ago",
    unreadCount: 1,
    avatar: "/api/placeholder/32/32",
    isStarred: false,
    status: "active"
  },
  {
    id: "sms_3",
    type: "sms" as const,
    contactName: "Elizabeth Turner",
    contactPhone: "+1 (555) 345-6789",
    lastMessage: "Hi! Could you please add my daughter Emma to the youth ministry contact list?",
    timestamp: "3 days ago", 
    unreadCount: 0,
    avatar: "/api/placeholder/32/32",
    isStarred: false,
    status: "active"
  }
];

const emailThreads = [
  {
    id: "email_1",
    type: "email" as const,
    subject: "Welcome to Our Church Family - New Member Orientation",
    recipientCount: 12,
    lastActivity: "5 hours ago",
    openRate: "75%",
    clickRate: "23%",
    status: "delivered",
    isStarred: false
  },
  {
    id: "email_2",
    type: "email" as const, 
    subject: "Sunday Worship Service Update - Weather Advisory",
    recipientCount: 247,
    lastActivity: "1 day ago",
    openRate: "89%",
    clickRate: "12%",
    status: "delivered",
    isStarred: true
  },
  {
    id: "email_3",
    type: "email" as const, 
    subject: "Monthly Ministry Newsletter - February 2024",
    recipientCount: 198,
    lastActivity: "3 days ago",
    openRate: "67%",
    clickRate: "18%",
    status: "delivered",
    isStarred: false
  }
];

export function Inbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | "sms" | "email">("all");

  const filteredConversations = [...smsConversations, ...emailThreads].filter(conv => {
    const matchesSearch = conv.type === "sms" 
      ? (conv as typeof smsConversations[0]).contactName.toLowerCase().includes(searchQuery.toLowerCase())
      : (conv as typeof emailThreads[0]).subject.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === "all" || conv.type === activeFilter;
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = smsConversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

  if (selectedConversation) {
    const conversation = [...smsConversations, ...emailThreads].find(c => c.id === selectedConversation);
    return (
      <ConversationThread 
        conversation={conversation}
        onBack={() => setSelectedConversation(null)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Search */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <CardTitle className="text-2xl font-bold flex items-center gap-3">
                <MessageSquare className="h-7 w-7 text-blue-600" />
                Messages from Members
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-base px-3 py-1 animate-pulse">
                    {unreadCount} Need Reply
                  </Badge>
                )}
              </CardTitle>
              <p className="text-base text-muted-foreground mt-2 leading-relaxed">
                Read and reply to messages from your church family
              </p>
            </div>
          </div>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row gap-4 mt-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for a member's name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-2 rounded-xl shadow-sm focus:shadow-md transition-shadow"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                onClick={() => setActiveFilter("all")}
                className="h-12 text-base font-bold px-6 border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                Show All
              </Button>
              <Button
                variant={activeFilter === "sms" ? "default" : "outline"}
                onClick={() => setActiveFilter("sms")}
                className="h-12 text-base font-bold px-6 border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Text Messages
              </Button>
              <Button
                variant={activeFilter === "email" ? "default" : "outline"}
                onClick={() => setActiveFilter("email")}
                className="h-12 text-base font-bold px-6 border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <Mail className="h-5 w-5 mr-2" />
                Emails
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conversations List */}
      <div className="grid gap-4">
        {filteredConversations.length === 0 ? (
          <Card className="border-2 shadow-sm">
            <CardContent className="py-12">
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl font-semibold text-muted-foreground">No messages found</p>
                <p className="text-base text-muted-foreground mt-3 leading-relaxed">
                  {searchQuery ? "Try changing your search terms" : "New messages from members will show up here"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id}
              className={`border-2 hover:border-primary/60 hover:shadow-lg transition-all cursor-pointer rounded-xl ${
                conversation.type === "sms" && (conversation as typeof smsConversations[0]).unreadCount > 0 
                  ? "bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-100" 
                  : "hover:bg-gray-50/50"
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <CardContent className="p-6">
                {conversation.type === "sms" ? (
                  <SMSConversationCard conversation={conversation as typeof smsConversations[0]} />
                ) : (
                  <EmailThreadCard conversation={conversation as typeof emailThreads[0]} />
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function SMSConversationCard({ conversation }: { conversation: typeof smsConversations[0] }) {
  return (
    <div className="flex items-center gap-4">
      {/* Avatar and Status */}
      <div className="relative">
        <Avatar className="h-14 w-14 ring-2 ring-background shadow-md">
          <AvatarImage src={conversation.avatar} alt={conversation.contactName} />
          <AvatarFallback className="text-base font-bold bg-blue-100 text-blue-700">
            {conversation.contactName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        {conversation.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold animate-pulse shadow-lg">
            {conversation.unreadCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground truncate">
              {conversation.contactName}
            </h3>
            <MessageSquare className="h-5 w-5 text-green-600" />
            {conversation.isStarred && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-base font-semibold whitespace-nowrap">{conversation.timestamp}</span>
          </div>
        </div>
        
        <p className="text-base text-muted-foreground mb-2 font-medium">
          {conversation.contactPhone}
        </p>
        
        <p className="text-base text-foreground line-clamp-2 leading-relaxed font-medium">
          {conversation.lastMessage}
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button variant="outline" size="sm" className="h-10 w-10 p-0 border-2 hover:bg-green-50 hover:border-green-300 transition-colors">
          <Reply className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-10 w-10 p-0 border-2 hover:bg-gray-50 hover:border-gray-300 transition-colors">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function EmailThreadCard({ conversation }: { conversation: typeof emailThreads[0] }) {
  return (
    <div className="flex items-center gap-4">
      {/* Email Icon */}
      <div className="flex-shrink-0">
        <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center shadow-md">
          <Mail className="h-7 w-7 text-blue-600" />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-foreground truncate">
              {conversation.subject}
            </h3>
            {conversation.isStarred && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-base font-semibold whitespace-nowrap">{conversation.lastActivity}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-base text-muted-foreground mb-2">
          <span className="font-medium">Sent to {conversation.recipientCount} church members</span>
          <Badge variant={conversation.status === "delivered" ? "default" : "secondary"} className="text-sm px-2 py-1">
            {conversation.status === "delivered" ? "Successfully Sent" : conversation.status}
          </Badge>
        </div>
        
        <div className="flex items-center gap-6 text-base">
          <div className="flex items-center gap-2">
            <span className="font-bold text-green-600">{conversation.openRate}</span>
            <span className="text-muted-foreground font-medium">read the email</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-blue-600">{conversation.clickRate}</span>
            <span className="text-muted-foreground font-medium">clicked links</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-2">
        <Button variant="outline" size="sm" className="h-10 w-10 p-0 border-2 hover:bg-blue-50 hover:border-blue-300 transition-colors">
          <Archive className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" className="h-10 w-10 p-0 border-2 hover:bg-gray-50 hover:border-gray-300 transition-colors">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}