import { getSessionWithDevBypass, redirectToSignIn } from "@/lib/auth-wrapper";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  FileText, 
  ExternalLink,
  Settings,
  Copy,
  Eye,
  BarChart3,
  Calendar
} from "lucide-react";
import { db } from "@/db/drizzle";
import { 
  donationForms, 
  donationFormCategories, 
  donationCategories,
  donationFormSubmissions,
  donations
} from "@/db/schema";
import { eq, and, count, sum, desc } from "drizzle-orm";

// Mock church ID for development - replace with actual session-based church ID
const CHURCH_ID = "church_1";

async function getDonationForms() {
  // Get all forms for the church
  const forms = await db
    .select({
      form: donationForms,
      submissionsCount: count(donationFormSubmissions.id),
      totalDonations: sum(donations.amount),
    })
    .from(donationForms)
    .leftJoin(donationFormSubmissions, eq(donationFormSubmissions.formId, donationForms.id))
    .leftJoin(donations, eq(donations.id, donationFormSubmissions.donationId))
    .where(eq(donationForms.churchId, CHURCH_ID))
    .groupBy(donationForms.id)
    .orderBy(desc(donationForms.isDefault), desc(donationForms.createdAt));

  // Get categories for each form
  const formsWithCategories = await Promise.all(
    forms.map(async (formData) => {
      const categories = await db
        .select({
          category: donationCategories,
          formCategory: donationFormCategories,
        })
        .from(donationFormCategories)
        .leftJoin(donationCategories, eq(donationCategories.id, donationFormCategories.categoryId))
        .where(eq(donationFormCategories.formId, formData.form.id))
        .orderBy(donationFormCategories.sortOrder);

      return {
        ...formData,
        categories: categories.map(c => c.category).filter(Boolean),
      };
    })
  );

  return formsWithCategories;
}

export default async function DonationFormsPage() {
  const result = await getSessionWithDevBypass(await headers());

  if (!result?.session?.userId && !result?.userId) {
    redirect(redirectToSignIn("/dashboard/giving/forms"));
  }

  const forms = await getDonationForms();

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        {/* Header */}
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Donation Forms
              </h1>
              <p className="text-muted-foreground">
                Create and manage public donation forms for your church.
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Form
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-3 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Forms</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{forms.length}</div>
              <p className="text-xs text-muted-foreground">
                {forms.filter(f => f.form.isActive).length} active forms
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {forms.reduce((sum, f) => sum + (f.submissionsCount || 0), 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Across all forms
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Raised</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                ${forms.reduce((sum, f) => sum + ((f.totalDonations || 0) / 100), 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                From form submissions
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Forms List */}
        <div className="space-y-4">
          {forms.length === 0 ? (
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-muted-foreground" />
                </div>
                <CardTitle>No donation forms yet</CardTitle>
                <CardDescription>
                  Create your first donation form to start accepting online donations.
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Form
                </Button>
              </CardContent>
            </Card>
          ) : (
            forms.map((formData) => {
              const form = formData.form;
              const publicUrl = `${process.env.NODE_ENV === 'production' 
                ? process.env.NEXT_PUBLIC_APP_URL 
                : 'http://localhost:3000'}/give/${form.slug}`;

              return (
                <Card key={form.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-xl">{form.name}</CardTitle>
                          {form.isDefault && (
                            <Badge variant="secondary">Default</Badge>
                          )}
                          {!form.isActive && (
                            <Badge variant="outline">Inactive</Badge>
                          )}
                        </div>
                        {form.description && (
                          <CardDescription>{form.description}</CardDescription>
                        )}
                        
                        {/* Categories */}
                        <div className="flex flex-wrap gap-1">
                          {formData.categories?.map((category) => (
                            <Badge key={category?.id} variant="outline" className="text-xs">
                              {category?.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="mr-2 h-4 w-4" />
                            Preview
                          </a>
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="mr-2 h-4 w-4" />
                          Settings
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Public URL */}
                      <div className="space-y-2">
                        <div className="text-sm font-medium">Public Donation URL</div>
                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                          <code className="text-sm flex-1 truncate">{publicUrl}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-primary">
                            {formData.submissionsCount || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Submissions</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">
                            ${((formData.totalDonations || 0) / 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">Total Raised</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            ${(form.minimumAmount / 100).toFixed(2)}
                          </div>
                          <div className="text-xs text-muted-foreground">Min Amount</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold">
                            {formData.categories?.length || 0}
                          </div>
                          <div className="text-xs text-muted-foreground">Categories</div>
                        </div>
                      </div>

                      {/* Features */}
                      <div className="flex flex-wrap gap-2">
                        {form.enableMultiFund && (
                          <Badge variant="secondary" className="text-xs">
                            Multi-Fund Giving
                          </Badge>
                        )}
                        {form.enableFeeCoverage && (
                          <Badge variant="secondary" className="text-xs">
                            Fee Coverage
                          </Badge>
                        )}
                        {form.allowAnonymous && (
                          <Badge variant="secondary" className="text-xs">
                            Anonymous Giving
                          </Badge>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}