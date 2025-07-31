import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { donations } from '@/db/schema';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      amount, 
      currency = 'USD',
      donorEmail,
      donorFirstName,
      donorLastName,
      donorPhone,
      categoryId,
      method = 'cash',
      isAnonymous = false,
      notes,
      checkNumber,
      transactionDate
    } = body;

    // Validate required fields
    if (!amount || amount < 0.01) {
      return NextResponse.json(
        { error: 'Amount must be at least $0.01' },
        { status: 400 }
      );
    }

    if (!isAnonymous && (!donorFirstName || !donorLastName)) {
      return NextResponse.json(
        { error: 'Donor name is required for non-anonymous donations' },
        { status: 400 }
      );
    }

    if (method === 'check' && !checkNumber) {
      return NextResponse.json(
        { error: 'Check number is required for check donations' },
        { status: 400 }
      );
    }

    // Create manual donation record in database
    const donationId = nanoid();
    const donationDate = transactionDate ? new Date(transactionDate) : new Date();
    
    await db.insert(donations).values({
      id: donationId,
      churchId: 'church_1', // TODO: Get from session/context
      memberId: null, // Manual donations don't automatically link to members
      categoryId: categoryId || null,
      donorFirstName: isAnonymous ? null : donorFirstName,
      donorLastName: isAnonymous ? null : donorLastName,
      donorEmail: isAnonymous ? null : donorEmail,
      donorPhone: isAnonymous ? null : donorPhone,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency.toUpperCase(),
      method: method,
      status: 'completed', // Manual donations are immediately completed
      stripePaymentIntentId: null,
      isAnonymous: isAnonymous,
      isTestMode: true, // Set to true for development
      notes: notes || null,
      checkNumber: method === 'check' ? checkNumber : null,
      donationDate: donationDate,
      processedAt: new Date(),
      netAmount: Math.round(amount * 100), // No processing fees for manual donations
      processorFee: 0,
    });

    return NextResponse.json({
      success: true,
      donationId: donationId,
      message: 'Manual donation recorded successfully'
    });
  } catch (error) {
    console.error('Error recording manual donation:', error);
    return NextResponse.json(
      { error: 'Failed to record manual donation' },
      { status: 500 }
    );
  }
}