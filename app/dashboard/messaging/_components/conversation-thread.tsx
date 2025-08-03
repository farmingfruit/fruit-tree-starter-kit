"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { 
  ArrowLeft, 
  Send, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2,
  Archive,
  Star,
  MoreVertical,
  MessageSquare
} from "lucide-react";

// Sample conversation data
const sampleSMSThread = [
  {
    id: "msg_1",
    sender: "member",
    content: "Hi Pastor, could you please pray for my grandmother? She's having surgery tomorrow.",
    timestamp: "3 days ago, 2:30 PM",
    status: "delivered"
  },
  {
    id: "msg_2", 
    sender: "church",
    content: "Of course, Sarah. I'll be praying for your grandmother and your family. Please keep us updated on how the surgery goes. God bless.",
    timestamp: "3 days ago, 3:15 PM",
    status: "delivered"
  },
  {
    id: "msg_3",
    sender: "member", 
    content: "Thank you so much Pastor. The surgery went well and she's recovering nicely. Your prayers mean everything to us.",
    timestamp: "2 hours ago",
    status: "delivered"
  },
  {
    id: "msg_4",
    sender: "member",
    content: "Also, could you add her to the church prayer list for this Sunday?",
    timestamp: "2 hours ago", 
    status: "delivered"
  }
];

const sampleEmailThread = [
  {
    id: "email_1",
    sender: "church",
    subject: "Welcome to Our Church Family",
    content: "Dear new members, we are so excited to welcome you to our church family...",
    timestamp: "5 hours ago",
    recipients: ["sarah@email.com", "mike@email.com", "elizabeth@email.com"],
    openedBy: ["sarah@email.com", "mike@email.com"],
    clickedBy: ["sarah@email.com"]
  }
];

interface ConversationThreadProps {
  conversation: any;
  onBack: () => void;
}

export function ConversationThread({ conversation, onBack }: ConversationThreadProps) {
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    setIsSending(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setNewMessage("");
    setIsSending(false);
  };

  const isSMS = conversation?.type === "sms";

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-2 shadow-sm">
        <CardHeader className="pb-6">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="lg"
              onClick={onBack}
              className="h-16 w-16 p-0 border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <ArrowLeft className="h-8 w-8" />
            </Button>
            
            <div className="flex items-center gap-6 flex-1">
              {isSMS ? (
                <>
                  <Avatar className="h-20 w-20 ring-3 ring-background shadow-md">
                    <AvatarImage src={conversation.avatar} alt={conversation.contactName} />
                    <AvatarFallback className="text-2xl font-bold bg-blue-100 text-blue-700">
                      {conversation.contactName?.split(' ').map((n: string) => n[0]).join('') || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{conversation.contactName}</h1>
                    <div className="flex items-center gap-2 text-base text-muted-foreground mt-1">
                      <Phone className="h-5 w-5" />
                      <span className="font-medium">{conversation.contactPhone}</span>
                      <MessageSquare className="h-5 w-5 text-green-600 ml-2" />
                      <span className="text-green-600 font-semibold">Text Messages</span>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div className="h-20 w-20 bg-blue-100 rounded-full flex items-center justify-center shadow-md">
                    <Mail className="h-10 w-10 text-blue-600" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">{conversation.subject}</h1>
                    <div className="flex items-center gap-2 text-base text-muted-foreground mt-1">
                      <Mail className="h-5 w-5" />
                      <span className="font-medium">Sent to {conversation.recipientCount} church members</span>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex gap-3">
              <Button variant="outline" size="lg" className="h-16 px-6 border-2 rounded-xl hover:bg-yellow-50 hover:border-yellow-300 transition-colors">
                <Star className="h-6 w-6 mr-3" />
                <span className="text-lg font-semibold">Important</span>
              </Button>
              <Button variant="outline" size="lg" className="h-16 px-6 border-2 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <Archive className="h-6 w-6 mr-3" />
                <span className="text-lg font-semibold">Archive</span>
              </Button>
              <Button variant="outline" size="lg" className="h-16 w-16 p-0 border-2 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors">
                <MoreVertical className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages/Email Content */}
      <Card className="border-2 shadow-sm">
        <CardContent className="p-0">
          {isSMS ? (
            <SMSThreadView />
          ) : (
            <EmailThreadView conversation={conversation} />
          )}
        </CardContent>
      </Card>

      {/* Reply Interface - only for SMS */}
      {isSMS && (
        <Card className="border-2 shadow-sm">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-6 w-6 text-blue-600" />
                <h3 className="text-xl font-bold">Reply to {conversation.contactName}</h3>
              </div>
              
              <div className="space-y-4">
                <Textarea
                  placeholder="Type your reply here. Keep it clear and friendly..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="min-h-[120px] text-base border-2 resize-none rounded-xl shadow-sm focus:shadow-md transition-shadow leading-relaxed"
                  maxLength={160}
                />
                
                <div className="flex items-center justify-between">
                  <div className="text-base text-muted-foreground font-medium">
                    {newMessage.length} of 160 characters used
                    {newMessage.length > 140 && (
                      <div className="text-orange-600 font-bold mt-1 text-base">
                        WARNING: Message will be split into multiple texts
                      </div>
                    )}
                  </div>
                  
                  <Button 
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim() || isSending}
                    size="lg"
                    className="h-12 px-8 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSending ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                        Sending Reply...
                      </>
                    ) : (
                      <>
                        <Send className="h-6 w-6 mr-3" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function SMSThreadView() {
  return (
    <div className="p-8 space-y-8 max-h-[700px] overflow-y-auto">
      {sampleSMSThread.map((message, index) => (
        <div
          key={message.id}
          className={`flex ${message.sender === "church" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`max-w-[75%] p-6 rounded-2xl shadow-md ${
              message.sender === "church"
                ? "bg-blue-600 text-white ml-16"
                : "bg-gray-100 text-gray-900 mr-16 border-2 border-gray-200"
            }`}
          >
            <p className="text-xl leading-relaxed font-medium">{message.content}</p>
            <div
              className={`flex items-center gap-3 mt-4 text-base ${
                message.sender === "church" ? "text-blue-100" : "text-gray-500"
              }`}
            >
              <Clock className="h-5 w-5" />
              <span className="font-medium">{message.timestamp}</span>
              {message.sender === "church" && (
                <>
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span className="text-green-400 font-medium">Delivered</span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmailThreadView({ conversation }: { conversation: any }) {
  return (
    <div className="p-8 space-y-8">
      <div className="border-2 rounded-xl p-8 bg-gray-50 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center shadow-md">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{conversation.subject}</h3>
              <p className="text-xl text-muted-foreground font-medium mt-2">Sent 5 hours ago</p>
            </div>
          </div>
          <div className="flex gap-6">
            <Badge variant="default" className="text-lg px-4 py-2">
              {conversation.openRate} Read Rate
            </Badge>
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {conversation.clickRate} Click Rate
            </Badge>
          </div>
        </div>
        
        <div className="bg-white p-8 rounded-xl border-2 shadow-sm">
          <div className="prose prose-xl max-w-none">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Welcome to Our Church Family!</h2>
            <p className="text-xl leading-relaxed text-gray-800 mb-4">
              Dear Friends,
            </p>
            <p className="text-xl leading-relaxed text-gray-800 mb-4">
              We are absolutely thrilled to welcome you to our church family! Your presence enriches our community, 
              and we look forward to growing in faith together.
            </p>
            <p className="text-xl leading-relaxed text-gray-800 mb-4">
              Here are some ways to get connected:
            </p>
            <ul className="text-xl leading-relaxed text-gray-800 mb-6 space-y-3">
              <li>Join us for Sunday worship at 9:00 AM and 11:00 AM</li>
              <li>Attend our Wednesday night Bible study at 7:00 PM</li>
              <li>Connect with our small groups for deeper fellowship</li>
              <li>Explore volunteer opportunities to serve our community</li>
            </ul>
            <p className="text-xl leading-relaxed text-gray-800 mb-4">
              If you have any questions or need assistance, please don't hesitate to reach out. 
              We're here to support you on your spiritual journey.
            </p>
            <p className="text-xl leading-relaxed text-gray-800 font-medium">
              Blessings,<br />
              Pastor John and the Church Leadership Team
            </p>
          </div>
        </div>
        
        <div className="mt-8 space-y-4">
          <h4 className="text-2xl font-bold">How Did This Email Perform?</h4>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="flex items-center gap-4 p-6 bg-green-50 rounded-xl border-2 border-green-200 shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-700">12</div>
                <span className="text-lg font-medium text-green-600">Successfully Sent</span>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-blue-50 rounded-xl border-2 border-blue-200 shadow-sm">
              <Mail className="h-8 w-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-700">9 (75%)</div>
                <span className="text-lg font-medium text-blue-600">Read the Email</span>
              </div>
            </div>
            <div className="flex items-center gap-4 p-6 bg-purple-50 rounded-xl border-2 border-purple-200 shadow-sm">
              <CheckCircle2 className="h-8 w-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-700">3 (25%)</div>
                <span className="text-lg font-medium text-purple-600">Clicked Links</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}