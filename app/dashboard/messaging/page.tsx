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
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Member Communications</h1>
          <p className="text-base text-muted-foreground">
            Send messages to your church family via text message
          </p>
        </div>
        
        {/* Quick Stats Cards - Optimized sizing */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 lg:w-auto w-full">
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-xl font-bold text-blue-700">23</p>
                  <p className="text-sm font-medium text-muted-foreground">Text Conversations</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm hover:shadow-md transition-shadow bg-orange-50">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Bell className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-xl font-bold text-orange-700">3</p>
                  <p className="text-sm font-medium text-muted-foreground">Need Your Reply</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-xl font-bold text-green-700">247</p>
                  <p className="text-sm font-medium text-muted-foreground">Church Members</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-xl font-bold text-emerald-700">98%</p>
                  <p className="text-sm font-medium text-muted-foreground">Messages Delivered</p>
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