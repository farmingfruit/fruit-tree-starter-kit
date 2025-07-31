"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  Clock,
  Check,
  X,
  Eye,
  Mail,
  Phone,
  User,
  Calendar,
  AlertCircle
} from "lucide-react";
import { MemberWithFamily } from "@/lib/people-data";

interface PendingMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  mobilePhone?: string;
  submittedDate: Date;
  requestType: "new_member" | "member_update" | "family_addition";
  status: "pending" | "approved" | "rejected";
  notes?: string;
  submittedBy?: string;
  reviewedBy?: string;
  reviewedDate?: Date;
}

const mockPendingMembers: PendingMember[] = [
  {
    id: "pending_1",
    firstName: "Jennifer",
    lastName: "Wilson",
    email: "jennifer.wilson@email.com",
    mobilePhone: "(555) 234-5678",
    submittedDate: new Date("2024-01-20"),
    requestType: "new_member",
    status: "pending",
    notes: "Online registration form submission. Visited last three Sundays.",
    submittedBy: "Online Form",
  },
  {
    id: "pending_2",
    firstName: "Robert",
    lastName: "Martinez",
    email: "robert.martinez@email.com",
    mobilePhone: "(555) 345-6789",
    submittedDate: new Date("2024-01-18"),
    requestType: "new_member",
    status: "pending",
    notes: "Referred by John Smith. Completed newcomer's class.",
    submittedBy: "Staff Input",
  },
  {
    id: "pending_3",
    firstName: "Lisa",
    lastName: "Chen",
    email: "lisa.chen@email.com",
    submittedDate: new Date("2024-01-15"),
    requestType: "member_update",
    status: "approved",
    notes: "Address change request - moved to new apartment.",
    submittedBy: "Member Portal",
    reviewedBy: "Pastor Johnson",
    reviewedDate: new Date("2024-01-16"),
  },
];

const requestTypeLabels = {
  new_member: "New Member",
  member_update: "Member Update",
  family_addition: "Family Addition",
};

const requestTypeColors = {
  new_member: "bg-blue-100 text-blue-800",
  member_update: "bg-orange-100 text-orange-800",
  family_addition: "bg-green-100 text-green-800",
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

interface PendingReviewProps {
  initialPendingMembers: MemberWithFamily[];
}

export default function PendingReview({ initialPendingMembers }: PendingReviewProps) {
  const [pendingMembers] = useState(initialPendingMembers);
  const [selectedMember, setSelectedMember] = useState<MemberWithFamily | null>(null);

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  const handleApprove = (memberId: string) => {
    console.log("Approving member:", memberId);
    // In real app, this would update the database
  };

  const handleReject = (memberId: string) => {
    console.log("Rejecting member:", memberId);
    // In real app, this would update the database
  };

  const pendingCount = pendingMembers.filter(member => member.notes?.includes("PENDING REVIEW")).length;

  if (pendingMembers.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Clock className="mx-auto h-12 w-12 mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium mb-2">No pending reviews</h3>
          <p className="text-muted-foreground">
            All member applications and updates have been processed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Pending Reviews</h3>
          <p className="text-muted-foreground">
            Review and approve member applications and updates.
          </p>
        </div>
        {pendingCount > 0 && (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            <AlertCircle className="mr-1 h-3 w-3" />
            {pendingCount} pending
          </Badge>
        )}
      </div>

      {/* Pending Reviews Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center space-x-2">
            <Clock className="h-4 w-4" />
            <span>Review Queue</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Member</TableHead>
                <TableHead>Request Type</TableHead>
                <TableHead>Submitted</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pendingMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell>
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-primary/10">
                          {getInitials(member.firstName, member.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">
                          {member.firstName} {member.lastName}
                        </div>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Mail className="mr-1 h-3 w-3" />
                          {member.email}
                        </div>
                        {member.mobilePhone && (
                          <div className="flex items-center text-sm text-muted-foreground">
                            <Phone className="mr-1 h-3 w-3" />
                            {member.mobilePhone}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="secondary"
                      className="bg-blue-100 text-blue-800"
                    >
                      New Member
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center text-sm">
                      <Calendar className="mr-2 h-3 w-3 text-muted-foreground" />
                      {member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Online Form
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline"
                      className="bg-yellow-100 text-yellow-800"
                    >
                      Pending
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" onClick={() => setSelectedMember(member)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Review Member Application</DialogTitle>
                            <DialogDescription>
                              Review the details for {member.firstName} {member.lastName}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Name</label>
                                <p className="text-sm">{member.firstName} {member.lastName}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Email</label>
                                <p className="text-sm">{member.email}</p>
                              </div>
                            </div>
                            {member.mobilePhone && (
                              <div>
                                <label className="text-sm font-medium">Phone</label>
                                <p className="text-sm">{member.mobilePhone}</p>
                              </div>
                            )}
                            <div>
                              <label className="text-sm font-medium">Request Type</label>
                              <p className="text-sm">New Member</p>
                            </div>
                            <div>
                              <label className="text-sm font-medium">Submitted Date</label>
                              <p className="text-sm">{member.createdAt ? new Date(member.createdAt).toLocaleDateString() : "Unknown"}</p>
                            </div>
                            {member.notes && (
                              <div>
                                <label className="text-sm font-medium">Notes</label>
                                <p className="text-sm text-muted-foreground">{member.notes}</p>
                              </div>
                            )}
                            {member.notes?.includes("PENDING REVIEW") && (
                              <div className="flex justify-end space-x-2 pt-4">
                                <Button variant="outline" onClick={() => handleReject(member.id)}>
                                  <X className="mr-2 h-4 w-4" />
                                  Reject
                                </Button>
                                <Button onClick={() => handleApprove(member.id)}>
                                  <Check className="mr-2 h-4 w-4" />
                                  Approve
                                </Button>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      {member.notes?.includes("PENDING REVIEW") && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleReject(member.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          <Button 
                            size="sm"
                            onClick={() => handleApprove(member.id)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}