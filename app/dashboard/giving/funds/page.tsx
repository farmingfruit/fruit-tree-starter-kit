import { getSessionWithDevBypass, redirectToSignIn } from "@/lib/auth-wrapper";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard } from "lucide-react";

export default async function FundManagementPage() {
  const result = await getSessionWithDevBypass(await headers());

  if (!result?.session?.userId && !result?.userId) {
    redirect(redirectToSignIn("/dashboard/giving/funds"));
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Fund Management
              </h1>
              <p className="text-muted-foreground">
                Manage designated funds, campaigns, and special collections.
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Fund
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>No designated funds yet</CardTitle>
              <CardDescription>
                Create designated funds to track donations for specific purposes like 
                building campaigns, missions, or special projects.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create First Fund
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}