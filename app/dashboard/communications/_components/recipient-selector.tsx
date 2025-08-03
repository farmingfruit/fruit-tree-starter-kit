"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Search, 
  Filter,
  UserCheck,
  UserPlus,
  Mail,
  MessageSquare
} from "lucide-react";

interface RecipientSelectorProps {
  value: string;
  onChange: (value: string) => void;
  selectedRecipients: string[];
  onRecipientsChange: (recipients: string[]) => void;
  onCountChange: (count: number) => void;
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  membershipStatus: string;
  emailOptIn: boolean;
  smsOptIn: boolean;
}

export function RecipientSelector({
  value,
  onChange,
  selectedRecipients,
  onRecipientsChange,
  onCountChange
}: RecipientSelectorProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [communicationFilter, setCommunicationFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [recipientCounts, setRecipientCounts] = useState({
    all_members: 0,
    active_members: 0,
    visitors: 0,
    custom_selection: 0,
  });

  // Load member data and calculate counts
  useEffect(() => {
    loadMembers();
  }, []);

  // Filter members based on search and filters
  useEffect(() => {
    let filtered = members;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(member =>
        `${member.firstName} ${member.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(member => member.membershipStatus === statusFilter);
    }

    // Communication preference filter
    if (communicationFilter === "email") {
      filtered = filtered.filter(member => member.email && member.emailOptIn);
    } else if (communicationFilter === "sms") {
      filtered = filtered.filter(member => member.phone && member.smsOptIn);
    } else if (communicationFilter === "both") {
      filtered = filtered.filter(member => 
        member.email && member.emailOptIn && member.phone && member.smsOptIn
      );
    }

    setFilteredMembers(filtered);
  }, [members, searchTerm, statusFilter, communicationFilter]);

  // Update recipient count when selection changes
  useEffect(() => {
    let count = 0;
    
    switch (value) {
      case "all_members":
        count = recipientCounts.all_members;
        break;
      case "active_members":
        count = recipientCounts.active_members;
        break;
      case "visitors":
        count = recipientCounts.visitors;
        break;
      case "custom_selection":
        count = selectedRecipients.length;
        break;
      default:
        count = 0;
    }
    
    onCountChange(count);
  }, [value, selectedRecipients, recipientCounts, onCountChange]);

  const loadMembers = async () => {
    setLoading(true);
    try {
      // Simulated API call - replace with actual API
      const mockMembers: Member[] = [
        {
          id: "1",
          firstName: "John",
          lastName: "Smith",
          email: "john.smith@email.com",
          phone: "+1234567890",
          membershipStatus: "Active",
          emailOptIn: true,
          smsOptIn: true,
        },
        {
          id: "2",
          firstName: "Mary",
          lastName: "Johnson",
          email: "mary.johnson@email.com",
          phone: "+1234567891",
          membershipStatus: "Active",
          emailOptIn: true,
          smsOptIn: false,
        },
        {
          id: "3",
          firstName: "Bob",
          lastName: "Williams",
          email: "bob.williams@email.com",
          phone: null,
          membershipStatus: "Visitor",
          emailOptIn: true,
          smsOptIn: false,
        },
        // Add more mock data as needed
      ];

      setMembers(mockMembers);

      // Calculate counts
      const counts = {
        all_members: mockMembers.length,
        active_members: mockMembers.filter(m => m.membershipStatus === "Active").length,
        visitors: mockMembers.filter(m => m.membershipStatus === "Visitor").length,
        custom_selection: 0,
      };
      setRecipientCounts(counts);

    } catch (error) {
      console.error("Error loading members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (memberId: string, selected: boolean) => {
    if (selected) {
      onRecipientsChange([...selectedRecipients, memberId]);
    } else {
      onRecipientsChange(selectedRecipients.filter(id => id !== memberId));
    }
  };

  const handleSelectAll = () => {
    if (selectedRecipients.length === filteredMembers.length) {
      // Deselect all
      onRecipientsChange([]);
    } else {
      // Select all filtered members
      onRecipientsChange(filteredMembers.map(m => m.id));
    }
  };

  const getRecipientTypeDescription = (type: string) => {
    switch (type) {
      case "all_members":
        return "Send to all members in your database";
      case "active_members":
        return "Send only to members with 'Active' status";
      case "visitors":
        return "Send only to members with 'Visitor' status";
      case "custom_selection":
        return "Choose specific individuals to receive the message";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Recipient Type Selection - Elder Friendly */}
      <div className="space-y-4">
        <Label className="text-lg font-medium">Who should receive this message?</Label>
        
        {/* Visual Selection Cards */}
        <div className="space-y-3">
          {[
            { 
              value: "all_members", 
              title: "All Church Members", 
              description: "Send to everyone in your member database",
              icon: "👥",
              count: recipientCounts.all_members
            },
            { 
              value: "active_members", 
              title: "Active Members Only", 
              description: "Send only to members marked as 'Active'",
              icon: "✅",
              count: recipientCounts.active_members
            },
            { 
              value: "visitors", 
              title: "Visitors & New Members", 
              description: "Send to people who recently visited",
              icon: "🆕",
              count: recipientCounts.visitors
            },
            { 
              value: "custom_selection", 
              title: "Choose Specific People", 
              description: "Pick exactly who should receive the message",
              icon: "👈",
              count: selectedRecipients.length
            }
          ].map((option) => (
            <div
              key={option.value}
              onClick={() => onChange(option.value)}
              className={`p-5 border-2 rounded-xl cursor-pointer transition-all hover:bg-blue-50 ${
                value === option.value 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className="text-3xl">{option.icon}</span>
                <div className="flex-1">
                  <h3 className={`text-lg font-semibold ${
                    value === option.value ? 'text-blue-900' : 'text-gray-900'
                  }`}>
                    {option.title}
                  </h3>
                  <p className={`text-base ${
                    value === option.value ? 'text-blue-700' : 'text-gray-600'
                  }`}>
                    {option.description}
                  </p>
                </div>
                <div className="text-right">
                  <div className={`text-2xl font-bold ${
                    value === option.value ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    {option.count}
                  </div>
                  <div className={`text-sm ${
                    value === option.value ? 'text-blue-600' : 'text-gray-500'
                  }`}>
                    people
                  </div>
                </div>
                {value === option.value && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custom Selection Interface - Elder Friendly */}
      {value === "custom_selection" && (
        <Card className="border-2 border-blue-200">
          <CardHeader className="bg-blue-50">
            <CardTitle className="text-xl">Choose Specific Church Members</CardTitle>
            <CardDescription className="text-base">
              Select exactly which people should receive your message
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 p-6">
            {/* Search and Filters - Larger */}
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-4 top-4 h-5 w-5 text-gray-400" />
                <Input
                  placeholder="Type a name to search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 text-lg p-4 h-14"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label className="text-base font-medium mb-2 block">Filter by Member Type:</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="All member types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Member Types</SelectItem>
                      <SelectItem value="Active">Active Members</SelectItem>
                      <SelectItem value="Visitor">Visitors</SelectItem>
                      <SelectItem value="Inactive">Inactive Members</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-base font-medium mb-2 block">Filter by Communication:</Label>
                  <Select value={communicationFilter} onValueChange={setCommunicationFilter}>
                    <SelectTrigger className="h-12 text-lg">
                      <SelectValue placeholder="All communication types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Communication Types</SelectItem>
                      <SelectItem value="email">Can Receive Email</SelectItem>
                      <SelectItem value="sms">Can Receive Text Messages</SelectItem>
                      <SelectItem value="both">Can Receive Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Selection Summary - Prominent */}
            {selectedRecipients.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-green-500 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold">
                      ✓
                    </div>
                    <span className="text-lg font-semibold text-green-800">
                      {selectedRecipients.length} member{selectedRecipients.length !== 1 ? 's' : ''} selected
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => onRecipientsChange([])}
                    className="h-10 px-4"
                  >
                    Clear All Selections
                  </Button>
                </div>
              </div>
            )}

            {/* Quick Select All Button */}
            {filteredMembers.length > 0 && (
              <Button
                variant="outline"
                size="lg"
                onClick={handleSelectAll}
                className="w-full h-12 text-lg"
              >
                {selectedRecipients.length === filteredMembers.length ? "Unselect All" : "Select All"} 
                ({filteredMembers.length} shown)
              </Button>
            )}

            <Separator />

            {/* Member List - Large Cards */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="text-center py-8">
                  <div className="text-lg text-gray-600">Loading church members...</div>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-lg text-gray-600">No members found matching your search</div>
                  <div className="text-base text-gray-500 mt-2">Try adjusting your filters or search term</div>
                </div>
              ) : (
                filteredMembers.map((member) => (
                  <div
                    key={member.id}
                    className={`flex items-center space-x-4 p-4 rounded-xl border-2 hover:bg-blue-50 transition-colors cursor-pointer ${
                      selectedRecipients.includes(member.id) 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleMemberSelect(member.id, !selectedRecipients.includes(member.id))}
                  >
                    <div className="flex items-center">
                      <Checkbox
                        checked={selectedRecipients.includes(member.id)}
                        onCheckedChange={(checked) => 
                          handleMemberSelect(member.id, checked as boolean)
                        }
                        className="w-5 h-5"
                      />
                    </div>
                    
                    {/* Avatar placeholder */}
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600">
                        {member.firstName.charAt(0)}{member.lastName.charAt(0)}
                      </span>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {member.firstName} {member.lastName}
                        </h3>
                        <Badge 
                          variant={member.membershipStatus === "Active" ? "default" : "secondary"} 
                          className="text-sm px-3 py-1"
                        >
                          {member.membershipStatus}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        {member.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <span className={`font-medium ${member.emailOptIn ? "text-green-600" : "text-red-500"}`}>
                              Email: {member.emailOptIn ? "✓ Yes" : "✗ No"}
                            </span>
                          </div>
                        )}
                        
                        {member.phone && (
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            <span className={`font-medium ${member.smsOptIn ? "text-green-600" : "text-red-500"}`}>
                              Text: {member.smsOptIn ? "✓ Yes" : "✗ No"}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {member.email && (
                        <p className="text-sm text-gray-600 mt-1">
                          {member.email}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recipient Summary - Enhanced */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-lg font-medium text-blue-900">Your message will be sent to:</span>
            <div className="text-3xl font-bold text-blue-600 mt-1">
              {value === "custom_selection" 
                ? selectedRecipients.length 
                : recipientCounts[value as keyof typeof recipientCounts] || 0}
              {" "}
              {(value === "custom_selection" 
                ? selectedRecipients.length 
                : recipientCounts[value as keyof typeof recipientCounts] || 0) === 1 
                ? "person" : "people"}
            </div>
          </div>
          <div className="text-6xl">
            📧
          </div>
        </div>
        
        {value !== "custom_selection" && (
          <p className="text-base text-blue-700 mt-3">
            📊 Based on your current church member database and their communication preferences
          </p>
        )}
        
        {value === "custom_selection" && selectedRecipients.length > 0 && (
          <p className="text-base text-blue-700 mt-3">
            👥 You have selected specific members to receive this message
          </p>
        )}
        
        {(value === "custom_selection" ? selectedRecipients.length : recipientCounts[value as keyof typeof recipientCounts] || 0) === 0 && (
          <p className="text-base text-orange-700 mt-3">
            ⚠️ No recipients selected - please choose who should receive your message
          </p>
        )}
      </div>
    </div>
  );
}