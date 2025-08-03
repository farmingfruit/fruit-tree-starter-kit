"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Mail, 
  MessageSquare, 
  Send, 
  Users, 
  Clock, 
  CheckCircle, 
  XCircle,
  Settings,
  Plus,
  BarChart3,
  Phone,
  Globe
} from "lucide-react";

export default function CommunicationsPage() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Communications</h1>
          <p className="text-muted-foreground">
            Send emails and SMS messages to your church members
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Message
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Email Delivery Rate</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98.5%</div>
            <p className="text-xs text-muted-foreground">
              Excellent deliverability
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Recipients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-muted-foreground">
              Email & SMS subscribers
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">SMS Conversations</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              3 unread messages
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="messages">Messages</TabsTrigger>
          <TabsTrigger value="conversations">SMS Conversations</TabsTrigger>
          <TabsTrigger value="setup">Setup & Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Recent Messages */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Messages</CardTitle>
                <CardDescription>Latest email and SMS campaigns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    id: 1,
                    type: "email",
                    subject: "Sunday Service Update",
                    recipients: 234,
                    status: "sent",
                    sentAt: "2 hours ago",
                  },
                  {
                    id: 2,
                    type: "sms",
                    subject: "Youth Group Reminder",
                    recipients: 45,
                    status: "delivered",
                    sentAt: "1 day ago",
                  },
                  {
                    id: 3,
                    type: "email",
                    subject: "Monthly Newsletter",
                    recipients: 456,
                    status: "scheduled",
                    sentAt: "in 2 days",
                  },
                ].map((message) => (
                  <div key={message.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {message.type === "email" ? (
                        <Mail className="h-4 w-4 text-blue-500" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-500" />
                      )}
                      <div>
                        <p className="font-medium">{message.subject}</p>
                        <p className="text-sm text-muted-foreground">
                          {message.recipients} recipients • {message.sentAt}
                        </p>
                      </div>
                    </div>
                    <Badge
                      variant={
                        message.status === "sent" || message.status === "delivered"
                          ? "default"
                          : message.status === "scheduled"
                          ? "secondary"
                          : "destructive"
                      }
                    >
                      {message.status}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Setup Status */}
            <Card>
              <CardHeader>
                <CardTitle>Setup Status</CardTitle>
                <CardDescription>Your communication system configuration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="h-4 w-4" />
                    <span>Email Domain (mail.yourchurch.org)</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4" />
                    <span>Email Service (SendGrid)</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4" />
                    <span>SMS Number (+1 555-CHURCH)</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-4 w-4" />
                    <span>Two-way SMS</span>
                  </div>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </div>
                
                <Button variant="outline" className="w-full mt-4">
                  Review Settings
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common communication tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Mail className="h-6 w-6" />
                  <span>Send Email</span>
                  <span className="text-xs text-muted-foreground">Compose and send to members</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <MessageSquare className="h-6 w-6" />
                  <span>Send SMS</span>
                  <span className="text-xs text-muted-foreground">Quick text message</span>
                </Button>
                
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>View Analytics</span>
                  <span className="text-xs text-muted-foreground">Message performance</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <MessagesList />
        </TabsContent>

        <TabsContent value="conversations" className="space-y-4">
          <SMSConversations />
        </TabsContent>

        <TabsContent value="setup" className="space-y-4">
          <SetupConfiguration />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MessagesList() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>All Messages</CardTitle>
        <CardDescription>View and manage your sent messages</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Messages list component will be implemented here</p>
      </CardContent>
    </Card>
  );
}

function SMSConversations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Conversations</CardTitle>
        <CardDescription>Two-way SMS conversations with members</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">SMS conversations component will be implemented here</p>
      </CardContent>
    </Card>
  );
}

function SetupConfiguration() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Setup & Configuration</CardTitle>
          <CardDescription>Configure your email and SMS settings</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Setup wizard and configuration will be implemented here</p>
        </CardContent>
      </Card>
    </div>
  );
}