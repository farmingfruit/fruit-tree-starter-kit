import { getSessionWithDevBypass, redirectToSignIn } from "@/lib/auth-wrapper";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Building2 } from "lucide-react";

export default async function BankDepositsPage() {
  const result = await getSessionWithDevBypass(await headers());

  if (!result?.session?.userId && !result?.userId) {
    redirect(redirectToSignIn("/dashboard/giving/deposits"));
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Bank Deposits
              </h1>
              <p className="text-muted-foreground">
                Track bank deposits and reconcile donations with your bank statements.
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Record Deposit
            </Button>
          </div>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <Building2 className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>No bank deposits recorded</CardTitle>
              <CardDescription>
                Start tracking your bank deposits to reconcile cash and check donations 
                with your bank statements for accurate financial reporting.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Record First Deposit
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}