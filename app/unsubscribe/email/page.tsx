"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Mail, AlertTriangle } from "lucide-react";

export default function EmailUnsubscribePage() {
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  
  const memberName = searchParams.get('member') || '';
  const email = searchParams.get('email') || '';
  const already = searchParams.get('already') === 'true';
  const memberId = searchParams.get('id') || '';

  const handleUnsubscribe = async () => {
    if (!memberId) return;

    try {
      setLoading(true);
      const response = await fetch(`/api/unsubscribe/email/${memberId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason,
          feedback,
        }),
      });

      if (response.ok) {
        setSuccess(true);
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Error unsubscribing:', error);
      // Handle error (show error message)
    } finally {
      setLoading(false);
    }
  };

  if (success || already) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle>
              {already ? "Already Unsubscribed" : "Unsubscribed Successfully"}
            </CardTitle>
            <CardDescription>
              {already 
                ? "You have already been unsubscribed from our email communications."
                : "You have been successfully unsubscribed from our email communications."
              }
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-sm text-muted-foreground">
              You will no longer receive email messages from our church.
            </p>
            
            <div className="p-4 bg-blue-50 rounded-lg text-left">
              <h4 className="font-medium text-blue-900 mb-2">Still want to stay connected?</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Visit our website for updates</li>
                <li>• Follow us on social media</li>
                <li>• Call the church office directly</li>
                <li>• Attend our services in person</li>
              </ul>
            </div>

            <p className="text-xs text-muted-foreground">
              If you unsubscribed by mistake, please contact our church office to resubscribe.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle>Unsubscribe from Email Communications</CardTitle>
          <CardDescription>
            We're sorry to see you go, {memberName}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              You are about to unsubscribe from all email communications from our church.
              This includes announcements, newsletters, and event notifications.
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="reason">Why are you unsubscribing? (Optional)</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="too_frequent">Too many emails</SelectItem>
                <SelectItem value="not_relevant">Content not relevant</SelectItem>
                <SelectItem value="moving">Moving away</SelectItem>
                <SelectItem value="changed_church">Changed churches</SelectItem>
                <SelectItem value="technical_issues">Technical issues</SelectItem>
                <SelectItem value="privacy_concerns">Privacy concerns</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="feedback">Additional feedback (Optional)</Label>
            <Textarea
              id="feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="How can we improve our communications?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Button 
              onClick={handleUnsubscribe}
              disabled={loading}
              className="w-full"
              variant="destructive"
            >
              {loading ? "Unsubscribing..." : "Confirm Unsubscribe"}
            </Button>
            
            <Button 
              onClick={() => window.history.back()}
              variant="outline"
              className="w-full"
            >
              Cancel
            </Button>
          </div>

          <div className="text-xs text-muted-foreground text-center space-y-2">
            <p>
              Email: {email}
            </p>
            <p>
              If you have any questions, please contact our church office.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}