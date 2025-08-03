"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Archive, 
  Search, 
  Filter,
  Mail, 
  MessageSquare, 
  Calendar,
  Users,
  Eye,
  MousePointer,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  Download,
  BarChart3
} from "lucide-react";

// Sample sent messages data
const sentMessages = [
  {
    id: "msg_001",
    type: "email" as const,
    subject: "Welcome to Our Church Family",
    content: "Dear new members, we are excited to welcome you...",
    recipientCount: 12,
    deliveredCount: 12,
    openedCount: 9,
    clickedCount: 3,
    bounceCount: 0,
    unsubscribeCount: 0,
    cost: 0,
    status: "delivered",
    sentAt: "2024-01-15T14:30:00Z",
    sentBy: "Pastor John",
    tags: ["welcome", "new-members"]
  },
  {
    id: "msg_002",
    type: "email" as const,
    subject: "Sunday Service Update - Weather Advisory",
    content: "Due to the weather conditions, we are moving...",
    recipientCount: 247,
    deliveredCount: 245,
    openedCount: 218,
    clickedCount: 29,
    bounceCount: 2,
    unsubscribeCount: 1,
    cost: 0,
    status: "delivered",
    sentAt: "2024-01-14T09:15:00Z",
    sentBy: "Church Admin",
    tags: ["service", "weather", "urgent"]
  },
  {
    id: "msg_003",
    type: "sms" as const,
    subject: null,
    content: "Reminder: Youth Group tonight at 7pm in the Fellowship Hall. See you there!",
    recipientCount: 45,
    deliveredCount: 43,
    openedCount: 43, // SMS is considered "opened" when delivered
    clickedCount: 0,
    bounceCount: 2,
    unsubscribeCount: 0,
    cost: 0.45,
    status: "delivered",
    sentAt: "2024-01-13T16:00:00Z",
    sentBy: "Youth Pastor",
    tags: ["youth", "reminder"]
  },
  {
    id: "msg_004",
    type: "email" as const,
    subject: "Monthly Newsletter - January 2024",
    content: "What a wonderful start to the new year...",
    recipientCount: 198,
    deliveredCount: 196,
    openedCount: 142,
    clickedCount: 34,
    bounceCount: 2,
    unsubscribeCount: 0,
    cost: 0,
    status: "delivered",
    sentAt: "2024-01-12T10:00:00Z",
    sentBy: "Communications Team",
    tags: ["newsletter", "monthly"]
  },
  {
    id: "msg_005",
    type: "sms" as const,
    subject: null,
    content: "Prayer request: Please pray for the Johnson family during this difficult time.",
    recipientCount: 67,
    deliveredCount: 67,
    openedCount: 67,
    clickedCount: 0,
    bounceCount: 0,
    unsubscribeCount: 0,
    cost: 0.67,
    status: "delivered",
    sentAt: "2024-01-11T11:30:00Z",
    sentBy: "Pastor John",
    tags: ["prayer", "urgent"]
  }
];

export function SentMessages() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "email" | "sms">("all");
  const [selectedMessage, setSelectedMessage] = useState<string | null>(null);

  const filteredMessages = sentMessages.filter(message => {
    const matchesSearch = (message.subject || message.content)
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || message.type === filterType;
    return matchesSearch && matchesType;
  });

  const totalMessages = sentMessages.length;
  const totalRecipients = sentMessages.reduce((acc, msg) => acc + msg.recipientCount, 0);
  const totalCost = sentMessages.reduce((acc, msg) => acc + msg.cost, 0);
  const averageOpenRate = sentMessages.length > 0 
    ? Math.round((sentMessages.reduce((acc, msg) => acc + (msg.openedCount / msg.deliveredCount), 0) / sentMessages.length) * 100)
    : 0;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  if (selectedMessage) {
    const message = sentMessages.find(m => m.id === selectedMessage);
    if (message) {
      return <MessageDetails message={message} onBack={() => setSelectedMessage(null)} />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header and Stats */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <CardTitle className="text-xl font-bold flex items-center gap-2">
                <Archive className="h-6 w-6 text-purple-600" />
                Sent Messages
              </CardTitle>
              <p className="text-base text-muted-foreground mt-1">
                View your message history and performance metrics
              </p>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">{totalMessages}</p>
                <p className="text-sm text-muted-foreground">Total Sent</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{totalRecipients}</p>
                <p className="text-sm text-muted-foreground">Recipients</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-600">{averageOpenRate}%</p>
                <p className="text-sm text-muted-foreground">Avg. Open Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-600">${totalCost.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">Total Cost</p>
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Search and Filters */}
      <Card className="border-2">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search messages..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-lg border-2"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={filterType === "all" ? "default" : "outline"}
                onClick={() => setFilterType("all")}
                className="h-12 text-base font-semibold px-6 border-2"
              >
                All Messages
              </Button>
              <Button
                variant={filterType === "email" ? "default" : "outline"}
                onClick={() => setFilterType("email")}
                className="h-12 text-base font-semibold px-6 border-2"
              >
                <Mail className="h-5 w-5 mr-2" />
                Email
              </Button>
              <Button
                variant={filterType === "sms" ? "default" : "outline"}
                onClick={() => setFilterType("sms")}
                className="h-12 text-base font-semibold px-6 border-2"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                SMS
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Messages List */}
      <div className="space-y-4">
        {filteredMessages.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12">
              <div className="text-center">
                <Archive className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">No messages found</p>
                <p className="text-lg text-muted-foreground mt-2">
                  {searchQuery ? "Try adjusting your search" : "Your sent messages will appear here"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredMessages.map((message) => (
            <Card
              key={message.id}
              className="border-2 hover:border-primary/50 transition-colors cursor-pointer"
              onClick={() => setSelectedMessage(message.id)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Message Icon */}
                  <div className="flex-shrink-0">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center ${
                      message.type === "email" ? "bg-blue-100" : "bg-green-100"
                    }`}>
                      {message.type === "email" ? (
                        <Mail className="h-7 w-7 text-blue-600" />
                      ) : (
                        <MessageSquare className="h-7 w-7 text-green-600" />
                      )}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">
                          {message.subject || "SMS Message"}
                        </h3>
                        <div className="flex items-center gap-4 text-base text-muted-foreground mt-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(message.sentAt)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            <span>{message.recipientCount} recipients</span>
                          </div>
                          <span>by {message.sentBy}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={message.status === "delivered" ? "default" : 
                                  message.status === "scheduled" ? "secondary" : "destructive"}
                        >
                          {message.status}
                        </Badge>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <p className="text-lg text-muted-foreground mb-4 line-clamp-2">
                      {message.content}
                    </p>

                    {/* Performance Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                        <div>
                          <p className="text-lg font-semibold">{message.deliveredCount}</p>
                          <p className="text-sm text-muted-foreground">Delivered</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Eye className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-lg font-semibold">
                            {message.openedCount} ({Math.round((message.openedCount / message.deliveredCount) * 100)}%)
                          </p>
                          <p className="text-sm text-muted-foreground">Opened</p>
                        </div>
                      </div>

                      {message.type === "email" && (
                        <div className="flex items-center gap-2">
                          <MousePointer className="h-5 w-5 text-purple-600" />
                          <div>
                            <p className="text-lg font-semibold">
                              {message.clickedCount} ({Math.round((message.clickedCount / message.deliveredCount) * 100)}%)
                            </p>
                            <p className="text-sm text-muted-foreground">Clicked</p>
                          </div>
                        </div>
                      )}

                      {message.bounceCount > 0 && (
                        <div className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <div>
                            <p className="text-lg font-semibold">{message.bounceCount}</p>
                            <p className="text-sm text-muted-foreground">Bounced</p>
                          </div>
                        </div>
                      )}

                      {message.type === "sms" && (
                        <div className="flex items-center gap-2">
                          <DollarSign className="h-5 w-5 text-orange-600" />
                          <div>
                            <p className="text-lg font-semibold">${message.cost.toFixed(2)}</p>
                            <p className="text-sm text-muted-foreground">Cost</p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Tags */}
                    {message.tags && message.tags.length > 0 && (
                      <div className="flex gap-2 mt-4">
                        {message.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}

function MessageDetails({ message, onBack }: { message: any; onBack: () => void }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="lg"
              onClick={onBack}
              className="h-12 w-12 p-0 border-2"
            >
              <Archive className="h-6 w-6" />
            </Button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-foreground">
                {message.subject || "SMS Message"}
              </h1>
              <div className="flex items-center gap-4 text-lg text-muted-foreground mt-1">
                <div className="flex items-center gap-1">
                  <Calendar className="h-5 w-5" />
                  <span>Sent on {new Date(message.sentAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-5 w-5" />
                  <span>{message.recipientCount} recipients</span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" size="lg" className="h-12 px-4 border-2">
                <Download className="h-5 w-5 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="lg" className="h-12 px-4 border-2">
                <BarChart3 className="h-5 w-5 mr-2" />
                Analytics
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="border-2">
          <CardContent className="p-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-3xl font-bold">{message.deliveredCount}</p>
            <p className="text-muted-foreground">Delivered</p>
          </CardContent>
        </Card>
        
        <Card className="border-2">
          <CardContent className="p-6 text-center">
            <Eye className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-3xl font-bold">{Math.round((message.openedCount / message.deliveredCount) * 100)}%</p>
            <p className="text-muted-foreground">Open Rate</p>
          </CardContent>
        </Card>
        
        {message.type === "email" && (
          <Card className="border-2">
            <CardContent className="p-6 text-center">
              <MousePointer className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <p className="text-3xl font-bold">{Math.round((message.clickedCount / message.deliveredCount) * 100)}%</p>
              <p className="text-muted-foreground">Click Rate</p>
            </CardContent>
          </Card>
        )}
        
        {message.type === "sms" && (
          <Card className="border-2">
            <CardContent className="p-6 text-center">
              <DollarSign className="h-8 w-8 text-orange-600 mx-auto mb-2" />
              <p className="text-3xl font-bold">${message.cost.toFixed(2)}</p>
              <p className="text-muted-foreground">Total Cost</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Message Content */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">Message Content</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-6 rounded-lg border">
            <div className="prose prose-lg max-w-none">
              {message.content.split('\n').map((paragraph: string, index: number) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}