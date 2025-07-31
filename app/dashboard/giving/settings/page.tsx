import { getSessionWithDevBypass, redirectToSignIn } from "@/lib/auth-wrapper";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export default async function GivingSettingsPage() {
  const result = await getSessionWithDevBypass(await headers());

  if (!result?.session?.userId && !result?.userId) {
    redirect(redirectToSignIn("/dashboard/giving/settings"));
  }

  return (
    <section className="flex flex-col items-start justify-start p-6 w-full">
      <div className="w-full max-w-4xl">
        <div className="flex flex-col items-start justify-center gap-2 mb-6">
          <div className="flex justify-between items-center w-full">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight">
                Giving Settings
              </h1>
              <p className="text-muted-foreground">
                Configure giving preferences and payment processing options.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Payment Processing */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Processing</CardTitle>
              <CardDescription>
                Configure Stripe and other payment processor settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stripe-key">Stripe Publishable Key</Label>
                  <Input id="stripe-key" placeholder="pk_live_..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="stripe-secret">Stripe Secret Key</Label>
                  <Input id="stripe-secret" type="password" placeholder="sk_live_..." />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="test-mode" />
                <Label htmlFor="test-mode">Test mode (use test keys)</Label>
              </div>
            </CardContent>
          </Card>

          {/* Donation Categories */}
          <Card>
            <CardHeader>
              <CardTitle>Donation Categories</CardTitle>
              <CardDescription>
                Manage the categories available for donations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Tithe</span>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span>General Offering</span>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span>Missions</span>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span>Building Fund</span>
                  <Switch defaultChecked />
                </div>
                <Separator />
                <Button variant="outline" size="sm">
                  Add Category
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Email Notifications */}
          <Card>
            <CardHeader>
              <CardTitle>Email Notifications</CardTitle>
              <CardDescription>
                Configure email notifications for donations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch id="donor-receipts" defaultChecked />
                <Label htmlFor="donor-receipts">Send automatic receipt emails to donors</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch id="admin-notifications" defaultChecked />
                <Label htmlFor="admin-notifications">Notify admins of new donations</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin notification email</Label>
                <Input id="admin-email" type="email" placeholder="admin@church.org" />
              </div>
            </CardContent>
          </Card>

          {/* Save Changes */}
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </div>
      </div>
    </section>
  );
}