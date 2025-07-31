import { getSessionWithDevBypass, redirectToSignIn } from "@/lib/auth-wrapper";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import MemberList from "./_components/member-list";
import { getAllMembers } from "@/lib/people-data";

export default async function PeoplePage() {
  const result = await getSessionWithDevBypass(await headers());

  if (!result?.session?.userId && !result?.userId) {
    redirect(redirectToSignIn("/dashboard/people"));
  }

  // Fetch members data from database
  const members = await getAllMembers();

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                People
              </h1>
              <p className="text-muted-foreground">
                Manage your church members, families, and visitor information.
              </p>
            </div>
          </div>
        </div>

        <MemberList initialMembers={members} />
      </div>
    </section>
  );
}