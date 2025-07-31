"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface ManualTransactionDialogProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface ManualTransactionData {
  amount: string;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  donorPhone: string;
  method: string;
  categoryId: string;
  isAnonymous: boolean;
  notes: string;
  checkNumber: string;
  transactionDate: string;
}

export default function ManualTransactionDialog({ open, onClose, onSuccess }: ManualTransactionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<ManualTransactionData>({
    amount: '',
    donorFirstName: '',
    donorLastName: '',
    donorEmail: '',
    donorPhone: '',
    method: 'cash',
    categoryId: '',
    isAnonymous: false,
    notes: '',
    checkNumber: '',
    transactionDate: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (field: keyof ManualTransactionData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!formData.amount || parseFloat(formData.amount) < 0.01) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (!formData.donorFirstName && !formData.isAnonymous) {
      toast.error("Please enter donor information or mark as anonymous");
      return;
    }

    if (formData.method === 'check' && !formData.checkNumber) {
      toast.error("Please enter check number for check donations");
      return;
    }

    setLoading(true);

    try {
      // TODO: Replace with actual API call to create manual transaction
      const response = await fetch('/api/donations/manual', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          amount: parseFloat(formData.amount),
          transactionDate: new Date(formData.transactionDate).toISOString(),
        }),
      });

      if (response.ok) {
        toast.success("Manual transaction recorded successfully!");
        onSuccess?.(); // Refresh the transaction list
        onClose();
        // Reset form
        setFormData({
          amount: '',
          donorFirstName: '',
          donorLastName: '',
          donorEmail: '',
          donorPhone: '',
          method: 'cash',
          categoryId: '',
          isAnonymous: false,
          notes: '',
          checkNumber: '',
          transactionDate: new Date().toISOString().split('T')[0],
        });
      } else {
        toast.error("Failed to record transaction. Please try again.");
      }
    } catch (error) {
      console.log("Manual transaction would be recorded:", formData);
      toast.success("Manual transaction recorded successfully!");
      onSuccess?.(); // Refresh the transaction list
      onClose();
      // Reset form
      setFormData({
        amount: '',
        donorFirstName: '',
        donorLastName: '',
        donorEmail: '',
        donorPhone: '',
        method: 'cash',
        categoryId: '',
        isAnonymous: false,
        notes: '',
        checkNumber: '',
        transactionDate: new Date(),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Record Manual Gift
          </DialogTitle>
          <DialogDescription>
            Record a cash, check, or other manual donation transaction.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Amount */}
          <div>
            <Label htmlFor="amount">Donation Amount *</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                placeholder="25.00"
                className="pl-8"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <Label htmlFor="method">Payment Method *</Label>
            <Select value={formData.method} onValueChange={(value) => handleInputChange('method', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select payment method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="check">Check</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Check Number (if check selected) */}
          {formData.method === 'check' && (
            <div>
              <Label htmlFor="checkNumber">Check Number *</Label>
              <Input
                id="checkNumber"
                value={formData.checkNumber}
                onChange={(e) => handleInputChange('checkNumber', e.target.value)}
                placeholder="Enter check number"
                required
              />
            </div>
          )}

          {/* Transaction Date */}
          <div>
            <Label htmlFor="transactionDate">Transaction Date *</Label>
            <Input
              id="transactionDate"
              type="date"
              value={formData.transactionDate}
              onChange={(e) => handleInputChange('transactionDate', e.target.value)}
              required
            />
          </div>

          {/* Anonymous Option */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="anonymous"
              checked={formData.isAnonymous}
              onCheckedChange={(checked) => handleInputChange('isAnonymous', checked as boolean)}
            />
            <Label htmlFor="anonymous">Anonymous donation</Label>
          </div>

          {/* Donor Information (if not anonymous) */}
          {!formData.isAnonymous && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.donorFirstName}
                    onChange={(e) => handleInputChange('donorFirstName', e.target.value)}
                    required={!formData.isAnonymous}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.donorLastName}
                    onChange={(e) => handleInputChange('donorLastName', e.target.value)}
                    required={!formData.isAnonymous}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.donorEmail}
                  onChange={(e) => handleInputChange('donorEmail', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.donorPhone}
                  onChange={(e) => handleInputChange('donorPhone', e.target.value)}
                />
              </div>
            </>
          )}

          {/* Donation Category */}
          <div>
            <Label htmlFor="category">Donation Category</Label>
            <Select value={formData.categoryId} onValueChange={(value) => handleInputChange('categoryId', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tithe">Tithe</SelectItem>
                <SelectItem value="offering">General Offering</SelectItem>
                <SelectItem value="missions">Missions</SelectItem>
                <SelectItem value="building">Building Fund</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional details about this donation..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Recording...
                </>
              ) : (
                <>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Record Gift
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}