import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db/drizzle';
import { donations } from '@/db/schema';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      currency = 'usd',
      donorEmail,
      donorFirstName,
      donorLastName,
      donorPhone,
      categoryId,
      memberId,
      isAnonymous = false,
      notes
    } = body;

    // Validate amount (amount comes in dollars from frontend)
    if (!amount || amount < 0.50) { // Minimum $0.50
      return NextResponse.json(
        { error: 'Amount must be at least $0.50' },
        { status: 400 }
      );
    }

    // Create payment intent with Stripe
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toLowerCase(),
      metadata: {
        donorEmail: donorEmail || '',
        donorFirstName: donorFirstName || '',
        donorLastName: donorLastName || '',
        donorPhone: donorPhone || '',
        categoryId: categoryId || '',
        memberId: memberId || '',
        isAnonymous: isAnonymous.toString(),
        notes: notes || '',
      },
    });

    // Create donation record in database
    const donationId = nanoid();
    await db.insert(donations).values({
      id: donationId,
      churchId: 'church_1', // TODO: Get from session/context
      memberId: memberId || null,
      categoryId: categoryId || null,
      donorFirstName: donorFirstName || null,
      donorLastName: donorLastName || null,
      donorEmail: donorEmail || null,
      donorPhone: donorPhone || null,
      amount: Math.round(amount * 100),
      currency: currency.toUpperCase(),
      method: 'card',
      status: 'pending',
      stripePaymentIntentId: paymentIntent.id,
      isAnonymous: isAnonymous,
      isTestMode: true, // Always true for test keys
      notes: notes || null,
      donationDate: new Date(),
    });

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      donationId: donationId,
    });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}