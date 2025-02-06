import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { updatePledgeStatus, getPledgeByPaymentIntentId } from '@/lib/supabase/server/pledge'
import type Stripe from 'stripe'

// This is your Stripe webhook secret for testing your endpoint locally.
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: Request) {
  const body = await request.text()
  const sig = headers().get('stripe-signature')

  let event: Stripe.Event

  try {
    if (!sig) throw new Error('No signature found')
    event = stripe.webhooks.constructEvent(body, sig, endpointSecret)
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: err.message }, { status: 400 })
  }

  try {
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const pledge = await getPledgeByPaymentIntentId(paymentIntent.id)
        
        if (pledge) {
          await updatePledgeStatus(
            pledge.id,
            'completed',
            paymentIntent.id,
            paymentIntent.payment_method as string
          )
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const pledge = await getPledgeByPaymentIntentId(paymentIntent.id)
        
        if (pledge) {
          await updatePledgeStatus(
            pledge.id,
            'failed',
            paymentIntent.id,
            paymentIntent.payment_method as string
          )
        }
        break
      }

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Error processing webhook:', err)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}