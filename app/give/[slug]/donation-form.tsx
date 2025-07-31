"use client";

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Heart, 
  Plus, 
  X, 
  Lock 
} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

interface DonationCategory {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  sortOrder: number;
}

interface Church {
  id: string;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  phone?: string;
  email?: string;
  website?: string;
}

interface DonationForm {
  id: string;
  churchId: string;
  name: string;
  slug: string;
  description?: string;
  enableFeeCoverage: boolean;
  enableMultiFund: boolean;
  allowAnonymous: boolean;
  requireDonorInfo: boolean;
  primaryColor: string;
  buttonText: string;
  thankYouMessage?: string;
  minimumAmount: number;
  church: Church;
  categories: DonationCategory[];
}

interface FundAllocation {
  id: string;
  categoryId: string;
  amount: string;
}

interface DonorInfo {
  firstName: string;
  lastName: string;
  email: string;
}

// Use Tithe.ly's exact fee calculation formula
const PROCESSING_RATE = 0.029; // 2.9% for Visa/MC
const FIXED_FEE = 0.30; // $0.30

const calculateProcessingCosts = (giftAmount: number): number => {
  // Tithe.ly formula: (G + 0.30) / (1 - (P / 100)) rounded up to nearest cent
  const totalCharge = (giftAmount + FIXED_FEE) / (1 - PROCESSING_RATE);
  const processingCost = totalCharge - giftAmount;
  
  // Always round UP to nearest cent
  return Math.ceil(processingCost * 100) / 100;
};

const MAX_FUND_ALLOCATIONS = 5;

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

function DonationFormContent({ form }: { form: DonationForm }) {
  const stripe = useStripe();
  const elements = useElements();
  
  // Initialize with default fund allocation immediately
  const defaultCategory = form.categories.find(cat => cat.isDefault) || form.categories[0];
  const initialAllocation = defaultCategory ? [{
    id: `fund-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
    categoryId: defaultCategory.id,
    amount: ''
  }] : [];
  
  // State management
  const [fundAllocations, setFundAllocations] = useState<FundAllocation[]>(initialAllocation);
  const [coverProcessingFees, setCoverProcessingFees] = useState(false);
  const [donorInfo, setDonorInfo] = useState<DonorInfo>({
    firstName: '',
    lastName: '',
    email: '',
  });
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');


  // Calculate totals
  const calculateTotalAmount = () => {
    return fundAllocations.reduce((sum, allocation) => {
      const amount = parseFloat(allocation.amount || '0');
      return sum + amount;
    }, 0);
  };

  const donationAmount = calculateTotalAmount();
  const processingCostAmount = calculateProcessingCosts(donationAmount); // Always calculate for display
  const totalCharge = donationAmount + (coverProcessingFees ? processingCostAmount : 0);

  // Get available categories (not already selected)
  const getAvailableCategories = (currentId?: string) => {
    const selectedIds = fundAllocations
      .map(f => f.categoryId)
      .filter(id => id !== currentId);
    return form.categories.filter(cat => !selectedIds.includes(cat.id));
  };

  // Add fund allocation
  const addFundAllocation = () => {
    if (fundAllocations.length >= MAX_FUND_ALLOCATIONS) return;
    
    const availableCategories = getAvailableCategories();
    if (availableCategories.length === 0) return;

    setFundAllocations([...fundAllocations, {
      id: `fund-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`,
      categoryId: availableCategories[0].id,
      amount: ''
    }]);
  };

  // Remove fund allocation
  const removeFundAllocation = (id: string) => {
    setFundAllocations(fundAllocations.filter(f => f.id !== id));
  };

  // Update fund category
  const updateFundCategory = (id: string, categoryId: string) => {
    setFundAllocations(fundAllocations.map(f => 
      f.id === id ? { ...f, categoryId } : f
    ));
  };

  // Update fund amount
  const updateFundAmount = (id: string, amount: string) => {
    setFundAllocations(fundAllocations.map(f => 
      f.id === id ? { ...f, amount } : f
    ));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    if (!stripe || !elements) {
      setError('Payment system not loaded. Please refresh the page.');
      setIsProcessing(false);
      return;
    }

    try {
      // Validation
      const donationAmountCents = Math.round(donationAmount * 100);
      if (donationAmountCents < form.minimumAmount) {
        throw new Error(`Minimum donation amount is $${(form.minimumAmount / 100).toFixed(2)}`);
      }

      if (form.requireDonorInfo) {
        if (!donorInfo.firstName || !donorInfo.lastName || !donorInfo.email) {
          throw new Error('Please fill in all required donor information');
        }
      }

      // Build fund allocations
      const processedAllocations = fundAllocations
        .filter(f => parseFloat(f.amount || '0') > 0)
        .map(f => ({
          categoryId: f.categoryId,
          amount: Math.round(parseFloat(f.amount) * 100)
        }));

      if (processedAllocations.length === 0) {
        throw new Error('Please enter a donation amount');
      }

      // Create payment intent
      const response = await fetch('/api/donations/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalCharge, // Include processing fees if covered
          donorFirstName: donorInfo.firstName,
          donorLastName: donorInfo.lastName,
          donorEmail: donorInfo.email,
          categoryId: processedAllocations[0]?.categoryId, // Primary fund
          notes: notes.trim() || null,
          isAnonymous: false,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create payment intent');
      }

      const { clientSecret } = await response.json();

      // Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement!,
          billing_details: {
            name: `${donorInfo.firstName} ${donorInfo.lastName}`,
            email: donorInfo.email,
          },
        },
      });

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed');
      } else {
        setSuccess(form.thankYouMessage || 'Thank you for your generous donation!');
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsProcessing(false);
    }
  };

  if (success) {
    return (
      <Card className="w-full">
        <CardContent className="text-center py-12">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <Heart className="h-8 w-8 text-green-600 fill-current" />
          </div>
          <h3 className="text-2xl font-semibold mb-4">Thank You!</h3>
          <p className="text-gray-600">{success}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" style={{ color: form.primaryColor }} />
          Make a Donation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Fund Allocations */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <Label className="text-lg font-semibold">Donation Amount</Label>
              {form.enableMultiFund && fundAllocations.length < MAX_FUND_ALLOCATIONS && getAvailableCategories().length > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addFundAllocation}
                  className="text-xs h-8"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add Fund
                </Button>
              )}
            </div>

            {/* Fund allocation rows */}
            <div className="space-y-6">
              {fundAllocations.map((allocation, index) => {
                const availableCategories = getAvailableCategories(allocation.categoryId);
                const currentCategory = form.categories.find(c => c.id === allocation.categoryId);
                
                return (
                  <div key={allocation.id} className="flex items-center gap-4">
                    {/* Amount input - large and prominent, consistent width */}
                    <div className="relative w-48 shrink-0">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-4xl font-bold text-gray-700 z-10">$</span>
                      <Input
                        type="number"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        className="pl-12 pr-4 text-4xl font-bold h-20 text-center border-2 focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none w-full"
                        style={{ fontSize: '24px', fontWeight: 'bold' }}
                        value={allocation.amount}
                        onChange={(e) => updateFundAmount(allocation.id, e.target.value)}
                        autoFocus={index === 0}
                        onWheel={(e) => e.currentTarget.blur()} // Prevent scroll from changing value
                      />
                    </div>
                    
                    {/* Fund selection - takes remaining space */}
                    <div className="flex-1 min-w-0">
                      <Select 
                        value={allocation.categoryId} 
                        onValueChange={(value) => updateFundCategory(allocation.id, value)}
                      >
                        <SelectTrigger className="h-20 text-base">
                          <SelectValue placeholder="Select fund" />
                        </SelectTrigger>
                        <SelectContent>
                          {/* All available categories including current - use unique keys */}
                          {form.categories.filter(cat => 
                            cat.id === allocation.categoryId || 
                            !fundAllocations.some(f => f.id !== allocation.id && f.categoryId === cat.id)
                          ).map((category, catIndex) => (
                            <SelectItem key={`${allocation.id}-${category.id}-${catIndex}`} value={category.id}>
                              <div>
                                <div className="font-medium">{category.name}</div>
                                {category.description && (
                                  <div className="text-xs text-muted-foreground">
                                    {category.description}
                                  </div>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Remove button - fixed width */}
                    {fundAllocations.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="h-20 w-20 text-gray-400 hover:text-gray-600 hover:bg-gray-100 shrink-0"
                        onClick={() => removeFundAllocation(allocation.id)}
                      >
                        <X className="h-5 w-5" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Multi-fund indicator */}
            {fundAllocations.length > 1 && (
              <p className="text-sm text-muted-foreground text-center">
                Splitting donation across {fundAllocations.length} funds
              </p>
            )}
          </div>

          {/* Processing Fees - Tithe.ly style Yes/No buttons */}
          {form.enableFeeCoverage && donationAmount > 0 && (
            <div className="space-y-4">
              <Label className="text-base font-medium">Cover processing fees?</Label>
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant={coverProcessingFees ? "default" : "outline"}
                  className="flex-1 h-12 text-base font-medium"
                  style={coverProcessingFees ? { backgroundColor: form.primaryColor } : {}}
                  onClick={() => setCoverProcessingFees(true)}
                >
                  Yes
                </Button>
                <Button
                  type="button"
                  variant={!coverProcessingFees ? "default" : "outline"}
                  className="flex-1 h-12 text-base font-medium"
                  style={!coverProcessingFees ? { backgroundColor: form.primaryColor } : {}}
                  onClick={() => setCoverProcessingFees(false)}
                >
                  No
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center">
                {donationAmount > 0 ? (
                  coverProcessingFees ? (
                    <span>Processing fee: +${processingCostAmount.toFixed(2)} - Thank you for covering the costs!</span>
                  ) : (
                    <span>Cover the fees of ${processingCostAmount.toFixed(2)}</span>
                  )
                ) : (
                  <span>Enter donation amount to see processing fees</span>
                )}
              </p>
            </div>
          )}

          {/* Donor Information */}
          {form.requireDonorInfo && (
            <div className="space-y-4">
              <Label className="text-lg font-semibold">Donor Information</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    className="h-11"
                    value={donorInfo.firstName}
                    onChange={(e) => setDonorInfo({ ...donorInfo, firstName: e.target.value })}
                    required={form.requireDonorInfo}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    className="h-11"
                    value={donorInfo.lastName}
                    onChange={(e) => setDonorInfo({ ...donorInfo, lastName: e.target.value })}
                    required={form.requireDonorInfo}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    className="h-11"
                    value={donorInfo.email}
                    onChange={(e) => setDonorInfo({ ...donorInfo, email: e.target.value })}
                    required={form.requireDonorInfo}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Payment Information */}
          <div className="space-y-4">
            <Label className="text-lg font-semibold">Payment Information *</Label>
            <div className="p-4 border-2 rounded-lg bg-gray-50">
              <CardElement options={cardElementOptions} />
            </div>
            <p className="text-sm text-gray-500">
              <Lock className="inline h-4 w-4 mr-1" />
              Your payment information is secure and encrypted
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Note/Memo (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Add a note or memo for this donation..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              className="resize-none"
            />
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Submit Button - Clean total display */}
          <div className="space-y-4 border-t pt-6">
            <Button
              type="submit"
              className="w-full py-6 text-xl font-bold"
              style={{ backgroundColor: form.primaryColor }}
              disabled={isProcessing || donationAmount === 0 || !stripe}
            >
              {isProcessing ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3" />
                  Processing...
                </>
              ) : (
                <>
                  <Lock className="mr-3 h-6 w-6" />
                  {form.buttonText} ${totalCharge.toFixed(2)}
                </>
              )}
            </Button>

            {/* Security Notice */}
            <div className="text-center text-sm text-gray-500">
              <Lock className="inline h-4 w-4 mr-1" />
              Secure payments powered by Stripe
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function DonationForm({ form }: { form: DonationForm }) {
  return (
    <Elements stripe={stripePromise}>
      <DonationFormContent form={form} />
    </Elements>
  );
}