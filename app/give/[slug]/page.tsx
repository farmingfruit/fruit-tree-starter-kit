import { notFound } from 'next/navigation';
import DonationForm from './donation-form';

interface DonationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function getDonationForm(slug: string) {
  const baseUrl = process.env.NODE_ENV === 'production' 
    ? process.env.NEXT_PUBLIC_APP_URL 
    : 'http://localhost:3000';
    
  const response = await fetch(`${baseUrl}/api/donation-forms/${slug}`, {
    cache: 'no-store', // Always fetch fresh data for donation forms
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  return data.success ? data.form : null;
}

export default async function DonationPage({ params }: DonationPageProps) {
  const { slug } = await params;
  const form = await getDonationForm(slug);

  if (!form) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            {form.church?.name || 'Church'}
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-700 mb-4">
            {form.name}
          </h2>
          {form.description && (
            <p className="text-gray-600 text-lg">
              {form.description}
            </p>
          )}
        </div>

        {/* Donation Form */}
        <DonationForm form={form} />

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <p>Secure donations powered by Stripe</p>
          {form.church?.address && (
            <div className="mt-4 space-y-1">
              <p>{form.church.address}</p>
              {(form.church.city || form.church.state || form.church.zipCode) && (
                <p>
                  {[form.church.city, form.church.state, form.church.zipCode]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              )}
              {form.church.phone && <p>Phone: {form.church.phone}</p>}
              {form.church.email && <p>Email: {form.church.email}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Generate metadata for SEO
export async function generateMetadata({ params }: DonationPageProps) {
  const { slug } = await params;
  const form = await getDonationForm(slug);

  if (!form) {
    return {
      title: 'Donation Form Not Found',
    };
  }

  return {
    title: `${form.name} - ${form.church?.name || 'Church'} Donation`,
    description: form.description || `Support ${form.church?.name || 'our church'} through your generous giving.`,
    robots: 'noindex, nofollow', // Keep donation forms private from search engines
  };
}