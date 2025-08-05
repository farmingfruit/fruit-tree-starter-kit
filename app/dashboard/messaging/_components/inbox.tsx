"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  MessageSquare, 
  Search, 
  Clock,
  MoreVertical,
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
  },
  {
    id: "sms_4",
    type: "sms" as const,
    contactName: "Robert Martinez",
    contactPhone: "+1 (555) 456-7890",
    lastMessage: "Can we reschedule the deacon meeting to Tuesday evening instead?",
    timestamp: "4 days ago",
    unreadCount: 0,
    avatar: "/api/placeholder/32/32",
    isStarred: false,
    status: "active"
  },
  {
    id: "sms_5",
    type: "sms" as const,
    contactName: "Jennifer Adams",
    contactPhone: "+1 (555) 567-8901",
    lastMessage: "Thank you for organizing the community outreach event. It was amazing!",
    timestamp: "1 week ago",
    unreadCount: 0,
    avatar: "/api/placeholder/32/32",
    isStarred: true,
    status: "active"
  },
  {
    id: "sms_6",
    type: "sms" as const,
    contactName: "David Thompson",
    contactPhone: "+1 (555) 678-9012",
    lastMessage: "Could you please pray for my job interview tomorrow? I'm really nervous.",
    timestamp: "1 week ago",
    unreadCount: 0,
    avatar: "/api/placeholder/32/32",
    isStarred: false,
    status: "active"
  }
];


export function Inbox() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);

  const filteredConversations = smsConversations.filter(conv => {
    return conv.contactName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const unreadCount = smsConversations.reduce((acc, conv) => acc + conv.unreadCount, 0);

  if (selectedConversation) {
    const conversation = smsConversations.find(c => c.id === selectedConversation);
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
      <Card className="border shadow-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Messages from Members
                {unreadCount > 0 && (
                  <Badge variant="destructive" className="text-sm px-2 py-1">
                    {unreadCount} Need Reply
                  </Badge>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Read and reply to messages from your church family
              </p>
            </div>
          </div>
          
          {/* Search */}
          <div className="mt-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for a member's name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-10 text-sm border rounded-lg"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Conversations List */}
      <div className="grid gap-4">
        {filteredConversations.length === 0 ? (
          <Card className="border shadow-sm">
            <CardContent className="py-8">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-lg font-medium text-muted-foreground">No messages found</p>
                <p className="text-sm text-muted-foreground mt-2">
                  {searchQuery ? "Try changing your search terms" : "New messages from members will show up here"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredConversations.map((conversation) => (
            <Card 
              key={conversation.id}
              className={`border hover:border-primary/60 hover:shadow-md transition-all cursor-pointer rounded-lg min-h-[44px] ${
                (conversation as typeof smsConversations[0]).unreadCount > 0 
                  ? "bg-blue-50 border-blue-200" 
                  : "hover:bg-gray-50/50"
              }`}
              onClick={() => setSelectedConversation(conversation.id)}
            >
              <CardContent className="p-3">
                <SMSConversationCard conversation={conversation as typeof smsConversations[0]} />
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
    <div className="flex items-center gap-3 min-h-[44px]">
      {/* Avatar and Status */}
      <div className="relative flex-shrink-0">
        <Avatar className="h-10 w-10">
          <AvatarImage src={conversation.avatar} alt={conversation.contactName} />
          <AvatarFallback className="text-sm font-medium bg-blue-100 text-blue-700">
            {conversation.contactName.split(' ').map(n => n[0]).join('')}
          </AvatarFallback>
        </Avatar>
        {conversation.unreadCount > 0 && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full h-5 w-5 flex items-center justify-center text-xs font-semibold">
            {conversation.unreadCount}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-foreground truncate">
              {conversation.contactName}
            </h3>
            <MessageSquare className="h-4 w-4 text-green-600 flex-shrink-0" />
            {conversation.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current flex-shrink-0" />}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground flex-shrink-0">
            <Clock className="h-3 w-3" />
            <span className="text-xs font-medium whitespace-nowrap">{conversation.timestamp}</span>
          </div>
        </div>
        
        <p className="text-xs text-muted-foreground mb-1 font-medium">
          {conversation.contactPhone}
        </p>
        
        <p className="text-sm text-foreground line-clamp-2 leading-relaxed">
          {conversation.lastMessage}
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-1 flex-shrink-0">
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-green-50 hover:border-green-300 transition-colors">
          <Reply className="h-3 w-3" />
        </Button>
        <Button variant="outline" size="sm" className="h-8 w-8 p-0 hover:bg-gray-50 hover:border-gray-300 transition-colors">
          <MoreVertical className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

