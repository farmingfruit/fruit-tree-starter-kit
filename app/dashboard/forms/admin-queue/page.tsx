"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarInitials } from "@/components/ui/avatar";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Clock
} from "lucide-react";

interface ProfileMatch {
  id: string;
  confidence: number;
  submittedData: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  potentialMatches: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
    memberSince?: string;
    lastActivity?: string;
  }>;
  createdAt: string;
  formName: string;
}

const mockMatches: ProfileMatch[] = [
  {
    id: "1",
    confidence: 89,
    submittedData: {
      firstName: "John",
      lastName: "Smith",
      email: "johnsmith@email.com",
      phone: "(555) 123-4567"
    },
    potentialMatches: [
      {
        id: "p1",
        firstName: "John",
        lastName: "Smith",
        email: "j.smith@gmail.com",
        phone: "(555) 123-4567",
        memberSince: "2019-03-15",
        lastActivity: "2024-01-15"
      }
    ],
    createdAt: "2024-01-20T10:30:00Z",
    formName: "Easter Service Registration"
  },
  {
    id: "2", 
    confidence: 92,
    submittedData: {
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@work.com",
      phone: "(555) 987-6543"
    },
    potentialMatches: [
      {
        id: "p2",
        firstName: "Sarah",
        lastName: "Johnson", 
        email: "sarah@gmail.com",
        phone: "(555) 987-6543",
        memberSince: "2020-08-10",
        lastActivity: "2024-01-18"
      }
    ],
    createdAt: "2024-01-20T14:15:00Z",
    formName: "Volunteer Sign-up"
  }
];

export default function AdminQueuePage() {
  const [matches, setMatches] = useState<ProfileMatch[]>(mockMatches);

  const handleApprove = (matchId: string, potentialMatchId: string) => {
    console.log(`Approved merge: ${matchId} -> ${potentialMatchId}`);
    setMatches(matches.filter(m => m.id !== matchId));
  };

  const handleReject = (matchId: string) => {
    console.log(`Rejected match: ${matchId}`);
    setMatches(matches.filter(m => m.id !== matchId));
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return "bg-green-100 text-green-800";
    if (confidence >= 85) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Profile Review Queue</h1>
        <p className="text-muted-foreground">
          Review potential duplicate profiles detected by our progressive recognition system.
          Approve matches to merge profiles and eliminate duplicates.
        </p>
      </div>

      {matches.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">All Caught Up!</h3>
            <p className="text-muted-foreground">
              No profile matches need review at this time. Our AI is working behind the scenes 
              to maintain clean member data.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {matches.map((match) => (
            <Card key={match.id} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                    Potential Duplicate Profile
                    <Badge className={getConfidenceColor(match.confidence)}>
                      {match.confidence}% confidence
                    </Badge>
                  </CardTitle>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    {formatDate(match.createdAt)}
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  From: <span className="font-medium">{match.formName}</span>
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-8">
                  {/* New Submission */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      New Submission
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            {match.submittedData.firstName[0]}{match.submittedData.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">
                          {match.submittedData.firstName} {match.submittedData.lastName}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Mail className="h-4 w-4" />
                        {match.submittedData.email}
                      </div>
                      {match.submittedData.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {match.submittedData.phone}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Existing Profile */}
                  <div>
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Existing Member Profile
                    </h3>
                    {match.potentialMatches.map((potentialMatch) => (
                      <div key={potentialMatch.id} className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {potentialMatch.firstName[0]}{potentialMatch.lastName[0]}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">
                            {potentialMatch.firstName} {potentialMatch.lastName}
                          </span>
                          {potentialMatch.memberSince && (
                            <Badge variant="secondary" className="text-xs">
                              Member since {new Date(potentialMatch.memberSince).getFullYear()}
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-4 w-4" />
                          {potentialMatch.email}
                        </div>
                        {potentialMatch.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            {potentialMatch.phone}
                          </div>
                        )}
                        {potentialMatch.lastActivity && (
                          <div className="text-xs text-muted-foreground">
                            Last activity: {formatDate(potentialMatch.lastActivity)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleReject(match.id)}
                    className="flex items-center gap-2"
                  >
                    <XCircle className="h-4 w-4" />
                    Keep Separate
                  </Button>
                  <Button 
                    onClick={() => handleApprove(match.id, match.potentialMatches[0].id)}
                    className="flex items-center gap-2"
                  >
                    <CheckCircle className="h-4 w-4" />
                    Merge Profiles
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}