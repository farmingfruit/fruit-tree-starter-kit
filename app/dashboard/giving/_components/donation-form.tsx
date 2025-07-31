"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
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
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface DonationFormProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface DonationFormData {
  amount: string;
  donorFirstName: string;
  donorLastName: string;
  donorEmail: string;
  donorPhone: string;
  categoryId: string;
  isAnonymous: boolean;
  notes: string;
}

const cardElementOptions = {
  style: {
    base: {
      fontSize: '16px',
      color: '#424770',
      '::placeholder': {
        color: '#aab7c4',
      },
    },
    invalid: {
      color: '#9e2146',
    },
  },
};

function DonationFormContent({ onClose, onSuccess }: { onClose: () => void; onSuccess?: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<DonationFormData>({
    amount: '',
    donorFirstName: '',
    donorLastName: '',
    donorEmail: '',
    donorPhone: '',
    categoryId: '',
    isAnonymous: false,
    notes: '',
  });

  const handleInputChange = (field: keyof DonationFormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    if (!formData.amount || parseFloat(formData.amount) < 0.50) {
      toast.error("Please enter an amount of at least $0.50");
      return;
    }

    setLoading(true);

    try {
      // Create payment intent
      const response = await fetch('/api/donations/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          ...formData,
        }),
      });

      const { clientSecret } = await response.json();

      // Confirm payment
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement!,
          billing_details: {
            name: `${formData.donorFirstName} ${formData.donorLastName}`,
            email: formData.donorEmail,
            phone: formData.donorPhone,
          },
        },
      });

      if (result.error) {
        toast.error(result.error.message || "Payment failed");
      } else {
        toast.success("Thank you for your donation! Payment completed successfully.");
        onSuccess?.(); // Refresh the transaction list
        onClose();
        // Reset form
        setFormData({
          amount: '',
          donorFirstName: '',
          donorLastName: '',
          donorEmail: '',
          donorPhone: '',
          categoryId: '',
          isAnonymous: false,
          notes: '',
        });
      }
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Amount */}
      <div>
        <Label htmlFor="amount">Donation Amount *</Label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            id="amount"
            type="number"
            min="0.50"
            step="0.01"
            placeholder="25.00"
            className="pl-8"
            value={formData.amount}
            onChange={(e) => handleInputChange('amount', e.target.value)}
            required
          />
        </div>
      </div>

      {/* Donor Information */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input
            id="firstName"
            value={formData.donorFirstName}
            onChange={(e) => handleInputChange('donorFirstName', e.target.value)}
            required
          />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input
            id="lastName"
            value={formData.donorLastName}
            onChange={(e) => handleInputChange('donorLastName', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <Label htmlFor="email">Email Address *</Label>
        <Input
          id="email"
          type="email"
          value={formData.donorEmail}
          onChange={(e) => handleInputChange('donorEmail', e.target.value)}
          required
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

      {/* Payment Method */}
      <div>
        <Label>Payment Information *</Label>
        <div className="mt-2 p-3 border rounded-md">
          <CardElement options={cardElementOptions} />
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          placeholder="Special instructions or dedication..."
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
        />
      </div>

      {/* Anonymous Option */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="anonymous"
          checked={formData.isAnonymous}
          onCheckedChange={(checked) => handleInputChange('isAnonymous', checked as boolean)}
        />
        <Label htmlFor="anonymous">Make this donation anonymous</Label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Heart className="mr-2 h-4 w-4" />
              Donate ${formData.amount || '0.00'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}

export default function DonationForm({ open, onClose, onSuccess }: DonationFormProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Process Online Donation
          </DialogTitle>
          <DialogDescription>
            Securely process a donation using Stripe payment processing.
          </DialogDescription>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <DonationFormContent onClose={onClose} onSuccess={onSuccess} />
        </Elements>
      </DialogContent>
    </Dialog>
  );
}