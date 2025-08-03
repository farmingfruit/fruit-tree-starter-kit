"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Hash, 
  Plus, 
  Search, 
  Edit3, 
  Trash2,
  MessageSquare,
  Users,
  Calendar,
  Bell,
  Info,
  Play,
  Pause,
  BarChart3,
  Clock
} from "lucide-react";

// Sample keyword data
const sampleKeywords = [
  {
    id: "keyword_1",
    keyword: "PRAY",
    description: "Submit a prayer request",
    autoResponse: "Thank you for reaching out. Please reply with your prayer request and our pastoral team will pray for you. Your request will be kept confidential.",
    isActive: true,
    triggerCount: 23,
    lastTriggered: "2024-01-15T10:30:00Z",
    category: "pastoral"
  },
  {
    id: "keyword_2", 
    keyword: "INFO",
    description: "Get church information",
    autoResponse: "Welcome to {{church}}! 📍 Address: {{address}} ⏰ Service Times: Sunday 9AM & 11AM, Wednesday 7PM 📧 Contact: {{email}} 📞 {{phone}}",
    isActive: true,
    triggerCount: 45,
    lastTriggered: "2024-01-14T16:20:00Z",
    category: "general"
  },
  {
    id: "keyword_3",
    keyword: "EVENTS",
    description: "Get upcoming events",
    autoResponse: "Here are our upcoming events:\\n• This Sunday: Regular Worship Services\\n• Wednesday: Bible Study 7PM\\n• Saturday: Youth Group Game Night\\n\\nFor more details, visit our website or call the church office!",
    isActive: true,
    triggerCount: 18,
    lastTriggered: "2024-01-13T14:15:00Z",
    category: "events"
  },
  {
    id: "keyword_4",
    keyword: "GIVE",
    description: "Get giving information",
    autoResponse: "Thank you for your heart to give! You can give online at {{website}}/give or text GIVE followed by the amount to this number. Your generosity helps support our ministry!",
    isActive: true,
    triggerCount: 12,
    lastTriggered: "2024-01-12T09:45:00Z",
    category: "giving"
  },
  {
    id: "keyword_5",
    keyword: "HELP",
    description: "Get help or support",
    autoResponse: "We're here to help! For urgent pastoral care, call {{emergency_phone}}. For general questions, reply to this message or call the church office at {{phone}} during business hours.",
    isActive: false,
    triggerCount: 7,
    lastTriggered: "2024-01-10T12:30:00Z",
    category: "support"
  }
];

const categories = [
  { id: "all", name: "All Keywords", icon: Hash, color: "blue" },
  { id: "general", name: "General Info", icon: Info, color: "blue" },
  { id: "pastoral", name: "Pastoral Care", icon: Users, color: "green" },
  { id: "events", name: "Events", icon: Calendar, color: "purple" },
  { id: "giving", name: "Giving", icon: BarChart3, color: "emerald" },
  { id: "support", name: "Support", icon: Bell, color: "orange" }
];

export function Keywords() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showCreateForm, setShowCreateForm] = useState(false);

  const filteredKeywords = sampleKeywords.filter(keyword => {
    const matchesSearch = keyword.keyword.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         keyword.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || keyword.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const totalKeywords = sampleKeywords.length;
  const activeKeywords = sampleKeywords.filter(k => k.isActive).length;
  const totalTriggers = sampleKeywords.reduce((acc, k) => acc + k.triggerCount, 0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-foreground mb-2">SMS Keywords</h1>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Set up automatic responses for text message keywords from your members
          </p>
        </div>
        
        <Button
          onClick={() => setShowCreateForm(true)}
          size="lg"
          className="h-12 px-6 text-base font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create New Keyword
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-2 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Hash className="h-6 w-6 text-blue-600" />
              <div>
                <p className="text-2xl font-bold text-blue-700">{totalKeywords}</p>
                <p className="text-base font-medium text-muted-foreground">Total Keywords</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 shadow-sm bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Play className="h-6 w-6 text-green-600" />
              <div>
                <p className="text-2xl font-bold text-green-700">{activeKeywords}</p>
                <p className="text-base font-medium text-muted-foreground">Active Keywords</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-2 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <MessageSquare className="h-6 w-6 text-purple-600" />
              <div>
                <p className="text-2xl font-bold text-purple-700">{totalTriggers}</p>
                <p className="text-base font-medium text-muted-foreground">Total Responses Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="border-2 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 text-base border-2 rounded-xl shadow-sm focus:shadow-md transition-shadow"
              />
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

      {/* Keywords List */}
      <div className="space-y-4">
        {filteredKeywords.length === 0 ? (
          <Card className="border-2">
            <CardContent className="py-12">
              <div className="text-center">
                <Hash className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-xl text-muted-foreground">No keywords found</p>
                <p className="text-base text-muted-foreground mt-2">
                  {searchQuery ? "Try adjusting your search" : "Create your first keyword to get started"}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredKeywords.map((keyword) => (
            <Card key={keyword.id} className="border-2 hover:border-primary/50 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  {/* Keyword Badge */}
                  <div className="flex-shrink-0">
                    <div className={`h-14 w-14 rounded-full flex items-center justify-center shadow-md ${
                      keyword.isActive ? "bg-green-100" : "bg-gray-100"
                    }`}>
                      <Hash className={`h-7 w-7 ${
                        keyword.isActive ? "text-green-600" : "text-gray-600"
                      }`} />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-bold text-foreground">
                          #{keyword.keyword}
                        </h3>
                        <Badge variant={keyword.isActive ? "default" : "secondary"} className="text-sm">
                          {keyword.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline" className="text-sm">
                          {keyword.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Switch 
                          checked={keyword.isActive}
                          className="data-[state=checked]:bg-green-600"
                        />
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <p className="text-base text-muted-foreground mb-3 font-medium">
                      {keyword.description}
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-lg border mb-4">
                      <p className="text-sm font-medium text-muted-foreground mb-2">Auto-Response Message:</p>
                      <p className="text-base text-foreground leading-relaxed">
                        {keyword.autoResponse}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-6 text-base text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>{keyword.triggerCount} responses sent</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        <span>Last used: {formatDate(keyword.lastTriggered)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* How It Works Info */}
      <Card className="border-2 bg-blue-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-xl font-bold flex items-center gap-3">
            <Info className="h-6 w-6 text-blue-600" />
            How SMS Keywords Work
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-base text-blue-900">
            <p>
              <strong>1. Member sends keyword:</strong> When someone texts a keyword like "PRAY" to your church number, it automatically triggers a response.
            </p>
            <p>
              <strong>2. Instant response:</strong> The system immediately sends back your pre-written message with helpful information or next steps.
            </p>
            <p>
              <strong>3. Track engagement:</strong> Monitor how often each keyword is used to understand what your members need most.
            </p>
            <p>
              <strong>4. Personalization:</strong> Use variables like {{church}}, {{address}}, and {{phone}} to automatically include your church details.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Create Keyword Form Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="text-xl font-bold">Create New Keyword</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-base text-muted-foreground">
                This feature will be implemented to create new SMS keywords and auto-responses.
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