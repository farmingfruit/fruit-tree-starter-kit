"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Edit,
  Save,
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Heart,
  Briefcase,
  FileText
} from "lucide-react";
import FamilyRelationships from "./family-relationships";
import CustomFields from "./custom-fields";
import { MemberWithFamily } from "@/lib/people-data";

interface MemberProfileDialogProps {
  member: MemberWithFamily;
  children: React.ReactNode;
}

export default function MemberProfileDialog({ member, children }: MemberProfileDialogProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedMember, setEditedMember] = useState(member);
  
  // Parse custom fields from JSON string
  const parseCustomFields = (customFieldsJson: string | null | undefined): any[] => {
    // Handle all possible falsy values
    if (!customFieldsJson || customFieldsJson === 'null' || customFieldsJson === 'undefined') {
      return [];
    }
    
    try {
      const parsed = JSON.parse(customFieldsJson);
      
      // More comprehensive check for valid object
      if (parsed === null || 
          parsed === undefined || 
          typeof parsed !== 'object' || 
          Array.isArray(parsed) ||
          parsed.constructor !== Object) {
        return [];
      }

      // Additional safety check before Object.entries
      const entries = Object.entries(parsed);
      if (!Array.isArray(entries)) {
        return [];
      }

      return entries.map(([key, value]) => ({
        id: key,
        label: key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()),
        type: typeof value === 'boolean' ? 'boolean' : typeof value === 'number' ? 'number' : 'text',
        value: value
      }));
    } catch (error) {
      console.error('Error parsing custom fields:', error);
      return [];
    }
  };
  
  const [customFields, setCustomFields] = useState(parseCustomFields(member.customFields));

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const handleSave = () => {
    // In real app, this would save to database
    console.log("Saving member:", editedMember);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedMember(member);
    setIsEditing(false);
  };

  const statusColors = {
    Active: "bg-green-100 text-green-800",
    Inactive: "bg-gray-100 text-gray-800",
    Visitor: "bg-blue-100 text-blue-800",
    Transferred: "bg-yellow-100 text-yellow-800",
    Deceased: "bg-red-100 text-red-800",
  };

  const roleColors = {
    Member: "bg-blue-100 text-blue-800",
    Visitor: "bg-purple-100 text-purple-800",
    Staff: "bg-orange-100 text-orange-800",
    Elder: "bg-green-100 text-green-800",
    Deacon: "bg-indigo-100 text-indigo-800",
    Pastor: "bg-red-100 text-red-800",
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={member.photoUrl || undefined} />
                <AvatarFallback className="bg-primary/10 text-lg">
                  {getInitials(member.firstName, member.lastName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-2xl">
                  {member.firstName} {member.lastName}
                </DialogTitle>
                <DialogDescription className="text-base">
                  {member.familyName} • Member since {member.joinDate ? member.joinDate.getFullYear() : 'Unknown'}
                </DialogDescription>
                <div className="flex space-x-2 mt-2">
                  <Badge 
                    variant="secondary" 
                    className={statusColors[member.membershipStatus as keyof typeof statusColors]}
                  >
                    {member.membershipStatus}
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={roleColors[member.membershipRole as keyof typeof roleColors]}
                  >
                    {member.membershipRole}
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex space-x-2">
              {isEditing ? (
                <>
                  <Button onClick={handleSave}>
                    <Save className="mr-2 h-4 w-4" />
                    Save
                  </Button>
                  <Button variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={() => setIsEditing(true)}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              )}
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="personal" className="mt-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="church">Church Info</TabsTrigger>
            <TabsTrigger value="family">Family</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name</Label>
                    {isEditing ? (
                      <Input
                        id="firstName"
                        value={editedMember.firstName}
                        onChange={(e) => setEditedMember({...editedMember, firstName: e.target.value})}
                      />
                    ) : (
                      <div className="py-2 text-sm">{member.firstName}</div>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name</Label>
                    {isEditing ? (
                      <Input
                        id="lastName"
                        value={editedMember.lastName}
                        onChange={(e) => setEditedMember({...editedMember, lastName: e.target.value})}
                      />
                    ) : (
                      <div className="py-2 text-sm">{member.lastName}</div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Date of Birth</Label>
                  <div className="flex items-center space-x-2 py-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {member.dateOfBirth ? member.dateOfBirth.toLocaleDateString() : "Not provided"}
                    </span>
                  </div>
                </div>

                <div>
                  <Label>Gender</Label>
                  {isEditing ? (
                    <Select value={editedMember.gender || ""} onValueChange={(value) => setEditedMember({...editedMember, gender: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                        <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="py-2 text-sm">{member.gender || "Not provided"}</div>
                  )}
                </div>

                <div>
                  <Label>Marital Status</Label>
                  {isEditing ? (
                    <Select value={editedMember.maritalStatus || ""} onValueChange={(value) => setEditedMember({...editedMember, maritalStatus: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select marital status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Divorced">Divorced</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex items-center space-x-2 py-2">
                      <Heart className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{member.maritalStatus || "Not provided"}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Occupation</Label>
                  {isEditing ? (
                    <Input
                      value={editedMember.occupation || ""}
                      onChange={(e) => setEditedMember({...editedMember, occupation: e.target.value})}
                    />
                  ) : (
                    <div className="flex items-center space-x-2 py-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{member.occupation || "Not provided"}</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Employer</Label>
                  {isEditing ? (
                    <Input
                      value={editedMember.employer || ""}
                      onChange={(e) => setEditedMember({...editedMember, employer: e.target.value})}
                    />
                  ) : (
                    <div className="py-2 text-sm">{member.employer || "Not provided"}</div>
                  )}
                </div>

                <div>
                  <Label>Emergency Contact</Label>
                  <div className="space-y-2 py-2">
                    <div className="text-sm">
                      <strong>Name:</strong> {member.emergencyContactName || "Not provided"}
                    </div>
                    <div className="text-sm">
                      <strong>Phone:</strong> {member.emergencyContactPhone || "Not provided"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Email</Label>
                  <div className="flex items-center space-x-2 py-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.email}</span>
                  </div>
                </div>

                <div>
                  <Label>Mobile Phone</Label>
                  <div className="flex items-center space-x-2 py-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.mobilePhone || "Not provided"}</span>
                  </div>
                </div>

                <div>
                  <Label>Work Phone</Label>
                  <div className="flex items-center space-x-2 py-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.workPhone || "Not provided"}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Address</Label>
                  <div className="flex items-start space-x-2 py-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                    <div className="text-sm">
                      {member.address && (
                        <>
                          {member.address}<br />
                          {member.city}, {member.state} {member.zipCode}
                        </>
                      )}
                      {!member.address && "Not provided"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="church" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label>Family</Label>
                  <div className="flex items-center space-x-2 py-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.familyName}</span>
                  </div>
                </div>

                <div>
                  <Label>Membership Status</Label>
                  {isEditing ? (
                    <Select value={editedMember.membershipStatus} onValueChange={(value) => setEditedMember({...editedMember, membershipStatus: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Visitor">Visitor</SelectItem>
                        <SelectItem value="Transferred">Transferred</SelectItem>
                        <SelectItem value="Deceased">Deceased</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="py-2">
                      <Badge 
                        variant="secondary" 
                        className={statusColors[member.membershipStatus as keyof typeof statusColors]}
                      >
                        {member.membershipStatus}
                      </Badge>
                    </div>
                  )}
                </div>

                <div>
                  <Label>Role</Label>
                  {isEditing ? (
                    <Select value={editedMember.membershipRole} onValueChange={(value) => setEditedMember({...editedMember, membershipRole: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Member">Member</SelectItem>
                        <SelectItem value="Visitor">Visitor</SelectItem>
                        <SelectItem value="Staff">Staff</SelectItem>
                        <SelectItem value="Elder">Elder</SelectItem>
                        <SelectItem value="Deacon">Deacon</SelectItem>
                        <SelectItem value="Pastor">Pastor</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="py-2">
                      <Badge 
                        variant="outline"
                        className={roleColors[member.membershipRole as keyof typeof roleColors]}
                      >
                        {member.membershipRole}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <Label>Join Date</Label>
                  <div className="flex items-center space-x-2 py-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{member.joinDate ? member.joinDate.toLocaleDateString() : "Not set"}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="family" className="space-y-6">
            <FamilyRelationships 
              familyName={member.familyName} 
              currentMemberId={member.id}
            />
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <CustomFields 
              fields={customFields}
              isEditing={isEditing}
              onFieldsChange={setCustomFields}
            />
          </TabsContent>

          <TabsContent value="notes" className="space-y-6">
            <div>
              <Label htmlFor="notes">Internal Notes</Label>
              {isEditing ? (
                <Textarea
                  id="notes"
                  placeholder="Add notes about this member..."
                  value={editedMember.notes || ""}
                  onChange={(e) => setEditedMember({...editedMember, notes: e.target.value})}
                  className="min-h-[200px]"
                />
              ) : (
                <div className="border rounded-md p-4 min-h-[200px] bg-muted/10">
                  {member.notes ? (
                    <div className="whitespace-pre-wrap text-sm">{member.notes}</div>
                  ) : (
                    <div className="flex items-center justify-center h-32 text-muted-foreground">
                      <div className="text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No notes added yet</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}