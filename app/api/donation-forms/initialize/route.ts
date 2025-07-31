import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/drizzle';
import { 
  churches, 
  donationCategories, 
  donationForms, 
  donationFormCategories 
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

export async function POST(request: NextRequest) {
  try {
    const { churchId } = await request.json();
    
    if (!churchId) {
      return NextResponse.json(
        { error: 'Church ID is required' },
        { status: 400 }
      );
    }

    // Check if church exists
    const church = await db
      .select()
      .from(churches)
      .where(eq(churches.id, churchId))
      .limit(1);

    if (church.length === 0) {
      return NextResponse.json(
        { error: 'Church not found' },
        { status: 404 }
      );
    }

    // Check if default form already exists
    const existingForm = await db
      .select()
      .from(donationForms)
      .where(and(
        eq(donationForms.churchId, churchId),
        eq(donationForms.isDefault, true)
      ))
      .limit(1);

    if (existingForm.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Default form already exists',
        form: existingForm[0]
      });
    }

    // Get donation categories for this church
    const categories = await db
      .select()
      .from(donationCategories)
      .where(eq(donationCategories.churchId, churchId));

    // Create default categories if none exist
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Tithe', description: 'Regular tithe giving', sortOrder: 1 },
        { name: 'Offering', description: 'General offering', sortOrder: 2 },
        { name: 'Missions', description: 'Mission support and outreach', sortOrder: 3 },
        { name: 'Building', description: 'Building fund and maintenance', sortOrder: 4 },
        { name: 'Other', description: 'Other designated giving', sortOrder: 5 }
      ];

      for (const category of defaultCategories) {
        await db.insert(donationCategories).values({
          id: `category_${nanoid()}`,
          churchId,
          name: category.name,
          description: category.description,
          sortOrder: category.sortOrder,
          isActive: true,
        });
      }
    }

    // Get updated categories list
    const updatedCategories = await db
      .select()
      .from(donationCategories)
      .where(eq(donationCategories.churchId, churchId));

    // Create default donation form
    const formId = `form_${nanoid()}`;
    const defaultForm = {
      id: formId,
      churchId,
      name: 'General Giving',
      slug: 'give',
      description: 'Support our church through your generous giving',
      isActive: true,
      isDefault: true,
      allowAnonymous: true,
      requireDonorInfo: true,
      enableFeeCoverage: true,
      enableMultiFund: true,
      primaryColor: '#3B82F6',
      buttonText: 'Give Now',
      thankYouMessage: 'Thank you for your generous gift! Your support helps us continue our mission.',
      minimumAmount: 100, // $1.00
    };

    await db.insert(donationForms).values(defaultForm);

    // Link all categories to the form
    for (let i = 0; i < updatedCategories.length; i++) {
      const category = updatedCategories[i];
      await db.insert(donationFormCategories).values({
        id: `form_cat_${nanoid()}`,
        formId,
        categoryId: category.id,
        isDefault: category.name === 'Tithe', // Make Tithe the default selection
        sortOrder: category.sortOrder,
        isRequired: false,
      });
    }

    // Fetch the complete form with categories
    const formWithCategories = await db
      .select({
        form: donationForms,
        category: donationCategories,
        formCategory: donationFormCategories,
      })
      .from(donationForms)
      .leftJoin(donationFormCategories, eq(donationFormCategories.formId, donationForms.id))
      .leftJoin(donationCategories, eq(donationCategories.id, donationFormCategories.categoryId))
      .where(eq(donationForms.id, formId));

    return NextResponse.json({
      success: true,
      message: 'Default donation form created successfully',
      form: defaultForm,
      categories: formWithCategories.map(row => ({
        ...row.category,
        isDefault: row.formCategory?.isDefault || false,
        sortOrder: row.formCategory?.sortOrder || 0,
      })).filter(cat => cat.id), // Remove null categories
    });

  } catch (error) {
    console.error('Error initializing donation form:', error);
    return NextResponse.json(
      { error: 'Failed to initialize donation form' },
      { status: 500 }
    );
  }
}