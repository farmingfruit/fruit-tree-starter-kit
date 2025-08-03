"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Mail, 
  Bell,
  Users,
  CheckCircle2
} from "lucide-react";
import { Inbox as InboxComponent } from "./_components/inbox";

export default function MessagingPage() {
  return (
    <div className="space-y-6 p-4">
      {/* Header with optimized sizing */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Member Communications</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Send messages to your church family via email and text
          </p>
        </div>
        
        {/* Quick Stats Cards - Optimized sizing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:w-auto w-full">
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">23</p>
                  <p className="text-base font-medium text-muted-foreground">Text Conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Bell className="h-6 w-6 text-orange-600" />
                <div>
                  <p className="text-2xl font-bold text-orange-700">3</p>
                  <p className="text-base font-medium text-muted-foreground">Need Your Reply</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Users className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">247</p>
                  <p className="text-base font-medium text-muted-foreground">Church Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-2 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <CheckCircle2 className="h-6 w-6 text-emerald-600" />
                <div>
                  <p className="text-2xl font-bold text-emerald-700">98%</p>
                  <p className="text-base font-medium text-muted-foreground">Messages Delivered</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Messaging Interface - Now shows inbox by default */}
      <InboxComponent />
    </div>
  );
}