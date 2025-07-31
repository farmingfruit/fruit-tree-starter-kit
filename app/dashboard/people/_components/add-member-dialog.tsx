"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plus,
  Save,
  X,
  User,
  Users,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Heart,
  Briefcase
} from "lucide-react";

interface NewMember {
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone: string;
  workPhone: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  membershipStatus: string;
  membershipRole: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
  occupation: string;
  employer: string;
  familyId: string;
  notes: string;
}

interface AddMemberDialogProps {
  children: React.ReactNode;
  onMemberAdded?: (member: NewMember) => void;
}

const initialMemberData: NewMember = {
  firstName: "",
  lastName: "",
  email: "",
  mobilePhone: "",
  workPhone: "",
  dateOfBirth: "",
  gender: "",
  maritalStatus: "",
  membershipStatus: "Active",
  membershipRole: "Member",
  address: "",
  city: "",
  state: "",
  zipCode: "",
  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelationship: "",
  occupation: "",
  employer: "",
  familyId: "",
  notes: "",
};

// Mock family data for the family selector
const mockFamilies = [
  { id: "1", name: "Smith Family" },
  { id: "2", name: "Johnson Family" },
  { id: "3", name: "Davis Family" },
];

export default function AddMemberDialog({ children, onMemberAdded }: AddMemberDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTab, setCurrentTab] = useState("basic");
  const [newMember, setNewMember] = useState<NewMember>(initialMemberData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field: keyof NewMember, value: string) => {
    setNewMember(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    
    // Validate required fields
    if (!newMember.firstName || !newMember.lastName || !newMember.email) {
      alert("Please fill in all required fields (First Name, Last Name, Email)");
      setIsSubmitting(false);
      return;
    }

    try {
      // In real app, this would save to database
      console.log("Saving new member:", newMember);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onMemberAdded?.(newMember);
      setNewMember(initialMemberData);
      setCurrentTab("basic");
      setIsOpen(false);
    } catch (error) {
      console.error("Error saving member:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setNewMember(initialMemberData);
    setCurrentTab("basic");
    setIsOpen(false);
  };

  const requiredFields = ["firstName", "lastName", "email"];
  const isBasicInfoComplete = requiredFields.every(field => newMember[field as keyof NewMember]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <User className="h-5 w-5" />
            <span>Add New Member</span>
          </DialogTitle>
          <DialogDescription>
            Add a new member to your church directory. Fill in as much information as you have available.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={currentTab} onValueChange={setCurrentTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic" className="relative">
              Basic Info
              {!isBasicInfoComplete && (
                <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
              )}
            </TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
            <TabsTrigger value="church">Church Info</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <User className="h-4 w-4" />
                  <span>Basic Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">
                      First Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="firstName"
                      value={newMember.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      placeholder="Enter first name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">
                      Last Name <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      id="lastName"
                      value={newMember.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      placeholder="Enter last name"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="email">
                    Email Address <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="membershipStatus">Membership Status</Label>
                    <Select value={newMember.membershipStatus} onValueChange={(value) => updateField("membershipStatus", value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Visitor">Visitor</SelectItem>
                        <SelectItem value="Transferred">Transferred</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="membershipRole">Role</Label>
                    <Select value={newMember.membershipRole} onValueChange={(value) => updateField("membershipRole", value)}>
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
                  </div>
                </div>

                <div>
                  <Label htmlFor="family">Family</Label>
                  <Select value={newMember.familyId} onValueChange={(value) => updateField("familyId", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select existing family or leave blank to create new" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="new">Create New Family</SelectItem>
                      {mockFamilies.map((family) => (
                        <SelectItem key={family.id} value={family.id}>
                          {family.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contact" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Phone className="h-4 w-4" />
                    <span>Phone Numbers</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="mobilePhone">Mobile Phone</Label>
                    <Input
                      id="mobilePhone"
                      value={newMember.mobilePhone}
                      onChange={(e) => updateField("mobilePhone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="workPhone">Work Phone</Label>
                    <Input
                      id="workPhone"
                      value={newMember.workPhone}
                      onChange={(e) => updateField("workPhone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Address</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      value={newMember.address}
                      onChange={(e) => updateField("address", e.target.value)}
                      placeholder="123 Main St"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        value={newMember.city}
                        onChange={(e) => updateField("city", e.target.value)}
                        placeholder="Springfield"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        value={newMember.state}
                        onChange={(e) => updateField("state", e.target.value)}
                        placeholder="IL"
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      value={newMember.zipCode}
                      onChange={(e) => updateField("zipCode", e.target.value)}
                      placeholder="62701"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Emergency Contact</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName">Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={newMember.emergencyContactName}
                      onChange={(e) => updateField("emergencyContactName", e.target.value)}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactPhone">Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={newMember.emergencyContactPhone}
                      onChange={(e) => updateField("emergencyContactPhone", e.target.value)}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="emergencyContactRelationship">Relationship</Label>
                  <Input
                    id="emergencyContactRelationship"
                    value={newMember.emergencyContactRelationship}
                    onChange={(e) => updateField("emergencyContactRelationship", e.target.value)}
                    placeholder="e.g., Spouse, Parent, Sibling"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="personal" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Personal Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={newMember.dateOfBirth}
                      onChange={(e) => updateField("dateOfBirth", e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select value={newMember.gender} onValueChange={(value) => updateField("gender", value)}>
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
                  </div>
                  <div>
                    <Label htmlFor="maritalStatus">Marital Status</Label>
                    <Select value={newMember.maritalStatus} onValueChange={(value) => updateField("maritalStatus", value)}>
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
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center space-x-2">
                    <Briefcase className="h-4 w-4" />
                    <span>Employment</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="occupation">Occupation</Label>
                    <Input
                      id="occupation"
                      value={newMember.occupation}
                      onChange={(e) => updateField("occupation", e.target.value)}
                      placeholder="Job title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="employer">Employer</Label>
                    <Input
                      id="employer"
                      value={newMember.employer}
                      onChange={(e) => updateField("employer", e.target.value)}
                      placeholder="Company name"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="church" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="notes">Internal Notes</Label>
                  <Textarea
                    id="notes"
                    value={newMember.notes}
                    onChange={(e) => updateField("notes", e.target.value)}
                    placeholder="Add any additional notes about this member..."
                    rows={6}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-8 pt-6 border-t">
          <Button variant="outline" onClick={handleCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          
          <div className="flex space-x-2">
            {currentTab !== "church" && (
              <Button 
                variant="outline" 
                onClick={() => {
                  const tabs = ["basic", "contact", "personal", "church"];
                  const currentIndex = tabs.indexOf(currentTab);
                  if (currentIndex < tabs.length - 1) {
                    setCurrentTab(tabs[currentIndex + 1]);
                  }
                }}
              >
                Next
              </Button>
            )}
            <Button 
              onClick={handleSubmit} 
              disabled={isSubmitting || !isBasicInfoComplete}
            >
              <Save className="mr-2 h-4 w-4" />
              {isSubmitting ? "Saving..." : "Save Member"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}