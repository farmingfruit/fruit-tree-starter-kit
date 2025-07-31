import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, MapPin } from "lucide-react";
import { getAllFamilies } from "@/lib/people-data";

// Mock family data
const mockFamilies = [
  {
    id: "1",
    familyName: "Smith Family",
    address: "123 Main St, Springfield, IL 62701",
    memberCount: 4,
    members: [
      { id: "1", firstName: "John", lastName: "Smith", relationship: "Head of Household", status: "Active" },
      { id: "4", firstName: "Mary", lastName: "Smith", relationship: "Spouse", status: "Active" },
      { id: "5", firstName: "Emma", lastName: "Smith", relationship: "Child", status: "Active" },
      { id: "6", firstName: "Noah", lastName: "Smith", relationship: "Child", status: "Active" },
    ]
  },
  {
    id: "2",
    familyName: "Johnson Family",
    address: "456 Oak Ave, Springfield, IL 62702",
    memberCount: 1,
    members: [
      { id: "2", firstName: "Sarah", lastName: "Johnson", relationship: "Head of Household", status: "Active" },
    ]
  },
  {
    id: "3",
    familyName: "Davis Family",
    address: "789 Pine St, Springfield, IL 62703",
    memberCount: 2,
    members: [
      { id: "3", firstName: "Mike", lastName: "Davis", relationship: "Head of Household", status: "Visitor" },
      { id: "7", firstName: "Lisa", lastName: "Davis", relationship: "Spouse", status: "Visitor" },
    ]
  },
];

const statusColors = {
  Active: "bg-green-100 text-green-800",
  Inactive: "bg-gray-100 text-gray-800",
  Visitor: "bg-blue-100 text-blue-800",
  Transferred: "bg-yellow-100 text-yellow-800",
  Deceased: "bg-red-100 text-red-800",
};

export default async function FamiliesPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }

  // Fetch families data from database
  const familiesData = await getAllFamilies();

  const getInitials = (firstName: string, lastName: string) => {
    return (firstName.charAt(0) + lastName.charAt(0)).toUpperCase();
  };

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Families
              </h1>
              <p className="text-muted-foreground">
                View and manage family groups within your church.
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Family
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-muted-foreground" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Families</p>
                  <p className="text-2xl font-bold">{familiesData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-muted-foreground" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Total Members</p>
                  <p className="text-2xl font-bold">
                    {familiesData.reduce((total, family) => total + family.memberCount, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-muted-foreground" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-muted-foreground">Average Family Size</p>
                  <p className="text-2xl font-bold">
                    {familiesData.length > 0 ? (familiesData.reduce((total, family) => total + family.memberCount, 0) / familiesData.length).toFixed(1) : "0"}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Families Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {familiesData.map((family) => (
            <Card key={family.id} className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{family.familyName}</CardTitle>
                  <Badge variant="outline">
                    {family.memberCount} member{family.memberCount !== 1 ? 's' : ''}
                  </Badge>
                </div>
                {family.address && (
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="mr-2 h-4 w-4" />
                    {family.address}
                    {family.city && family.state && `, ${family.city}, ${family.state}`}
                    {family.zipCode && ` ${family.zipCode}`}
                  </div>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {family.members.map((member) => (
                    <div key={member.id} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-xs">
                            {getInitials(member.firstName, member.lastName)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {member.firstName} {member.lastName}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {member.isHeadOfHousehold ? "Head of Household" : member.membershipRole}
                          </div>
                        </div>
                      </div>
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${statusColors[member.membershipStatus as keyof typeof statusColors]}`}
                      >
                        {member.membershipStatus}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {familiesData.length === 0 && (
          <div className="border rounded-lg p-12 text-center">
            <Users className="mx-auto h-16 w-16 mb-4 text-muted-foreground/50" />
            <h3 className="text-xl font-semibold mb-2">No families yet</h3>
            <p className="text-muted-foreground mb-6">
              Get started by creating your first family group.
            </p>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create First Family
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}