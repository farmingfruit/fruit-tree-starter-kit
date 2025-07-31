"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  MoreHorizontal, 
  Users, 
  Plus,
  Phone,
  Mail,
  User
} from "lucide-react";
import MemberProfileDialog from "./member-profile-dialog";
import AddMemberDialog from "./add-member-dialog";
import { MemberWithFamily } from "@/lib/people-data";

// Mock data - in real app this would come from database
const mockMembers = [
  {
    id: "1",
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@email.com",
    mobilePhone: "(555) 123-4567",
    workPhone: "(555) 123-4568",
    membershipStatus: "Active",
    membershipRole: "Member",
    familyName: "Smith Family",
    joinDate: new Date("2020-01-15"),
    photoUrl: null,
    dateOfBirth: new Date("1985-03-15"),
    gender: "Male",
    maritalStatus: "Married",
    address: "123 Main St",
    city: "Springfield",
    state: "IL",
    zipCode: "62701",
    emergencyContactName: "Jane Smith",
    emergencyContactPhone: "(555) 123-4569",
    occupation: "Software Engineer",
    employer: "Tech Corp",
    notes: "Active in youth ministry. Plays guitar in worship team.",
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Johnson",
    email: "sarah.johnson@email.com",
    mobilePhone: "(555) 987-6543",
    membershipStatus: "Active",
    membershipRole: "Elder",
    familyName: "Johnson Family",
    joinDate: new Date("2018-06-20"),
    photoUrl: null,
    dateOfBirth: new Date("1978-09-22"),
    gender: "Female",
    maritalStatus: "Single",
    address: "456 Oak Ave",
    city: "Springfield",
    state: "IL",
    zipCode: "62702",
    emergencyContactName: "Robert Johnson",
    emergencyContactPhone: "(555) 987-6544",
    occupation: "Teacher",
    employer: "Springfield Elementary",
    notes: "Leads women's Bible study group. Excellent with children's ministry.",
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Davis",
    email: "mike.davis@email.com",
    mobilePhone: "(555) 456-7890",
    membershipStatus: "Visitor",
    membershipRole: "Visitor",
    familyName: "Davis Family",
    joinDate: new Date("2024-01-10"),
    photoUrl: null,
    dateOfBirth: new Date("1992-12-05"),
    gender: "Male",
    maritalStatus: "Single",
    address: "789 Pine St",
    city: "Springfield",
    state: "IL",
    zipCode: "62703",
    occupation: "Marketing Manager",
    employer: "Local Business",
    notes: "Recently started attending. Interested in joining small group.",
  },
];

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

interface MemberListProps {
  initialMembers: MemberWithFamily[];
}

export default function MemberList({ initialMembers }: MemberListProps) {
  const [members] = useState(initialMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const filteredMembers = members.filter((member) => {
    const matchesSearch = 
      member.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (member.mobilePhone && member.mobilePhone.includes(searchTerm));

    const matchesStatus = statusFilter === "all" || member.membershipStatus === statusFilter;
    const matchesRole = roleFilter === "all" || member.membershipRole === roleFilter;

    return matchesSearch && matchesStatus && matchesRole;
  });

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  if (filteredMembers.length === 0 && searchTerm === "" && statusFilter === "all" && roleFilter === "all") {
    return (
      <div className="border rounded-lg p-12 text-center">
        <Users className="mx-auto h-16 w-16 mb-4 text-muted-foreground/50" />
        <h3 className="text-xl font-semibold mb-2">No members yet</h3>
        <p className="text-muted-foreground mb-6">
          Get started by adding your first church member.
        </p>
        <AddMemberDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add First Member
          </Button>
        </AddMemberDialog>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search members by name, email, or phone..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Visitor">Visitor</SelectItem>
            <SelectItem value="Transferred">Transferred</SelectItem>
            <SelectItem value="Deceased">Deceased</SelectItem>
          </SelectContent>
        </Select>

        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="Member">Member</SelectItem>
            <SelectItem value="Visitor">Visitor</SelectItem>
            <SelectItem value="Staff">Staff</SelectItem>
            <SelectItem value="Elder">Elder</SelectItem>
            <SelectItem value="Deacon">Deacon</SelectItem>
            <SelectItem value="Pastor">Pastor</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} found
        </p>
        <AddMemberDialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Member
          </Button>
        </AddMemberDialog>
      </div>

      {/* Members Table */}
      {filteredMembers.length === 0 ? (
        <div className="border rounded-lg p-8 text-center">
          <Search className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No members found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search terms or filters.
          </p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Family</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Join Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.map((member) => (
                <MemberProfileDialog key={member.id} member={member}>
                  <TableRow className="cursor-pointer hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.photoUrl || undefined} />
                          <AvatarFallback className="bg-primary/10">
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">
                            {member.firstName} {member.lastName}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center text-sm">
                          <Mail className="mr-2 h-3 w-3 text-muted-foreground" />
                          {member.email}
                        </div>
                        {member.mobilePhone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-2 h-3 w-3" />
                            {member.mobilePhone}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="mr-2 h-3 w-3 text-muted-foreground" />
                        {member.familyName}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="secondary" 
                        className={statusColors[member.membershipStatus as keyof typeof statusColors]}
                      >
                        {member.membershipStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline"
                        className={roleColors[member.membershipRole as keyof typeof roleColors]}
                      >
                        {member.membershipRole}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {member.joinDate ? member.joinDate.toLocaleDateString() : "Not set"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit Member</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem>Send Email</DropdownMenuItem>
                          <DropdownMenuItem>Add Note</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">
                            Remove Member
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                </MemberProfileDialog>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}