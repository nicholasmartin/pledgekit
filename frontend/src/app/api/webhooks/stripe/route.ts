import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { updatePledgeStatus, getPledgeByMetadata } from '@/lib/supabase/server/pledge'
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
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        if (!session.payment_intent) {
          console.error('Payment Intent ID is missing from the session')
          return NextResponse.json({ error: 'Payment Intent ID is missing' }, { status: 400 })
        }

        // Just log the completion of checkout session
        console.log('Checkout session completed:', session.id)
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { userId, projectId, pledgeOptionId } = paymentIntent.metadata
        
        const pledge = await getPledgeByMetadata(userId, projectId, pledgeOptionId)
        
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
        const { userId, projectId, pledgeOptionId } = paymentIntent.metadata
        
        const pledge = await getPledgeByMetadata(userId, projectId, pledgeOptionId)
        
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
      { 
        error: 'Webhook handler failed',
        details: err.message 
      },
      { status: 500 }
    )
  }
}