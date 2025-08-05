"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Search, 
  Users, 
  UserCheck, 
  Heart,
  Calendar,
  GraduationCap,
  Crown,
  Mail,
  Phone,
  Check,
  X
} from "lucide-react";

interface Recipient {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  type: "individual" | "group";
}

interface RecipientPickerProps {
  onClose: () => void;
  onSelect: (recipients: Recipient[]) => void;
  channels: {email: boolean, sms: boolean};
}

// Sample data for quick groups
const quickGroups = [
  {
    id: "all_members",
    name: "Entire Church Family",
    description: "Everyone in our church community",
    count: 247,
    icon: Users,
    color: "blue"
  },
  {
    id: "active_members", 
    name: "Active Church Members",
    description: "Regular attendees and committed members",
    count: 198,
    icon: UserCheck,
    color: "green"
  },
  {
    id: "visitors",
    name: "Visitors & Newcomers", 
    description: "New friends visiting our church",
    count: 23,
    icon: Heart,
    color: "purple"
  },
  {
    id: "youth_group",
    name: "Youth Ministry",
    description: "Young people ages 13-18",
    count: 45,
    icon: GraduationCap,
    color: "orange"
  },
  {
    id: "senior_adults",
    name: "Senior Saints",
    description: "Beloved members 65 and older",
    count: 67,
    icon: Crown,
    color: "amber"
  }
];

// Sample individual members data (from existing church data)
const sampleMembers = [
  {
    id: "member_1",
    firstName: "Fred",
    lastName: "Flintstone",
    email: "fred.flintstone@bbcc.org",
    phone: "+1 (555) 123-FRED",
    membershipStatus: "Deacon",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: "member_2",
    firstName: "Wilma",
    lastName: "Flintstone",
    email: "wilma.flintstone@bbcc.org", 
    phone: "+1 (555) 123-FRED",
    membershipStatus: "Active",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: "member_3",
    firstName: "SpongeBob", 
    lastName: "SquarePants",
    email: "spongebob@bbcc.org",
    phone: "+1 (555) 123-KRAB",
    membershipStatus: "Active",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: "member_4",
    firstName: "Jim",
    lastName: "Halpert",
    email: "jim.halpert@bbcc.org",
    phone: "+1 (555) 456-7890", 
    membershipStatus: "Elder",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: "member_5",
    firstName: "Pam",
    lastName: "Halpert",
    email: "pam.halpert@bbcc.org",
    phone: "+1 (555) 456-7890",
    membershipStatus: "Active",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: "member_6",
    firstName: "Dwight",
    lastName: "Schrute",
    email: "pastor@bbcc.org",
    phone: "+1 (555) 234-5678",
    membershipStatus: "Pastor",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: "member_7",
    firstName: "Ben",
    lastName: "Wyatt",
    email: "ben.wyatt@bbcc.org",
    phone: "+1 (555) 345-6789",
    membershipStatus: "Elder",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: "member_8",
    firstName: "Leslie",
    lastName: "Wyatt",
    email: "leslie.wyatt@bbcc.org",
    phone: "+1 (555) 345-6789",
    membershipStatus: "Active",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: "member_9",
    firstName: "Squidward",
    lastName: "Tentacles",
    email: "squidward@email.com",
    phone: "+1 (555) 567-8901",
    membershipStatus: "Visitor",
    avatar: "/api/placeholder/32/32"
  },
  {
    id: "member_10",
    firstName: "Michael",
    lastName: "Scott",
    email: "michael.scott@email.com",
    phone: "+1 (555) 678-9012",
    membershipStatus: "Visitor",
    avatar: "/api/placeholder/32/32"
  }
];

export function RecipientPicker({ onClose, onSelect, channels }: RecipientPickerProps) {
  const [selectedTab, setSelectedTab] = useState<"groups" | "individuals">("groups");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<Recipient[]>([]);

  const filteredMembers = sampleMembers.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const hasEmailContact = channels.email ? member.email : true;
    const hasSmsContact = channels.sms ? member.phone : true;
    return fullName.includes(searchQuery.toLowerCase()) && hasEmailContact && hasSmsContact;
  });

  const filteredGroups = quickGroups.filter(group =>
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGroupSelect = (group: typeof quickGroups[0]) => {
    const recipient: Recipient = {
      id: group.id,
      name: group.name,
      type: "group"
    };
    
    if (!selectedRecipients.find(r => r.id === recipient.id)) {
      setSelectedRecipients([...selectedRecipients, recipient]);
    }
  };

  const handleMemberSelect = (member: typeof sampleMembers[0]) => {
    const recipient: Recipient = {
      id: member.id,
      name: `${member.firstName} ${member.lastName}`,
      email: member.email,
      phone: member.phone,
      type: "individual"
    };
    
    if (!selectedRecipients.find(r => r.id === recipient.id)) {
      setSelectedRecipients([...selectedRecipients, recipient]);
    }
  };

  const removeRecipient = (id: string) => {
    setSelectedRecipients(selectedRecipients.filter(r => r.id !== id));
  };

  const handleConfirmSelection = () => {
    onSelect(selectedRecipients);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
        <DialogHeader className="pb-6">
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <Users className="h-7 w-7 text-blue-600" />
            Choose Who Gets Your Message
          </DialogTitle>
          <p className="text-base text-muted-foreground leading-relaxed mt-2">
            Select church members or groups to receive your message
            {channels.email && channels.sms && " via email and text message"}
            {channels.email && !channels.sms && " via email"}
            {!channels.email && channels.sms && " via text message"}
          </p>
        </DialogHeader>

        <div className="space-y-8">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
            <Input
              placeholder="Type a name to search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-14 h-16 text-xl border-2 rounded-xl shadow-sm focus:shadow-md transition-shadow"
            />
          </div>

          {/* Tab Navigation */}
          <div className="flex gap-4">
            <Button
              variant={selectedTab === "groups" ? "default" : "outline"}
              onClick={() => setSelectedTab("groups")}
              className="h-16 text-xl font-bold px-8 border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <Users className="h-6 w-6 mr-3" />
              Church Groups
            </Button>
            <Button
              variant={selectedTab === "individuals" ? "default" : "outline"}
              onClick={() => setSelectedTab("individuals")}
              className="h-16 text-xl font-bold px-8 border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              <UserCheck className="h-6 w-6 mr-3" />
              Individual People
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[450px]">
            {/* Recipients List */}
            <div className="lg:col-span-2 overflow-y-auto">
              {selectedTab === "groups" ? (
                <div className="space-y-6">
                  {filteredGroups.map((group) => (
                    <Card
                      key={group.id}
                      className="border-2 hover:border-primary/60 hover:shadow-lg transition-all cursor-pointer rounded-xl"
                      onClick={() => handleGroupSelect(group)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          <div className={`h-16 w-16 bg-${group.color}-100 rounded-full flex items-center justify-center shadow-md`}>
                            <group.icon className={`h-8 w-8 text-${group.color}-600`} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold">{group.name}</h3>
                            <p className="text-lg text-muted-foreground font-medium mt-1">{group.description}</p>
                            <div className="flex gap-2 mt-2">
                              <Badge variant="secondary" className="text-base px-3 py-1">
                                {group.count} church members
                              </Badge>
                              {group.id === "all_members" && (
                                <Badge variant="outline" className="text-base px-3 py-1">
                                  Everyone
                                </Badge>
                              )}
                              {group.id === "active_members" && (
                                <Badge variant="outline" className="text-base px-3 py-1">
                                  Regular Attendees
                                </Badge>
                              )}
                              {group.id === "visitors" && (
                                <Badge variant="outline" className="text-base px-3 py-1">
                                  New Friends
                                </Badge>
                              )}
                            </div>
                          </div>
                          {selectedRecipients.find(r => r.id === group.id) ? (
                            <div className="flex items-center gap-2">
                              <Check className="h-8 w-8 text-green-600" />
                              <span className="text-lg font-bold text-green-600">Selected</span>
                            </div>
                          ) : (
                            <div className="h-8 w-8" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredMembers.map((member) => (
                    <Card
                      key={member.id}
                      className="border-2 hover:border-primary/60 hover:shadow-lg transition-all cursor-pointer rounded-xl"
                      onClick={() => handleMemberSelect(member)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center gap-6">
                          <Avatar className="h-16 w-16 shadow-md">
                            <AvatarImage src={member.avatar} alt={`${member.firstName} ${member.lastName}`} />
                            <AvatarFallback className="text-xl font-bold bg-blue-100 text-blue-700">
                              {member.firstName[0]}{member.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h3 className="text-2xl font-bold">
                              {member.firstName} {member.lastName}
                            </h3>
                            <div className="flex items-center gap-6 text-muted-foreground mt-2">
                              {channels.email && member.email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="h-5 w-5" />
                                  <span className="text-lg font-medium">{member.email}</span>
                                </div>
                              )}
                              {channels.sms && member.phone && (
                                <div className="flex items-center gap-2">
                                  <Phone className="h-5 w-5" />
                                  <span className="text-lg font-medium">{member.phone}</span>
                                </div>
                              )}
                            </div>
                            <Badge 
                              variant={
                                member.membershipStatus === "Pastor" || member.membershipStatus === "Elder" || member.membershipStatus === "Deacon" ? "default" :
                                member.membershipStatus === "Active" ? "secondary" : "outline"
                              }
                              className="mt-2 text-base px-3 py-1"
                            >
                              {member.membershipStatus === "Pastor" ? "Pastor" :
                               member.membershipStatus === "Elder" ? "Elder" :
                               member.membershipStatus === "Deacon" ? "Deacon" :
                               member.membershipStatus === "Active" ? "Active Member" :
                               "Visitor"}
                            </Badge>
                          </div>
                          {selectedRecipients.find(r => r.id === member.id) ? (
                            <div className="flex items-center gap-2">
                              <Check className="h-8 w-8 text-green-600" />
                              <span className="text-lg font-bold text-green-600">Selected</span>
                            </div>
                          ) : (
                            <div className="h-8 w-8" />
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Selected Recipients Sidebar */}
            <div className="border-2 rounded-xl p-6 bg-gray-50 shadow-sm">
              <h3 className="text-2xl font-bold mb-6">
                Your Recipients ({selectedRecipients.length})
              </h3>
              
              <div className="space-y-3 max-h-[320px] overflow-y-auto">
                {selectedRecipients.length === 0 ? (
                  <p className="text-xl text-muted-foreground text-center py-12 font-medium">
                    Nobody selected yet
                  </p>
                ) : (
                  selectedRecipients.map((recipient) => (
                    <div
                      key={recipient.id}
                      className="flex items-center justify-between p-4 bg-white rounded-xl border-2 shadow-sm"
                    >
                      <div>
                        <p className="font-bold text-lg">{recipient.name}</p>
                        {recipient.type === "group" && (
                          <Badge variant="outline" className="text-base mt-1">
                            Church Group
                          </Badge>
                        )}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeRecipient(recipient.id)}
                        className="h-10 w-10 p-0 hover:bg-red-100 rounded-lg"
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-between pt-6 border-t-2">
            <Button
              variant="outline"
              onClick={onClose}
              size="lg"
              className="h-16 px-10 text-xl font-bold border-2 rounded-xl shadow-sm hover:shadow-md transition-all"
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmSelection}
              disabled={selectedRecipients.length === 0}
              size="lg"
              className="h-16 px-10 text-xl font-bold rounded-xl shadow-lg hover:shadow-xl transition-all"
            >
              Confirm Selection ({selectedRecipients.length})
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}