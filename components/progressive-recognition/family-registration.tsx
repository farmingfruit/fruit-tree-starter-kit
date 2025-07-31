/**
 * Family Registration Component
 * 
 * This component handles the intelligent detection and registration of family
 * members when progressive recognition identifies someone who belongs to a
 * household already in the church database. It provides a seamless way to
 * register multiple family members for events.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  Users, 
  User, 
  Plus, 
  Calendar, 
  Mail, 
  Phone,
  Edit,
  Check,
  X
} from "lucide-react";
import { FamilyMember } from "@/lib/progressive-recognition";

interface FamilyRegistrationProps {
  familyMembers: FamilyMember[];
  onSelectionChange: (selectedMembers: SelectedFamilyMember[]) => void;
  eventContext?: {
    name: string;
    requiresAge?: boolean;
    minAge?: number;
    maxAge?: number;
  };
  className?: string;
}

interface SelectedFamilyMember {
  profileId: string;
  memberId?: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  dateOfBirth?: Date;
  relationship?: string;
  isSelected: boolean;
  customFields?: Record<string, any>;
}

export function FamilyRegistration({
  familyMembers,
  onSelectionChange,
  eventContext,
  className = ""
}: FamilyRegistrationProps) {
  const [selectedMembers, setSelectedMembers] = useState<SelectedFamilyMember[]>([]);
  const [isEditingMember, setIsEditingMember] = useState<string | null>(null);

  /**
   * Initialize selected members from family members
   */
  useEffect(() => {
    const initialSelection: SelectedFamilyMember[] = familyMembers.map(member => ({
      profileId: member.profileId,
      memberId: member.memberId,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      dateOfBirth: member.dateOfBirth,
      relationship: member.relationship,
      isSelected: false, // Start with none selected
      customFields: {}
    }));

    setSelectedMembers(initialSelection);
  }, [familyMembers]);

  /**
   * Handle member selection change
   */
  const handleMemberSelection = (profileId: string, isSelected: boolean) => {
    const updatedMembers = selectedMembers.map(member =>
      member.profileId === profileId
        ? { ...member, isSelected }
        : member
    );

    setSelectedMembers(updatedMembers);
    onSelectionChange(updatedMembers.filter(m => m.isSelected));
  };

  /**
   * Handle editing member details
   */
  const handleMemberEdit = (profileId: string, updates: Partial<SelectedFamilyMember>) => {
    const updatedMembers = selectedMembers.map(member =>
      member.profileId === profileId
        ? { ...member, ...updates }
        : member
    );

    setSelectedMembers(updatedMembers);
    onSelectionChange(updatedMembers.filter(m => m.isSelected));
    setIsEditingMember(null);
  };

  /**
   * Check if member is eligible for the event based on age restrictions
   */
  const isEligibleForEvent = (member: SelectedFamilyMember): boolean => {
    if (!eventContext?.requiresAge || !member.dateOfBirth) {
      return true;
    }

    const age = new Date().getFullYear() - new Date(member.dateOfBirth).getFullYear();
    
    if (eventContext.minAge && age < eventContext.minAge) {
      return false;
    }
    
    if (eventContext.maxAge && age > eventContext.maxAge) {
      return false;
    }

    return true;
  };

  /**
   * Get relationship badge color
   */
  const getRelationshipColor = (relationship?: string) => {
    switch (relationship?.toLowerCase()) {
      case 'spouse':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'child':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'parent':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  /**
   * Calculate age from date of birth
   */
  const calculateAge = (dateOfBirth?: Date): number | null => {
    if (!dateOfBirth) return null;
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  /**
   * Render member card
   */
  const renderMemberCard = (member: SelectedFamilyMember) => {
    const isEligible = isEligibleForEvent(member);
    const age = calculateAge(member.dateOfBirth);

    return (
      <Card key={member.profileId} className={`${!isEligible ? 'opacity-60' : ''}`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Selection checkbox */}
            <Checkbox
              checked={member.isSelected}
              onCheckedChange={(checked) => 
                handleMemberSelection(member.profileId, checked as boolean)
              }
              disabled={!isEligible}
              className="mt-1"
            />

            {/* Member info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h4 className="font-medium text-sm">
                  {member.firstName} {member.lastName}
                </h4>
                
                {member.relationship && (
                  <Badge variant="outline" className={`text-xs ${getRelationshipColor(member.relationship)}`}>
                    {member.relationship}
                  </Badge>
                )}

                {age !== null && (
                  <Badge variant="outline" className="text-xs">
                    {age} years old
                  </Badge>
                )}
              </div>

              {/* Contact details */}
              <div className="space-y-1 text-xs text-gray-600">
                {member.email && (
                  <div className="flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    <span>{member.email}</span>
                  </div>
                )}
                
                {member.phone && (
                  <div className="flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    <span>{member.phone}</span>
                  </div>
                )}

                {member.dateOfBirth && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(member.dateOfBirth).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              {/* Eligibility warning */}
              {!isEligible && eventContext && (
                <div className="mt-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded p-2">
                  Not eligible for this event
                  {eventContext.minAge && age !== null && age < eventContext.minAge && 
                    ` (minimum age: ${eventContext.minAge})`
                  }
                  {eventContext.maxAge && age !== null && age > eventContext.maxAge && 
                    ` (maximum age: ${eventContext.maxAge})`
                  }
                </div>
              )}
            </div>

            {/* Edit button */}
            <Dialog>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsEditingMember(member.profileId)}
                >
                  <Edit className="h-3 w-3" />
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Edit Family Member</DialogTitle>
                  <DialogDescription>
                    Update information for {member.firstName} {member.lastName}
                  </DialogDescription>
                </DialogHeader>
                
                <MemberEditForm
                  member={member}
                  onSave={(updates) => handleMemberEdit(member.profileId, updates)}
                  onCancel={() => setIsEditingMember(null)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (familyMembers.length === 0) {
    return null;
  }

  const selectedCount = selectedMembers.filter(m => m.isSelected).length;

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <Users className="h-4 w-4 text-blue-600" />
              Family Members Found
            </CardTitle>
            <CardDescription>
              We found {familyMembers.length} other family member{familyMembers.length > 1 ? 's' : ''} in your household. 
              Would you like to register them too?
            </CardDescription>
          </div>
          
          {selectedCount > 0 && (
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedCount} selected
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {selectedMembers.map(renderMemberCard)}

        {/* Quick select buttons */}
        {familyMembers.length > 1 && (
          <div className="flex gap-2 pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const allSelected = selectedMembers.map(member => ({
                  ...member,
                  isSelected: isEligibleForEvent(member)
                }));
                setSelectedMembers(allSelected);
                onSelectionChange(allSelected.filter(m => m.isSelected));
              }}
            >
              <Check className="h-3 w-3 mr-1" />
              Select All Eligible
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const noneSelected = selectedMembers.map(member => ({
                  ...member,
                  isSelected: false
                }));
                setSelectedMembers(noneSelected);
                onSelectionChange([]);
              }}
            >
              <X className="h-3 w-3 mr-1" />
              Select None
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Member edit form component
 */
interface MemberEditFormProps {
  member: SelectedFamilyMember;
  onSave: (updates: Partial<SelectedFamilyMember>) => void;
  onCancel: () => void;
}

function MemberEditForm({ member, onSave, onCancel }: MemberEditFormProps) {
  const [formData, setFormData] = useState({
    firstName: member.firstName,
    lastName: member.lastName,
    email: member.email || '',
    phone: member.phone || '',
    dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
    relationship: member.relationship || ''
  });

  const handleSave = () => {
    onSave({
      firstName: formData.firstName,
      lastName: formData.lastName,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
      relationship: formData.relationship || undefined
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="relationship">Relationship</Label>
        <Input
          id="relationship"
          value={formData.relationship}
          onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
          placeholder="e.g., spouse, child, parent"
        />
      </div>

      <div className="flex gap-2 pt-4 border-t">
        <Button onClick={handleSave}>
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}