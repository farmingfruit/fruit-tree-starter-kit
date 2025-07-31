"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Zap, 
  Clock, 
  Target,
  CheckCircle,
  XCircle,
  Eye,
  MousePointerClick
} from "lucide-react";

interface FormAnalytics {
  formName: string;
  totalViews: number;
  totalSubmissions: number;
  conversionRate: number;
  recognitionRate: number;
  avgCompletionTime: number;
  mobileCompletions: number;
  recentActivity: Array<{
    date: string;
    views: number;
    submissions: number;
  }>;
}

const mockAnalytics: FormAnalytics[] = [
  {
    formName: "Easter Service Registration",
    totalViews: 1247,
    totalSubmissions: 892,
    conversionRate: 71.5,
    recognitionRate: 89.2,
    avgCompletionTime: 127, // seconds
    mobileCompletions: 78.3,
    recentActivity: [
      { date: "2024-01-20", views: 89, submissions: 67 },
      { date: "2024-01-19", views: 76, submissions: 54 },
      { date: "2024-01-18", views: 92, submissions: 71 },
    ]
  },
  {
    formName: "Volunteer Sign-up",
    totalViews: 456,
    totalSubmissions: 234,
    conversionRate: 51.3,
    recognitionRate: 94.1,
    avgCompletionTime: 89,
    mobileCompletions: 65.8,
    recentActivity: [
      { date: "2024-01-20", views: 23, submissions: 12 },
      { date: "2024-01-19", views: 34, submissions: 18 },
      { date: "2024-01-18", views: 28, submissions: 15 },
    ]
  },
  {
    formName: "Prayer Request",
    totalViews: 234,
    totalSubmissions: 198,
    conversionRate: 84.6,
    recognitionRate: 76.3,
    avgCompletionTime: 45,
    mobileCompletions: 91.4,
    recentActivity: [
      { date: "2024-01-20", views: 12, submissions: 11 },
      { date: "2024-01-19", views: 15, submissions: 13 },
      { date: "2024-01-18", views: 18, submissions: 16 },
    ]
  }
];

export default function FormAnalyticsPage() {
  const [selectedPeriod, setSelectedPeriod] = useState("7d");

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}m ${remainingSeconds}s`;
  };

  const totalViews = mockAnalytics.reduce((sum, form) => sum + form.totalViews, 0);
  const totalSubmissions = mockAnalytics.reduce((sum, form) => sum + form.totalSubmissions, 0);
  const avgConversion = mockAnalytics.reduce((sum, form) => sum + form.conversionRate, 0) / mockAnalytics.length;
  const avgRecognition = mockAnalytics.reduce((sum, form) => sum + form.recognitionRate, 0) / mockAnalytics.length;

  return (
    <div className="container mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Form Analytics</h1>
        <p className="text-muted-foreground">
          Track form performance, progressive recognition success, and user engagement metrics.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submissions</CardTitle>
            <MousePointerClick className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSubmissions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +8% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Conversion</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgConversion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +15% vs industry avg
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recognition Rate</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgRecognition.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              <CheckCircle className="inline h-3 w-3 mr-1" />
              Excellent performance
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Period Selector */}
      <div className="flex justify-end mb-6">
        <div className="flex rounded-lg border">
          {[
            { value: "7d", label: "7 Days" },
            { value: "30d", label: "30 Days" },
            { value: "90d", label: "90 Days" },
          ].map((period) => (
            <Button
              key={period.value}
              variant={selectedPeriod === period.value ? "default" : "ghost"}
              size="sm"
              onClick={() => setSelectedPeriod(period.value)}
              className="rounded-none first:rounded-l-lg last:rounded-r-lg"
            >
              {period.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Form Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Individual Form Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {mockAnalytics.map((form, index) => (
              <div key={index} className="border rounded-lg p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">{form.formName}</h3>
                  <div className="flex gap-2 mt-2 md:mt-0">
                    <Badge variant="outline" className="text-green-700 border-green-300">
                      {form.conversionRate}% conversion
                    </Badge>
                    <Badge variant="outline" className="text-purple-700 border-purple-300">
                      {form.recognitionRate}% recognized
                    </Badge>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-6 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Views</div>
                    <div className="font-semibold text-lg">{form.totalViews}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Submissions</div>
                    <div className="font-semibold text-lg">{form.totalSubmissions}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Avg Time</div>
                    <div className="font-semibold text-lg flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTime(form.avgCompletionTime)}
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Mobile</div>
                    <div className="font-semibold text-lg">{form.mobileCompletions}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Recognition</div>
                    <div className="font-semibold text-lg flex items-center gap-1">
                      <Zap className="h-3 w-3 text-purple-500" />
                      {form.recognitionRate}%
                    </div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Status</div>
                    <div className="font-semibold text-lg">
                      {form.conversionRate > 70 ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : form.conversionRate > 50 ? (
                        <Clock className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Recent Activity Mini Chart */}
                <div className="mt-4 pt-4 border-t">
                  <div className="text-sm text-muted-foreground mb-2">Recent Activity (Last 3 Days)</div>
                  <div className="flex gap-2">
                    {form.recentActivity.map((day, dayIndex) => (
                      <div key={dayIndex} className="flex-1 text-center">
                        <div className="text-xs text-muted-foreground">
                          {new Date(day.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        <div className="text-sm font-medium">{day.submissions}/{day.views}</div>
                        <div className="text-xs text-muted-foreground">
                          {((day.submissions / day.views) * 100).toFixed(0)}%
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Progressive Recognition Insights */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-purple-500" />
            Progressive Recognition Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">89.2%</div>
              <div className="text-sm text-muted-foreground">Average Recognition Rate</div>
              <div className="text-xs text-muted-foreground mt-1">
                Users automatically recognized and greeted personally
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">78%</div>
              <div className="text-sm text-muted-foreground">Time Saved</div>
              <div className="text-xs text-muted-foreground mt-1">
                Average reduction in form completion time
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">96%</div>
              <div className="text-sm text-muted-foreground">User Satisfaction</div>
              <div className="text-xs text-muted-foreground mt-1">
                Users love the personalized experience
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}