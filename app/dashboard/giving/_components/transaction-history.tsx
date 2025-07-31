"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter } from "lucide-react";
import { formatAmountForDisplay } from "@/lib/stripe-utils";

interface Donation {
  id: string;
  amount: number;
  currency: string;
  method: string;
  status: string;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  categoryId: string;
  isAnonymous: boolean;
  notes: string;
  createdAt: string;
  stripePaymentIntentId?: string;
}

// This will be populated from the API

const categoryLabels: Record<string, string> = {
  tithe: "Tithe",
  offering: "General Offering",
  missions: "Missions",
  building: "Building Fund",
  other: "Other"
};

const statusColors: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  completed: "default",
  pending: "secondary",
  failed: "destructive",
  refunded: "outline"
};

const methodLabels: Record<string, string> = {
  card: "Credit Card",
  ach: "Bank Transfer",
  cash: "Cash",
  check: "Check",
  bank_transfer: "Bank Transfer"
};

interface TransactionHistoryProps {
  refreshTrigger?: number;
}

export default function TransactionHistory({ refreshTrigger }: TransactionHistoryProps) {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // Fetch donations from API
  useEffect(() => {
    const fetchDonations = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/donations/list');
        const data = await response.json();
        
        if (data.success) {
          setDonations(data.donations);
        } else {
          console.error('Failed to fetch donations:', data.error);
        }
      } catch (error) {
        console.error('Error fetching donations:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDonations();
  }, []);

  // Refresh when trigger changes
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      refreshDonations();
    }
  }, [refreshTrigger]);

  useEffect(() => {
    let filtered = donations;

    if (searchTerm) {
      filtered = filtered.filter(donation => 
        donation.donorFirstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donorLastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.donorEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        donation.notes.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(donation => donation.status === statusFilter);
    }

    if (methodFilter !== "all") {
      filtered = filtered.filter(donation => donation.method === methodFilter);
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter(donation => donation.categoryId === categoryFilter);
    }

    setFilteredDonations(filtered);
  }, [donations, searchTerm, statusFilter, methodFilter, categoryFilter]);

  const handleExport = () => {
    // TODO: Implement CSV export functionality
    console.log("Exporting transactions...");
  };

  const refreshDonations = async () => {
    try {
      const response = await fetch('/api/donations/list');
      const data = await response.json();
      
      if (data.success) {
        setDonations(data.donations);
      }
    } catch (error) {
      console.error('Error refreshing donations:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transaction History</CardTitle>
        <CardDescription>
          View and manage all donation transactions for your church.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by donor name, email, or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="refunded">Refunded</SelectItem>
            </SelectContent>
          </Select>

          <Select value={methodFilter} onValueChange={setMethodFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Method" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Methods</SelectItem>
              <SelectItem value="card">Credit Card</SelectItem>
              <SelectItem value="ach">Bank Transfer</SelectItem>
              <SelectItem value="cash">Cash</SelectItem>
              <SelectItem value="check">Check</SelectItem>
            </SelectContent>
          </Select>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="tithe">Tithe</SelectItem>
              <SelectItem value="offering">General Offering</SelectItem>
              <SelectItem value="missions">Missions</SelectItem>
              <SelectItem value="building">Building Fund</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>

        {/* Transaction Table */}
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Donor</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Loading transactions...
                  </TableCell>
                </TableRow>
              ) : filteredDonations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {donations.length === 0 
                      ? "No transactions recorded yet. Create your first donation to see it here."
                      : "No transactions found matching your criteria."
                    }
                  </TableCell>
                </TableRow>
              ) : (
                filteredDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {donation.isAnonymous 
                            ? "Anonymous" 
                            : `${donation.donorFirstName} ${donation.donorLastName}`
                          }
                        </div>
                        {!donation.isAnonymous && (
                          <div className="text-sm text-muted-foreground">
                            {donation.donorEmail}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      {formatAmountForDisplay(donation.amount, donation.currency)}
                    </TableCell>
                    <TableCell>
                      {methodLabels[donation.method] || donation.method}
                    </TableCell>
                    <TableCell>
                      {categoryLabels[donation.categoryId] || donation.categoryId}
                    </TableCell>
                    <TableCell>
                      <Badge variant={statusColors[donation.status]}>
                        {donation.status.charAt(0).toUpperCase() + donation.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {donation.notes || "—"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Summary */}
        {filteredDonations.length > 0 && (
          <div className="mt-4 flex justify-between items-center text-sm text-muted-foreground">
            <span>
              Showing {filteredDonations.length} of {donations.length} transactions
            </span>
            <span>
              Total: {formatAmountForDisplay(
                filteredDonations
                  .filter(d => d.status === "completed")
                  .reduce((sum, d) => sum + d.amount, 0),
                "USD"
              )}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}