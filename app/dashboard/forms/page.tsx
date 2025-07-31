import { getSessionWithDevBypass, redirectToSignIn } from "@/lib/auth-wrapper";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FileText, Users, Calendar, UserCheck, Settings, Eye, Edit } from "lucide-react";
import Link from "next/link";

// Mock data for existing forms - in real app this would come from database
const mockForms = [
  {
    id: "1",
    name: "Sunday Service Visitor Card",
    type: "general" as const,
    description: "Simple contact form for first-time visitors",
    submissions: 23,
    status: "active" as const,
    createdAt: "2024-01-15",
    lastSubmission: "2 hours ago"
  },
  {
    id: "2", 
    name: "Easter Service Registration",
    type: "registration" as const,
    description: "Registration for Easter Sunday services with meal signup",
    submissions: 156,
    capacity: 200,
    status: "active" as const,
    createdAt: "2024-02-01",
    lastSubmission: "1 day ago"
  },
  {
    id: "3",
    name: "Volunteer Application", 
    type: "general" as const,
    description: "Application for church volunteers and ministry leaders",
    submissions: 45,
    status: "draft" as const,
    createdAt: "2024-01-20",
    lastSubmission: "3 days ago"
  }
];

export default async function FormsPage() {
  const result = await getSessionWithDevBypass(await headers());

  if (!result?.session?.userId && !result?.userId) {
    redirect(redirectToSignIn("/dashboard/forms"));
  }

  const hasForms = mockForms.length > 0;

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full max-w-7xl mx-auto">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-8">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-foreground">
                Forms
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                Create registration forms and surveys for your church members and visitors.
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/dashboard/forms/demo">
                <Button variant="outline" size="lg" className="text-base px-6">
                  <Eye className="mr-2 h-5 w-5" />
                  View Demo
                </Button>
              </Link>
              <Link href="/dashboard/forms/builder">
                <Button size="lg" className="text-base px-6">
                  <Plus className="mr-2 h-5 w-5" />
                  Create New Form
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {!hasForms ? (
          // Empty state for first-time users
          <div className="grid gap-6">
            <Card className="border-2 border-dashed border-muted-foreground/25">
              <CardHeader className="text-center py-12">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-lg flex items-center justify-center mb-6">
                  <FileText className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl mb-2">Create Your First Form</CardTitle>
                <CardDescription className="text-lg max-w-md mx-auto">
                  Replace paper signup sheets and online tools like Google Forms with professional forms that integrate with your church database.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center pb-12">
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                  <Link href="/dashboard/forms/builder?type=general">
                    <Button size="lg" variant="outline" className="w-full sm:w-auto">
                      <UserCheck className="mr-2 h-5 w-5" />
                      Contact Form
                    </Button>
                  </Link>
                  <Link href="/dashboard/forms/builder?type=registration">
                    <Button size="lg" className="w-full sm:w-auto">
                      <Calendar className="mr-2 h-5 w-5" />
                      Event Registration
                    </Button>
                  </Link>
                </div>
                <div className="text-center mb-4">
                  <Link href="/dashboard/forms/demo">
                    <Button variant="ghost" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      See forms in action - View Demo
                    </Button>
                  </Link>
                </div>
                <p className="text-sm text-muted-foreground">
                  Not sure which to choose? Start with a Contact Form - you can always change it later.
                </p>
              </CardContent>
            </Card>
            
            {/* Quick start cards */}
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <UserCheck className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Contact Forms</CardTitle>
                      <CardDescription className="text-base">
                        Perfect for visitor cards, volunteer signups, prayer requests
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Simple contact information collection</li>
                    <li>• Automatic member recognition</li>
                    <li>• Email confirmations</li>
                    <li>• Mobile-friendly design</li>
                  </ul>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">Event Registration</CardTitle>
                      <CardDescription className="text-base">
                        Handle paid events, capacity limits, family signups
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Capacity management and waitlists</li>
                    <li>• Payment processing (optional)</li>
                    <li>• Family registration options</li>
                    <li>• Automated confirmations</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          // Forms list for existing users
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockForms.map((form) => (
                <Card key={form.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <CardTitle className="text-lg line-clamp-1">{form.name}</CardTitle>
                          <Badge variant={form.status === 'active' ? 'default' : 'secondary'}>
                            {form.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-sm line-clamp-2">
                          {form.description}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{form.submissions} submissions</span>
                        </div>
                        {form.capacity && (
                          <span>{form.submissions}/{form.capacity} capacity</span>
                        )}
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Last submission: {form.lastSubmission}
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button size="sm" variant="outline" className="flex-1">
                          <Eye className="mr-1 h-3 w-3" />
                          View
                        </Button>
                        <Button size="sm" variant="outline" className="flex-1">
                          <Edit className="mr-1 h-3 w-3" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {/* Add new form card */}
              <Card className="border-2 border-dashed border-muted-foreground/25 hover:border-muted-foreground/40 transition-colors">
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="font-medium mb-2">Create New Form</h3>
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    Add another form for your church
                  </p>
                  <Link href="/dashboard/forms/builder">
                    <Button size="sm">
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}