"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, 
  Send, 
  Phone, 
  Search, 
  MoreVertical,
  Check,
  CheckCheck,
  Clock,
  Archive,
  Trash2
} from "lucide-react";

interface SMSMessage {
  id: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  status: 'sent' | 'delivered' | 'read' | 'failed';
  isAutoReply?: boolean;
}

interface SMSConversation {
  id: string;
  memberName: string;
  memberPhone: string;
  lastMessageAt: Date;
  unreadCount: number;
  status: 'active' | 'archived' | 'blocked';
  messages: SMSMessage[];
}

export function SMSConversations() {
  const [conversations, setConversations] = useState<SMSConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");

  useEffect(() => {
    loadConversations();
  }, []);

  const loadConversations = async () => {
    try {
      setLoading(true);
      // Simulated API call - replace with actual implementation
      const mockConversations: SMSConversation[] = [
        {
          id: "conv_1",
          memberName: "John Smith",
          memberPhone: "+1234567890",
          lastMessageAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
          unreadCount: 2,
          status: "active",
          messages: [
            {
              id: "msg_1",
              content: "Thank you for the Sunday service reminder!",
              direction: "inbound",
              timestamp: new Date(Date.now() - 60 * 60 * 1000),
              status: "delivered",
            },
            {
              id: "msg_2",
              content: "You're welcome! We're glad you find our reminders helpful.",
              direction: "outbound",
              timestamp: new Date(Date.now() - 45 * 60 * 1000),
              status: "delivered",
            },
            {
              id: "msg_3",
              content: "Is there a prayer meeting this Wednesday?",
              direction: "inbound",
              timestamp: new Date(Date.now() - 30 * 60 * 1000),
              status: "delivered",
            },
          ],
        },
        {
          id: "conv_2",
          memberName: "Mary Johnson",
          memberPhone: "+1234567891",
          lastMessageAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          unreadCount: 0,
          status: "active",
          messages: [
            {
              id: "msg_4",
              content: "Could you please add me to the volunteer list for the food drive?",
              direction: "inbound",
              timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
              status: "delivered",
            },
            {
              id: "msg_5",
              content: "Absolutely! I'll add you to our volunteer list. Thank you for your heart to serve!",
              direction: "outbound",
              timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
              status: "delivered",
            },
          ],
        },
      ];

      setConversations(mockConversations);
      if (mockConversations.length > 0 && !selectedConversation) {
        setSelectedConversation(mockConversations[0].id);
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyMessage.trim() || !selectedConversation || sending) return;

    try {
      setSending(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Add the message to the conversation
      const newMessage: SMSMessage = {
        id: `msg_${Date.now()}`,
        content: replyMessage,
        direction: "outbound",
        timestamp: new Date(),
        status: "sent",
      };

      setConversations(prev => 
        prev.map(conv => 
          conv.id === selectedConversation
            ? {
                ...conv,
                messages: [...conv.messages, newMessage],
                lastMessageAt: new Date(),
              }
            : conv
        )
      );

      setReplyMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const markAsRead = async (conversationId: string) => {
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent":
        return <Check className="h-3 w-3" />;
      case "delivered":
        return <CheckCheck className="h-3 w-3" />;
      case "read":
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case "failed":
        return <Clock className="h-3 w-3 text-red-500" />;
      default:
        return <Clock className="h-3 w-3" />;
    }
  };

  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = conv.memberName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         conv.memberPhone.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || conv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);

  return (
    <div className="h-[calc(100vh-200px)] bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
      <div className="flex h-full">
        {/* Conversations List - Elder Friendly */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-blue-50">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="text-xl font-bold text-blue-900">Text Message Conversations</h3>
                <p className="text-base text-blue-700">Reply to member messages</p>
              </div>
            </div>
            
            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
              <Input
                placeholder="Search by name or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 text-lg h-12"
              />
            </div>

            {/* Filter Buttons */}
            <div className="flex gap-2 flex-wrap">
              {[
                { key: "active", label: "Active", icon: "💬", count: conversations.filter(c => c.status === "active").length },
                { key: "archived", label: "Archived", icon: "📦", count: conversations.filter(c => c.status === "archived").length },
                { key: "all", label: "All", icon: "👥", count: conversations.length }
              ].map((filterOption) => (
                <Button
                  key={filterOption.key}
                  variant={statusFilter === filterOption.key ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter(filterOption.key)}
                  className="text-sm h-10 px-4"
                >
                  {filterOption.icon} {filterOption.label} ({filterOption.count})
                </Button>
              ))}
            </div>
          </div>

          {/* Conversations */}
          <div className="flex-1 overflow-y-auto">
            {loading ? (
              <div className="p-8 text-center text-gray-600">
                <div className="text-lg">Loading conversations...</div>
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-8 text-center text-gray-600">
                <MessageSquare className="h-16 w-16 mx-auto mb-4 text-gray-400" />
                <div className="text-lg font-medium mb-2">No conversations found</div>
                <div className="text-base">Try adjusting your search or filters</div>
              </div>
            ) : (
              filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-5 border-b border-gray-100 cursor-pointer hover:bg-blue-50 transition-colors ${
                    selectedConversation === conversation.id ? 'bg-blue-100 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => {
                    setSelectedConversation(conversation.id);
                    if (conversation.unreadCount > 0) {
                      markAsRead(conversation.id);
                    }
                  }}
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-blue-600">
                        {conversation.memberName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Header */}
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-lg font-semibold text-gray-900 truncate">
                          {conversation.memberName}
                        </h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {conversation.lastMessageAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {conversation.unreadCount > 0 && (
                            <div className="bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                              {conversation.unreadCount}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Phone */}
                      <div className="flex items-center gap-2 mb-2">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{conversation.memberPhone}</span>
                        <Badge 
                          variant={conversation.status === "active" ? "default" : "secondary"}
                          className="text-xs"
                        >
                          {conversation.status}
                        </Badge>
                      </div>

                      {/* Last Message Preview */}
                      <p className="text-base text-gray-700 line-clamp-2 leading-relaxed">
                        {conversation.messages[conversation.messages.length - 1]?.content}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Conversation View - Elder Friendly */}
        <div className="flex-1 flex flex-col">
          {selectedConv ? (
            <>
              {/* Conversation Header */}
              <div className="p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-bold text-blue-600">
                        {selectedConv.memberName.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </span>
                    </div>
                    
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {selectedConv.memberName}
                      </h3>
                      <div className="flex items-center gap-2 text-base text-gray-600">
                        <Phone className="h-4 w-4" />
                        <span>{selectedConv.memberPhone}</span>
                        <Badge 
                          variant={selectedConv.status === "active" ? "default" : "secondary"}
                          className="text-sm"
                        >
                          {selectedConv.status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="lg"
                      className="h-12 px-4"
                    >
                      <Archive className="h-5 w-5 mr-2" />
                      Archive
                    </Button>
                  </div>
                </div>
              </div>

              {/* Messages - WhatsApp Style */}
              <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                <div className="space-y-4 max-w-4xl mx-auto">
                  {selectedConv.messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.direction === 'outbound' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-2xl p-4 shadow-sm ${
                          message.direction === 'outbound'
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-900 border border-gray-200'
                        }`}
                      >
                        <p className="text-base leading-relaxed">{message.content}</p>
                        <div className={`flex items-center gap-2 mt-2 text-sm ${
                          message.direction === 'outbound' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          <span>
                            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          {message.direction === 'outbound' && (
                            <div className="flex items-center">
                              {getStatusIcon(message.status)}
                            </div>
                          )}
                          {message.isAutoReply && (
                            <Badge variant="secondary" className="text-xs">
                              Auto-reply
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Reply Input - Enhanced */}
              <div className="p-6 border-t border-gray-200 bg-white">
                <div className="max-w-4xl mx-auto">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex gap-4">
                      <Textarea
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="Type your reply to this church member..."
                        className="flex-1 resize-none text-lg p-4 border-0 bg-white rounded-lg"
                        rows={3}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            sendReply();
                          }
                        }}
                      />
                      <Button
                        onClick={sendReply}
                        disabled={!replyMessage.trim() || sending}
                        size="lg"
                        className="px-8 h-auto"
                      >
                        {sending ? (
                          <div className="animate-spin w-5 h-5 border-2 border-white rounded-full border-t-transparent" />
                        ) : (
                          <>
                            <Send className="h-5 w-5 mr-2" />
                            Send Reply
                          </>
                        )}
                      </Button>
                    </div>
                    
                    <div className="flex justify-between text-base text-gray-600 mt-3">
                      <span>💡 Press Enter to send, Shift+Enter for new line</span>
                      <span className={`font-medium ${replyMessage.length > 160 ? 'text-orange-600' : 'text-green-600'}`}>
                        {replyMessage.length}/160 characters
                        {replyMessage.length > 160 && (
                          <span className="text-orange-600 ml-2">
                            (Extra charges apply for long messages)
                          </span>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <MessageSquare className="h-20 w-20 mx-auto mb-6 text-gray-400" />
                <h3 className="text-2xl font-bold text-gray-600 mb-3">
                  Select a Text Conversation
                </h3>
                <p className="text-lg text-gray-500 max-w-md">
                  Choose a conversation from the left to view messages and reply to church members
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}