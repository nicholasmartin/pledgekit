import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { updatePledgeStatus } from '@/lib/supabase/server/pledge'
import type Stripe from 'stripe'

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
    switch (event.type) {
      case 'payment_intent.created': {
        // Log the creation of payment intent
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment intent created:', paymentIntent.id)
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        // Log completion but don't update status yet
        console.log('Checkout session completed:', session.id)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { pledgeId } = paymentIntent.metadata
        
        if (pledgeId) {
          await updatePledgeStatus(
            pledgeId,
            'completed',
            paymentIntent.id,
            paymentIntent.payment_method as string
          )
        } else {
          console.error('No pledgeId found in payment intent metadata')
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { pledgeId } = paymentIntent.metadata
        
        if (pledgeId) {
          await updatePledgeStatus(
            pledgeId,
            'failed',
            paymentIntent.id,
            paymentIntent.payment_method as string
          )
        }
        break
      }

      case 'charge.succeeded':
      case 'charge.updated':
        // Log these events but no action needed
        console.log(`${event.type} event received`)
        break

      default:
        console.log(`Unhandled event type ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Error processing webhook:', err)
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        details: err.message 
      },
      { status: 500 }
    )
  }
}