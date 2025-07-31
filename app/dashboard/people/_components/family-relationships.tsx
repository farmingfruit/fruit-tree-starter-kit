"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Phone, Mail, Plus, UserPlus } from "lucide-react";

interface FamilyMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone?: string;
  membershipStatus: string;
  membershipRole: string;
  relationship?: string; // Head of Household, Spouse, Child, etc.
  age?: number;
  photoUrl?: string | null;
  isHeadOfHousehold?: boolean;
}

interface FamilyRelationshipsProps {
  familyName: string;
  members: FamilyMember[];
  currentMemberId?: string;
}

const mockFamilyMembers: FamilyMember[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    mobilePhone: "(555) 123-4567",
    membershipStatus: "Active",
    membershipRole: "Member",
    relationship: "Head of Household",
    age: 39,
    photoUrl: null,
    isHeadOfHousehold: true,
  },
  {
    id: "4",
    firstName: "Mary",
    lastName: "Smith",
    email: "mary.smith@email.com",
    mobilePhone: "(555) 123-4570",
    membershipStatus: "Active",
    membershipRole: "Member",
    relationship: "Spouse",
    age: 37,
    photoUrl: null,
    isHeadOfHousehold: false,
  },
  {
    id: "5",
    firstName: "Emma",
    lastName: "Smith",
    email: "",
    membershipStatus: "Active",
    membershipRole: "Member",
    relationship: "Child",
    age: 12,
    photoUrl: null,
    isHeadOfHousehold: false,
  },
  {
    id: "6",
    firstName: "Noah",
    lastName: "Smith",
    email: "",
    membershipStatus: "Active",
    membershipRole: "Member",
    relationship: "Child",
    age: 9,
    photoUrl: null,
    isHeadOfHousehold: false,
  },
];

const statusColors = {
  Active: "bg-green-100 text-green-800",
  Inactive: "bg-gray-100 text-gray-800",
  Visitor: "bg-blue-100 text-blue-800",
  Transferred: "bg-yellow-100 text-yellow-800",
  Deceased: "bg-red-100 text-red-800",
};

const relationshipColors = {
  "Head of Household": "bg-blue-100 text-blue-800",
  "Spouse": "bg-purple-100 text-purple-800",
  "Child": "bg-green-100 text-green-800",
  "Parent": "bg-orange-100 text-orange-800",
  "Sibling": "bg-indigo-100 text-indigo-800",
  "Other": "bg-gray-100 text-gray-800",
};

export default function FamilyRelationships({ 
  familyName, 
  members = mockFamilyMembers, 
  currentMemberId 
}: FamilyRelationshipsProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  // Sort members: Head of Household first, then Spouse, then others by age (oldest first for adults, youngest first for children)
  const sortedMembers = [...members].sort((a, b) => {
    if (a.isHeadOfHousehold) return -1;
    if (b.isHeadOfHousehold) return 1;
    if (a.relationship === "Spouse") return -1;
    if (b.relationship === "Spouse") return 1;
    
    // For children, sort by age (youngest first)
    if (a.relationship === "Child" && b.relationship === "Child") {
      return (a.age || 0) - (b.age || 0);
    }
    
    // For adults, sort by age (oldest first)
    return (b.age || 0) - (a.age || 0);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-lg">{familyName}</CardTitle>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm">
              <UserPlus className="mr-2 h-4 w-4" />
              Add Family Member
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedMembers.map((member) => (
            <div
              key={member.id}
              className={`flex items-center justify-between p-4 rounded-lg border ${
                member.id === currentMemberId ? 'bg-primary/5 border-primary/20' : 'bg-muted/20'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={member.photoUrl || undefined} />
                  <AvatarFallback className="bg-primary/10">
                    {getInitials(member.firstName, member.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">
                      {member.firstName} {member.lastName}
                    </h4>
                    {member.id === currentMemberId && (
                      <Badge variant="outline" className="text-xs">
                        Current
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2 mt-1">
                    {member.relationship && (
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${relationshipColors[member.relationship as keyof typeof relationshipColors] || relationshipColors.Other}`}
                      >
                        {member.relationship}
                      </Badge>
                    )}
                    {member.age && (
                      <span className="text-sm text-muted-foreground">
                        Age {member.age}
                      </span>
                    )}
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${statusColors[member.membershipStatus as keyof typeof statusColors]}`}
                    >
                      {member.membershipStatus}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4 mt-2">
                    {member.email && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Mail className="mr-1 h-3 w-3" />
                        {member.email}
                      </div>
                    )}
                    {member.mobilePhone && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        <Phone className="mr-1 h-3 w-3" />
                        {member.mobilePhone}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {member.id !== currentMemberId && (
                <Button variant="ghost" size="sm">
                  View Profile
                </Button>
              )}
            </div>
          ))}
          
          {members.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <h3 className="text-lg font-medium mb-2">No family members</h3>
              <p className="mb-4">This person hasn't been assigned to a family yet.</p>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Family
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}