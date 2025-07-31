import { getSessionWithDevBypass, redirectToSignIn } from "@/lib/auth-wrapper";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import GivingDashboard from "../_components/giving-dashboard";

export default async function TransactionsPage() {
  const result = await getSessionWithDevBypass(await headers());

  if (!result?.session?.userId && !result?.userId) {
    redirect(redirectToSignIn("/dashboard/giving/transactions"));
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Transaction History
              </h1>
              <p className="text-muted-foreground">
                View, manage, and process all donation transactions for your church.
              </p>
            </div>
          </div>
        </div>

        <GivingDashboard />
      </div>
    </section>
  );
}