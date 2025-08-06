"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Copy,
  Mail,
  MessageSquare,
  Filter,
  Calendar,
  Users,
  Heart,
  Gift,
  Clock,
  Star
} from "lucide-react";

// Sample template data
const sampleTemplates = [
  {
    id: "template_1",
    name: "Welcome New Members",
    type: "email" as const,
    category: "welcome",
    subject: "Welcome to Our Church Family!",
    content: "Dear {{firstName}},\n\nWe are thrilled to welcome you to our church family! Your presence enriches our community, and we look forward to growing in faith together.\n\nHere are some ways to get connected:\n• Join us for Sunday worship at 9:00 AM and 11:00 AM\n• Attend our Wednesday night Bible study\n• Connect with our small groups\n\nBlessings,\nPastor John",
    lastUsed: "2024-01-15",
    useCount: 12,
    isStarred: true
  },
  {
    id: "template_2",
    name: "Service Reminder", 
    type: "sms" as const,
    category: "reminder",
    subject: null,
    content: "Hi {{firstName}}! Don't forget about our special service this Sunday at {{time}}. See you there!",
    lastUsed: "2024-01-10",
    useCount: 45,
    isStarred: false
  },
  {
    id: "template_3",
    name: "Prayer Request Response",
    type: "sms" as const,
    category: "pastoral",
    subject: null,
    content: "Thank you for sharing your prayer request with us, {{firstName}}. Our church family is praying for you and your situation. God bless you.",
    lastUsed: "2024-01-08",
    useCount: 23,
    isStarred: true
  },
  {
    id: "template_4",
    name: "Monthly Newsletter",
    type: "email" as const,
    category: "newsletter",
    subject: "{{church}} Monthly Newsletter - {{month}} {{year}}",
    content: "Dear Church Family,\n\nWhat a wonderful month we've had together! Here are the highlights and upcoming events:\n\n**This Month's Highlights:**\n• [Add highlights here]\n\n**Upcoming Events:**\n• [Add events here]\n\n**Prayer Requests:**\n• [Add prayer requests here]\n\nBlessings,\nThe Leadership Team",
    lastUsed: "2024-01-01",
    useCount: 8,
    isStarred: false
  },
  {
    id: "template_5",
    name: "Event Invitation",
    type: "email" as const,
    category: "events",
    subject: "You're Invited: {{eventName}}",
    content: "Dear {{firstName}},\n\nYou're cordially invited to join us for {{eventName}} on {{eventDate}} at {{eventTime}}.\n\n{{eventDescription}}\n\nPlease RSVP by {{rsvpDate}} so we can prepare accordingly.\n\nWe hope to see you there!\n\nBlessings,\n{{senderName}}",
    lastUsed: "2023-12-20",
    useCount: 15,
    isStarred: false
  }
];

const categories = [
  { id: "all", name: "All Templates", icon: FileText, color: "blue" },
  { id: "welcome", name: "Welcome", icon: Heart, color: "purple" },
  { id: "reminder", name: "Reminders", icon: Clock, color: "orange" },
  { id: "pastoral", name: "Pastoral Care", icon: Users, color: "green" },
  { id: "newsletter", name: "Newsletter", icon: Mail, color: "blue" },
  { id: "events", name: "Events", icon: Calendar, color: "purple" },
  { id: "giving", name: "Giving", icon: Gift, color: "emerald" }
];

export function Templates() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedType, setSelectedType] = useState<"all" | "email" | "sms">("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredTemplates = sampleTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesType = selectedType === "all" || template.type === selectedType;
    return matchesSearch && matchesCategory && matchesType;
  });

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">Message Templates</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Create and manage reusable message templates for faster communication
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          size="lg"
          className="h-12 px-6 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Template
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border-2 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-2 rounded-xl shadow-sm focus:shadow-md transition-shadow"
              />
            </div>
            
            <div className="flex gap-2">
              <Button
                variant={selectedType === "all" ? "default" : "outline"}
                onClick={() => setSelectedType("all")}
                className="h-12 text-base font-semibold px-6 border-2 rounded-xl"
              >
                All Types
              </Button>
              <Button
                variant={selectedType === "email" ? "default" : "outline"}
                onClick={() => setSelectedType("email")}
                className="h-12 text-base font-semibold px-6 border-2 rounded-xl"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
              <Button
                variant={selectedType === "sms" ? "default" : "outline"}
                onClick={() => setSelectedType("sms")}
                className="h-12 text-base font-semibold px-6 border-2 rounded-xl"
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                SMS
              </Button>
            </div>
          </div>
          
          {/* Categories */}
          <div className="flex flex-wrap gap-2 mt-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className="h-10 text-sm font-medium px-4 border rounded-lg"
              >
                <category.icon className="h-4 w-4 mr-2" />
                {category.name}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredTemplates.length === 0 ? (
          <Card className="border-2 col-span-full">
            <CardContent className="py-12">
              <div className="text-center">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">No templates found</p>
                <p className="text-base text-muted-foreground mt-2">
                  {searchQuery ? "Try adjusting your search or filters" : "Create your first template to get started"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredTemplates.map((template) => (
            <Card key={template.id} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    {template.type === "email" ? (
                      <Mail className="h-5 w-5 text-blue-600" />
                    ) : (
                      <MessageSquare className="h-5 w-5 text-green-600" />
                    )}
                    <CardTitle className="text-lg font-bold">{template.name}</CardTitle>
                    {template.isStarred && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    {template.category}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    Used {template.useCount} times
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                {template.subject && (
                  <div className="mb-3">
                    <p className="text-sm font-medium text-muted-foreground mb-1">Subject:</p>
                    <p className="text-base font-medium line-clamp-1">{template.subject}</p>
                  </div>
                )}
                
                <div className="mb-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Content Preview:</p>
                  <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                    {template.content}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Last used: {new Date(template.lastUsed).toLocaleDateString()}</span>
                  <Button 
                    size="sm" 
                    className="h-8 text-xs font-bold"
                  >
                    Use Template
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Template Form Modal would go here */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Create New Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-muted-foreground">
                This feature will be implemented to create new message templates.
              </p>
              <Button 
                onClick={() => setShowCreateForm(false)}
                variant="outline"
                className="w-full"
              >
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}