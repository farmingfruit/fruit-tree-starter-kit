import { NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { donations } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all donations ordered by newest first
    const donationList = await db
      .select()
      .from(donations)
      .where() // TODO: Filter by churchId when we have proper session context
      .orderBy(desc(donations.donationDate));

    // Transform the data to match the frontend interface
    const transformedDonations = donationList.map(donation => ({
      id: donation.id,
      amount: donation.amount, // Already in cents
      currency: donation.currency,
      method: donation.method,
      status: donation.status,
      donorFirstName: donation.donorFirstName,
      donorLastName: donation.donorLastName,
      donorEmail: donation.donorEmail,
      categoryId: donation.categoryId || 'other',
      isAnonymous: donation.isAnonymous,
      notes: donation.notes,
      createdAt: donation.donationDate.toISOString(),
      stripePaymentIntentId: donation.stripePaymentIntentId,
    }));

    return NextResponse.json({
      success: true,
      donations: transformedDonations,
      count: transformedDonations.length
    });
  } catch (error) {
    console.error('Error fetching donations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    );
  }
}