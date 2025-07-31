/**
 * Recognition Analytics Dashboard
 * 
 * This component provides a comprehensive view of progressive recognition
 * performance metrics, success rates, and trends. It helps church administrators
 * understand how well the recognition system is working and identify areas
 * for improvement.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CheckCircle, 
  Clock, 
  Target,
  BarChart3,
  PieChart as PieChartIcon,
  Calendar,
  RefreshCw,
  Download
} from "lucide-react";
import { RecognitionAnalytics } from "@/lib/recognition-analytics";

interface AnalyticsDashboardProps {
  churchId: string;
  className?: string;
}

interface DateRange {
  label: string;
  value: string;
  start: Date;
  end: Date;
}

const DATE_RANGES: DateRange[] = [
  {
    label: 'Last 7 days',
    value: '7d',
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    end: new Date()
  },
  {
    label: 'Last 30 days',
    value: '30d',
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  },
  {
    label: 'Last 90 days',
    value: '90d',
    start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
    end: new Date()
  },
  {
    label: 'Last year',
    value: '1y',
    start: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
    end: new Date()
  }
];

const CHART_COLORS = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'
];

export function AnalyticsDashboard({ churchId, className = "" }: AnalyticsDashboardProps) {
  const [analytics, setAnalytics] = useState<RecognitionAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRange, setSelectedRange] = useState('30d');

  /**
   * Fetch analytics data
   */
  const fetchAnalytics = async (dateRange: DateRange) => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would call an API endpoint
      // For now, we'll simulate the data structure
      const mockAnalytics: RecognitionAnalytics = {
        overview: {
          totalRecognitionAttempts: 1247,
          successfulRecognitions: 1058,
          successRate: 84.8,
          averageConfidenceScore: 91.2,
          timesSaved: 2116 // minutes
        },
        recognitionBreakdown: {
          autoLinked: 723,
          suggestedMatches: 335,
          adminReviews: 127,
          noMatches: 62
        },
        confidenceDistribution: [
          { range: '90-100%', count: 723, successRate: 98.2 },
          { range: '80-89%', count: 335, successRate: 92.1 },
          { range: '70-79%', count: 127, successRate: 78.5 },
          { range: '60-69%', count: 45, successRate: 62.2 },
          { range: 'Below 60%', count: 17, successRate: 35.3 }
        ],
        userFeedback: {
          confirmations: 967,
          rejections: 91,
          confirmationRate: 91.4
        },
        adminPerformance: {
          pendingReviews: 23,
          averageReviewTime: 4.2,
          approvalRate: 76.3
        },
        trendsOverTime: [
          { date: '2024-01-01', attempts: 42, successes: 36, avgConfidence: 89.1 },
          { date: '2024-01-02', attempts: 38, successes: 32, avgConfidence: 90.3 },
          { date: '2024-01-03', attempts: 45, successes: 39, avgConfidence: 88.7 },
          { date: '2024-01-04', attempts: 51, successes: 44, avgConfidence: 91.2 },
          { date: '2024-01-05', attempts: 39, successes: 34, avgConfidence: 87.9 },
          { date: '2024-01-06', attempts: 47, successes: 41, avgConfidence: 92.1 },
          { date: '2024-01-07', attempts: 43, successes: 37, avgConfidence: 89.8 }
        ]
      };

      setAnalytics(mockAnalytics);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load analytics on mount and range change
   */
  useEffect(() => {
    const dateRange = DATE_RANGES.find(r => r.value === selectedRange) || DATE_RANGES[1];
    fetchAnalytics(dateRange);
  }, [churchId, selectedRange]);

  /**
   * Format large numbers
   */
  const formatNumber = (num: number): string => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  /**
   * Format time duration
   */
  const formatTime = (minutes: number): string => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}m`;
    }
    return `${minutes}m`;
  };

  /**
   * Render metric card
   */
  const renderMetricCard = (
    title: string,
    value: string | number,
    subtitle?: string,
    trend?: number,
    icon?: React.ReactNode
  ) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
            )}
          </div>
          
          <div className="flex flex-col items-end gap-2">
            {icon && (
              <div className="p-2 bg-blue-50 rounded-lg">
                {icon}
              </div>
            )}
            
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-xs ${
                trend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {trend >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>{Math.abs(trend).toFixed(1)}%</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <RefreshCw className="h-6 w-6 animate-spin mr-2" />
            <span>Loading analytics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error || !analytics) {
    return (
      <Card className={className}>
        <CardContent className="p-8">
          <div className="text-center">
            <div className="text-red-600 mb-2">{error || 'Failed to load analytics'}</div>
            <Button variant="outline" onClick={() => fetchAnalytics(DATE_RANGES[1])}>
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { overview, recognitionBreakdown, confidenceDistribution, userFeedback, adminPerformance, trendsOverTime } = analytics;

  // Prepare chart data
  const breakdownChartData = [
    { name: 'Auto-Linked', value: recognitionBreakdown.autoLinked, color: CHART_COLORS[0] },
    { name: 'Suggested Matches', value: recognitionBreakdown.suggestedMatches, color: CHART_COLORS[1] },
    { name: 'Admin Reviews', value: recognitionBreakdown.adminReviews, color: CHART_COLORS[2] },
    { name: 'No Matches', value: recognitionBreakdown.noMatches, color: CHART_COLORS[3] }
  ];

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recognition Analytics
              </CardTitle>
              <CardDescription>
                Track progressive recognition performance and success rates
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <Select value={selectedRange} onValueChange={setSelectedRange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {DATE_RANGES.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Button variant="outline" size="sm">
                <Download className="h-3 w-3 mr-1" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="breakdown">Breakdown</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="admin">Admin Performance</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {renderMetricCard(
                  'Total Attempts',
                  formatNumber(overview.totalRecognitionAttempts),
                  'Recognition attempts',
                  undefined,
                  <Users className="h-4 w-4 text-blue-600" />
                )}
                
                {renderMetricCard(
                  'Success Rate',
                  `${overview.successRate.toFixed(1)}%`,
                  'Successful recognitions',
                  2.3,
                  <Target className="h-4 w-4 text-green-600" />
                )}
                
                {renderMetricCard(
                  'Avg Confidence',
                  `${overview.averageConfidenceScore.toFixed(1)}%`,
                  'Recognition confidence',
                  1.8,
                  <CheckCircle className="h-4 w-4 text-purple-600" />
                )}
                
                {renderMetricCard(
                  'Time Saved',
                  formatTime(overview.timesSaved),
                  'For church members',
                  undefined,
                  <Clock className="h-4 w-4 text-orange-600" />
                )}
              </div>

              {/* User Feedback */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">User Feedback</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">
                        {userFeedback.confirmations}
                      </p>
                      <p className="text-sm text-gray-600">Confirmations</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-red-600">
                        {userFeedback.rejections}
                      </p>
                      <p className="text-sm text-gray-600">Rejections</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">
                        {userFeedback.confirmationRate.toFixed(1)}%
                      </p>
                      <p className="text-sm text-gray-600">Confirmation Rate</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="breakdown" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Recognition Type Breakdown */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <PieChartIcon className="h-4 w-4" />
                      Recognition Types
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={breakdownChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {breakdownChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value, name) => [value, name]} />
                      </PieChart>
                    </ResponsiveContainer>
                    
                    <div className="flex flex-wrap gap-2 mt-4">
                      {breakdownChartData.map((item, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          <div 
                            className="w-2 h-2 rounded-full mr-1" 
                            style={{ backgroundColor: item.color }}
                          />
                          {item.name}: {item.value}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Confidence Distribution */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Confidence Distribution</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={confidenceDistribution}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="range" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="count" fill={CHART_COLORS[0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Recognition Trends Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={trendsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(value) => new Date(value).toLocaleDateString()}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="attempts" 
                        stroke={CHART_COLORS[0]} 
                        strokeWidth={2}
                        name="Attempts"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="successes" 
                        stroke={CHART_COLORS[1]} 
                        strokeWidth={2}
                        name="Successes"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {renderMetricCard(
                  'Pending Reviews',
                  adminPerformance.pendingReviews,
                  'Items awaiting review',
                  undefined,
                  <Clock className="h-4 w-4 text-orange-600" />
                )}
                
                {renderMetricCard(
                  'Avg Review Time',
                  `${adminPerformance.averageReviewTime.toFixed(1)}h`,
                  'Time to complete reviews',
                  -12.5,
                  <Calendar className="h-4 w-4 text-blue-600" />
                )}
                
                {renderMetricCard(
                  'Approval Rate',
                  `${adminPerformance.approvalRate.toFixed(1)}%`,
                  'Reviews approved',
                  5.2,
                  <CheckCircle className="h-4 w-4 text-green-600" />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}