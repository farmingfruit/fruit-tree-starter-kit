"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import DonationForm from "./donation-form";
import TransactionHistory from "./transaction-history";
import GivingStats from "./giving-stats";
import ManualTransactionDialog from "./manual-transaction-dialog";

export default function GivingDashboard() {
  const [showDonationForm, setShowDonationForm] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleTransactionSuccess = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <GivingStats />
      
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button 
          onClick={() => setShowDonationForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Process Online Donation
        </Button>
        <Button 
          variant="outline"
          onClick={() => setShowManualForm(true)}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Record Manual Gift
        </Button>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="transactions" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="transactions">Transaction History</TabsTrigger>
          <TabsTrigger value="reports">Giving Reports</TabsTrigger>
          <TabsTrigger value="settings">Giving Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <TransactionHistory refreshTrigger={refreshTrigger} />
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Giving Reports</CardTitle>
              <CardDescription>
                Analyze giving patterns and generate reports for your church.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Detailed giving reports and analytics coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Giving Settings</CardTitle>
              <CardDescription>
                Configure donation categories, payment methods, and giving options.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Giving configuration options coming soon...
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      <DonationForm 
        open={showDonationForm} 
        onClose={() => setShowDonationForm(false)}
        onSuccess={handleTransactionSuccess}
      />
      <ManualTransactionDialog 
        open={showManualForm} 
        onClose={() => setShowManualForm(false)}
        onSuccess={handleTransactionSuccess}
      />
    </div>
  );
}