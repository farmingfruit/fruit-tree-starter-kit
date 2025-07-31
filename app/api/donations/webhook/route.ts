import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { db } from '@/db/drizzle';
import { donations } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Stripe from 'stripe';

export async function POST(request: NextRequest) {
  const body = await request.text();
  const sig = request.headers.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error(`Webhook signature verification failed.`, err.message);
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      // Update donation record
      try {
        const charges = await stripe.charges.list({
          payment_intent: paymentIntent.id,
          limit: 1,
        });

        const charge = charges.data[0];
        const processorFee = charge?.balance_transaction ? 
          await stripe.balanceTransactions.retrieve(charge.balance_transaction as string)
            .then(bt => bt.fee) : 0;

        await db
          .update(donations)
          .set({
            status: 'completed',
            processedAt: new Date(),
            processorFee: processorFee,
            netAmount: paymentIntent.amount - processorFee,
            stripeCustomerId: paymentIntent.customer as string,
            updatedAt: new Date(),
          })
          .where(eq(donations.stripePaymentIntentId, paymentIntent.id));

        console.log(`✅ Payment completed for PaymentIntent: ${paymentIntent.id}`);
      } catch (error) {
        console.error('Error updating donation record:', error);
      }
      break;

    case 'payment_intent.payment_failed':
      const failedPaymentIntent = event.data.object as Stripe.PaymentIntent;
      
      try {
        await db
          .update(donations)
          .set({
            status: 'failed',
            updatedAt: new Date(),
          })
          .where(eq(donations.stripePaymentIntentId, failedPaymentIntent.id));

        console.log(`❌ Payment failed for PaymentIntent: ${failedPaymentIntent.id}`);
      } catch (error) {
        console.error('Error updating failed donation record:', error);
      }
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return NextResponse.json({ received: true });
}