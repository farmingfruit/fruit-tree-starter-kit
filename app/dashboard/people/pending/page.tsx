import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import PendingReview from "../_components/pending-review";
import { getPendingMembers } from "@/lib/people-data";

export default async function PendingReviewPage() {
  const result = await auth.api.getSession({
    headers: await headers(),
  });

  if (!result?.session?.userId) {
    redirect("/sign-in");
  }

  // Fetch pending members from database
  const pendingMembers = await getPendingMembers();

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">
              Pending Reviews
            </h1>
            <p className="text-muted-foreground">
              Review and approve member applications, updates, and changes.
            </p>
          </div>
        </div>

        <PendingReview initialPendingMembers={pendingMembers} />
      </div>
    </section>
  );
}