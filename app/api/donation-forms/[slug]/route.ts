import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { 
  donationForms, 
  donationFormCategories, 
  donationCategories,
  churches 
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Form slug is required' },
        { status: 400 }
      );
    }

    // Get the donation form with church info
    const formData = await db
      .select({
        form: donationForms,
        church: churches,
      })
      .from(donationForms)
      .leftJoin(churches, eq(churches.id, donationForms.churchId))
      .where(and(
        eq(donationForms.slug, slug),
        eq(donationForms.isActive, true)
      ))
      .limit(1);

    if (formData.length === 0) {
      return NextResponse.json(
        { error: 'Donation form not found' },
        { status: 404 }
      );
    }

    const { form, church } = formData[0];

    // Get the categories for this form
    const formCategories = await db
      .select({
        category: donationCategories,
        formCategory: donationFormCategories,
      })
      .from(donationFormCategories)
      .leftJoin(donationCategories, eq(donationCategories.id, donationFormCategories.categoryId))
      .where(eq(donationFormCategories.formId, form.id))
      .orderBy(donationFormCategories.sortOrder);

    // Transform categories
    const categories = formCategories
      .map(row => ({
        ...row.category,
        isDefault: row.formCategory?.isDefault || false,
        sortOrder: row.formCategory?.sortOrder || 0,
      }))
      .filter(cat => cat.id && cat.isActive); // Only active categories

    return NextResponse.json({
      success: true,
      form: {
        ...form,
        church: {
          id: church?.id,
          name: church?.name,
          address: church?.address,
          city: church?.city,
          state: church?.state,
          zipCode: church?.zipCode,
          phone: church?.phone,
          email: church?.email,
          website: church?.website,
        },
        categories,
      }
    });

  } catch (error) {
    console.error('Error fetching donation form:', error);
    return NextResponse.json(
      { error: 'Failed to fetch donation form' },
      { status: 500 }
    );
  }
}