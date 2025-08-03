import { getSessionWithDevBypass, redirectToSignIn } from "@/lib/auth-wrapper";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, UsersRound, Search } from "lucide-react";

export default async function GroupsPage() {
  const result = await getSessionWithDevBypass(await headers());

  if (!result?.session?.userId && !result?.userId) {
    redirect(redirectToSignIn("/dashboard/groups"));
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full">
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Groups
              </h1>
              <p className="text-muted-foreground">
                Organize and manage small groups, ministries, and teams within your church.
              </p>
            </div>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </div>
        </div>

        {/* Search Box - Ready for when groups are implemented */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search groups by name or description..."
              className="h-12 pl-12 text-lg border-2 focus:border-primary"
              style={{ fontSize: '18px' }} // Elderly-friendly font size
              disabled
            />
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Search will be enabled once groups are created
          </p>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto w-12 h-12 bg-muted rounded-lg flex items-center justify-center mb-4">
                <UsersRound className="h-6 w-6 text-muted-foreground" />
              </div>
              <CardTitle>No groups yet</CardTitle>
              <CardDescription>
                Create your first group to start organizing ministries, small groups, or teams.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Group
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}