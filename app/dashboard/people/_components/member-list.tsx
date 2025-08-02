"use client";

import { useState, useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
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
  User,
  X
} from "lucide-react";
import MemberProfileDialog from "./member-profile-dialog";
import AddMemberDialog from "./add-member-dialog";
import { MemberWithFamily } from "@/lib/people-data";

// Mock data - in real app this would come from database
const mockMembers = [
  {
    id: "1",
    firstName: "Fred",
    lastName: "Flintstone",
    email: "fred.flintstone@bedrock.com",
    mobilePhone: "(555) 123-4567",
    workPhone: "(555) 123-4568",
    membershipStatus: "Active",
    membershipRole: "Member",
    familyName: "Flintstone Family",
    joinDate: new Date("2020-01-15"),
    photoUrl: null,
    dateOfBirth: new Date("1985-03-15"),
    gender: "Male",
    maritalStatus: "Married",
    address: "123 Cobblestone Way",
    city: "Bedrock",
    state: "CA",
    zipCode: "90210",
    emergencyContactName: "Wilma Flintstone",
    emergencyContactPhone: "(555) 123-4569",
    occupation: "Quarry Worker",
    employer: "Slate Rock & Gravel Co",
    notes: "Active in men's ministry. Enjoys bowling.",
  },
  {
    id: "2",
    firstName: "Pebbles",
    lastName: "Flintstone",
    email: "pebbles.flintstone@bedrock.com",
    mobilePhone: "(555) 987-6543",
    membershipStatus: "Active",
    membershipRole: "Member",
    familyName: "Flintstone Family",
    joinDate: new Date("2018-06-20"),
    photoUrl: null,
    dateOfBirth: new Date("2010-09-22"),
    gender: "Female",
    maritalStatus: "Single",
    address: "123 Cobblestone Way",
    city: "Bedrock",
    state: "CA",
    zipCode: "90210",
    emergencyContactName: "Fred Flintstone",
    emergencyContactPhone: "(555) 987-6544",
    occupation: "Student",
    employer: "Bedrock Elementary",
    notes: "Youth group participant. Loves dinosaur facts.",
  },
  {
    id: "3",
    firstName: "Barney",
    lastName: "Rubble",
    email: "barney.rubble@bedrock.com",
    mobilePhone: "(555) 456-7890",
    membershipStatus: "Active",
    membershipRole: "Deacon",
    familyName: "Rubble Family",
    joinDate: new Date("2019-01-10"),
    photoUrl: null,
    dateOfBirth: new Date("1987-12-05"),
    gender: "Male",
    maritalStatus: "Married",
    address: "124 Cobblestone Way",
    city: "Bedrock",
    state: "CA",
    zipCode: "90210",
    occupation: "Construction Worker",
    employer: "Slate Rock & Gravel Co",
    notes: "Fred's best friend and neighbor. Helps with church maintenance.",
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
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [highlightId, setHighlightId] = useState<string | null>(null);
  
  const searchParams = useSearchParams();
  
  // Handle URL highlighting from search navigation
  useEffect(() => {
    const highlight = searchParams.get('highlight');
    if (highlight) {
      setHighlightId(highlight);
      // Clear highlight after 3 seconds
      const timer = setTimeout(() => setHighlightId(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  // Real-time filtering with search, status, and role filters
  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      // Status and role filters
      const matchesStatus = statusFilter === "all" || member.membershipStatus === statusFilter;
      const matchesRole = roleFilter === "all" || member.membershipRole === roleFilter;
      
      // Search filter - robust handling with trimming and full name support
      let matchesSearch = true;
      if (searchQuery.trim() !== "") {
        const trimmedQuery = searchQuery.trim().toLowerCase();
        const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
        
        matchesSearch = 
          member.firstName.toLowerCase().includes(trimmedQuery) ||
          member.lastName.toLowerCase().includes(trimmedQuery) ||
          fullName.includes(trimmedQuery) ||
          member.email?.toLowerCase().includes(trimmedQuery) ||
          member.mobilePhone?.toLowerCase().includes(trimmedQuery) ||
          member.workPhone?.toLowerCase().includes(trimmedQuery) ||
          member.familyName?.toLowerCase().includes(trimmedQuery);
      }
      
      return matchesStatus && matchesRole && matchesSearch;
    });
  }, [members, statusFilter, roleFilter, searchQuery]);

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  if (members.length === 0) {
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
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search members by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 pl-12 pr-12 text-lg border-2 focus:border-primary"
              style={{ fontSize: '18px' }} // Elderly-friendly font size
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
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
          {filteredMembers.length} member{filteredMembers.length !== 1 ? 's' : ''} {(searchQuery || statusFilter !== "all" || roleFilter !== "all") ? 'found' : 'total'}
          {searchQuery && (
            <span className="ml-1 text-primary font-medium">
              for "{searchQuery}"
            </span>
          )}
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
          <Users className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">
            {searchQuery ? 'No members found' : 'No members match your filters'}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchQuery 
              ? `No members found matching "${searchQuery}". Try a different search term or clear the search.`
              : "Try adjusting the status or role filters above."
            }
          </p>
          <div className="flex gap-2 justify-center">
            {searchQuery && (
              <Button 
                variant="outline" 
                onClick={() => setSearchQuery("")}
              >
                Clear Search
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={() => {setStatusFilter("all"); setRoleFilter("all"); setSearchQuery("");}}
            >
              Clear All Filters
            </Button>
          </div>
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
                  <TableRow className={`cursor-pointer hover:bg-muted/50 transition-colors ${
                    highlightId === member.id 
                      ? "bg-primary/10 border-l-4 border-l-primary animate-pulse" 
                      : ""
                  }`}>
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