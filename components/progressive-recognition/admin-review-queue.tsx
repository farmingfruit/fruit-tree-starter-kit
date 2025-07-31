/**
 * Admin Review Queue Component
 * 
 * This component provides a comprehensive interface for church administrators
 * to review, approve, and manage profile matches that require human judgment.
 * It displays pending matches with confidence scores and provides tools for
 * quick decision-making.
 */

"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { 
  CheckCircle, 
  XCircle, 
  Users, 
  AlertTriangle,
  Clock,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Eye,
  Loader2,
  RefreshCw
} from "lucide-react";

interface AdminReviewItem {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  confidence: number;
  matchReasons: string[];
  sourceProfile: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  targetProfile?: {
    id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
}

interface AdminReviewResponse {
  items: AdminReviewItem[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

interface AdminReviewQueueProps {
  churchId: string;
  className?: string;
}

export function AdminReviewQueue({ churchId, className = "" }: AdminReviewQueueProps) {
  const [reviewItems, setReviewItems] = useState<AdminReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState('pending');
  const [processedItems, setProcessedItems] = useState<Set<string>>(new Set());

  /**
   * Fetch review items from the API
   */
  const fetchReviewItems = async (status: string = 'pending') => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/progressive-recognition/admin-review?churchId=${churchId}&status=${status}&limit=50`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch review items');
      }

      const data: AdminReviewResponse = await response.json();
      setReviewItems(data.items);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Fetch review items error:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle admin action (approve/reject/merge)
   */
  const handleAdminAction = async (
    reviewId: string, 
    action: 'approve' | 'reject' | 'merge',
    mergeData?: any
  ) => {
    try {
      const response = await fetch('/api/progressive-recognition/admin-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          churchId,
          action,
          reviewId,
          mergeData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Action failed');
      }

      // Mark item as processed
      setProcessedItems(prev => new Set([...prev, reviewId]));
      
      // Remove from current list
      setReviewItems(prev => prev.filter(item => item.id !== reviewId));

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Action failed';
      console.error('Admin action error:', err);
      // You might want to show a toast notification here
    }
  };

  /**
   * Load initial data
   */
  useEffect(() => {
    fetchReviewItems(selectedTab);
  }, [churchId, selectedTab]);

  /**
   * Get priority color and icon
   */
  const getPriorityDisplay = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: <AlertTriangle className="h-3 w-3" />
        };
      case 'high':
        return {
          color: 'bg-orange-100 text-orange-800 border-orange-200',
          icon: <Clock className="h-3 w-3" />
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: <Clock className="h-3 w-3" />
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: <Clock className="h-3 w-3" />
        };
    }
  };

  /**
   * Get confidence color
   */
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 90) return 'text-green-600 bg-green-50';
    if (confidence >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  /**
   * Render a single review item
   */
  const renderReviewItem = (item: AdminReviewItem) => {
    const { color: priorityColor, icon: priorityIcon } = getPriorityDisplay(item.priority);
    const isProcessed = processedItems.has(item.id);

    return (
      <Card key={item.id} className={`mb-4 ${isProcessed ? 'opacity-50' : ''}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
              <CardDescription className="text-xs mt-1">
                {item.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className={`text-xs ${priorityColor}`}>
                {priorityIcon}
                <span className="ml-1 capitalize">{item.priority}</span>
              </Badge>
              <Badge variant="outline" className={`text-xs ${getConfidenceColor(item.confidence)}`}>
                {item.confidence}% confidence
              </Badge>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Profile comparison */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            {/* Source profile */}
            <div className="space-y-2">
              <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <User className="h-3 w-3" />
                New Submission
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 space-y-1">
                <div className="text-sm font-medium">
                  {item.sourceProfile.firstName} {item.sourceProfile.lastName}
                </div>
                {item.sourceProfile.email && (
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <Mail className="h-3 w-3" />
                    {item.sourceProfile.email}
                  </div>
                )}
                {item.sourceProfile.phone && (
                  <div className="text-xs text-gray-600 flex items-center gap-1">
                    <Phone className="h-3 w-3" />
                    {item.sourceProfile.phone}
                  </div>
                )}
              </div>
            </div>

            {/* Target profile */}
            {item.targetProfile && (
              <div className="space-y-2">
                <div className="text-xs font-medium text-gray-600 flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Existing Record
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3 space-y-1">
                  <div className="text-sm font-medium">
                    {item.targetProfile.firstName} {item.targetProfile.lastName}
                  </div>
                  {item.targetProfile.email && (
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {item.targetProfile.email}
                    </div>
                  )}
                  {item.targetProfile.phone && (
                    <div className="text-xs text-gray-600 flex items-center gap-1">
                      <Phone className="h-3 w-3" />
                      {item.targetProfile.phone}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Match reasons */}
          {item.matchReasons.length > 0 && (
            <div className="mb-4">
              <div className="text-xs font-medium text-gray-600 mb-2">Match Reasons:</div>
              <div className="flex flex-wrap gap-1">
                {item.matchReasons.map((reason, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {reason.replace(/_/g, ' ')}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!isProcessed && (
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => handleAdminAction(item.id, 'approve')}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                Approve Match
              </Button>
              
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleAdminAction(item.id, 'reject')}
                className="border-red-300 text-red-700 hover:bg-red-50"
              >
                <XCircle className="h-3 w-3 mr-1" />
                Reject Match
              </Button>

              {item.targetProfile && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Users className="h-3 w-3 mr-1" />
                      Merge Profiles
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Merge Profiles</DialogTitle>
                      <DialogDescription>
                        Choose which profile to keep and merge the data into.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Button
                        onClick={() => handleAdminAction(item.id, 'merge', {
                          sourceProfileId: item.sourceProfile.id,
                          targetProfileId: item.targetProfile!.id,
                          keepData: 'merge'
                        })}
                      >
                        Merge Both Profiles
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          )}

          {isProcessed && (
            <div className="text-xs text-green-600 flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Action completed
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Recognition Review Queue
          </CardTitle>
          <CardDescription>
            Review and manage profile matches that require human judgment
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <div className="flex items-center justify-between mb-4">
              <TabsList>
                <TabsTrigger value="pending">
                  Pending ({reviewItems.filter(item => !processedItems.has(item.id)).length})
                </TabsTrigger>
                <TabsTrigger value="completed">Completed</TabsTrigger>
              </TabsList>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchReviewItems(selectedTab)}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3 mr-1" />
                )}
                Refresh
              </Button>
            </div>

            <TabsContent value="pending">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-6 w-6 animate-spin mr-2" />
                  <span>Loading review items...</span>
                </div>
              ) : error ? (
                <div className="text-center py-8">
                  <div className="text-red-600 mb-2">{error}</div>
                  <Button variant="outline" onClick={() => fetchReviewItems('pending')}>
                    Try Again
                  </Button>
                </div>
              ) : reviewItems.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No items pending review</p>
                  <p className="text-sm">Great job keeping up with the queue!</p>
                </div>
              ) : (
                <div>
                  {reviewItems.map(renderReviewItem)}
                </div>
              )}
            </TabsContent>

            <TabsContent value="completed">
              <div className="text-center py-8 text-gray-500">
                <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Completed reviews</p>
                <p className="text-sm">This would show previously reviewed items</p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}