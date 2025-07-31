"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, DollarSign, Users, Calendar } from "lucide-react";
import { formatAmountForDisplay } from "@/lib/stripe-utils";

interface GivingStatsData {
  totalThisMonth: number;
  totalLastMonth: number;
  totalDonors: number;
  totalTransactions: number;
  averageDonation: number;
  topCategory: string;
  topCategoryAmount: number;
}

// Mock data - in a real app this would come from the database
const mockStats: GivingStatsData = {
  totalThisMonth: 850000, // $8,500.00 in cents
  totalLastMonth: 720000, // $7,200.00 in cents
  totalDonors: 45,
  totalTransactions: 128,
  averageDonation: 6640, // $66.40 in cents
  topCategory: "Tithe",
  topCategoryAmount: 520000 // $5,200.00 in cents
};

export default function GivingStats() {
  const [stats, setStats] = useState<GivingStatsData>(mockStats);
  const [loading, setLoading] = useState(false);

  // Calculate month-over-month growth
  const monthOverMonthGrowth = stats.totalLastMonth > 0 
    ? ((stats.totalThisMonth - stats.totalLastMonth) / stats.totalLastMonth) * 100
    : 0;

  const isGrowthPositive = monthOverMonthGrowth >= 0;

  const statCards = [
    {
      title: "This Month's Giving",
      value: formatAmountForDisplay(stats.totalThisMonth, "USD"),
      description: `${isGrowthPositive ? '+' : ''}${monthOverMonthGrowth.toFixed(1)}% from last month`,
      icon: DollarSign,
      trend: isGrowthPositive ? "positive" : "negative"
    },
    {
      title: "Active Donors",
      value: stats.totalDonors.toString(),
      description: "Unique donors this month",
      icon: Users,
      trend: "neutral"
    },
    {
      title: "Total Transactions",
      value: stats.totalTransactions.toString(),
      description: "All time transaction count",
      icon: Calendar,
      trend: "neutral"
    },
    {
      title: "Average Donation",
      value: formatAmountForDisplay(stats.averageDonation, "USD"),
      description: `Top category: ${stats.topCategory}`,
      icon: TrendingUp,
      trend: "neutral"
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {card.title}
            </CardTitle>
            <card.icon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className={`text-xs ${
              card.trend === "positive" 
                ? "text-green-600 dark:text-green-400" 
                : card.trend === "negative" 
                  ? "text-red-600 dark:text-red-400"
                  : "text-muted-foreground"
            }`}>
              {card.description}
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}