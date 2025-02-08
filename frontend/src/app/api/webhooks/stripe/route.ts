import { headers } from 'next/headers'
import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@supabase/supabase-js'
import type Stripe from 'stripe'
import type { Database } from '@/types/generated/database'

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!

// Create admin client for webhook operations
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for webhook operations')
}

const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function updatePledgeStatus(
  pledgeId: string,
  status: Database['public']['Enums']['pledge_status'],
  paymentIntentId: string,
  paymentMethodId: string
) {
  console.log('Updating pledge status:', {
    pledgeId,
    status,
    paymentIntentId,
    paymentMethodId
  })

  // First verify the pledge exists
  const { data: existingPledge, error: fetchError } = await adminClient
    .from('pledges')
    .select('*')
    .eq('id', pledgeId)
    .single()

  if (fetchError) {
    console.error('Error fetching pledge:', fetchError)
    throw new Error(`Failed to find pledge with ID ${pledgeId}: ${fetchError.message}`)
  }

  if (!existingPledge) {
    throw new Error(`No pledge found with ID ${pledgeId}`)
  }

  console.log('Found existing pledge:', existingPledge)

  // Now update the pledge using admin client
  const { data, error } = await adminClient
    .from('pledges')
    .update({
      status,
      payment_intent_id: paymentIntentId,
      payment_method_id: paymentMethodId,
      updated_at: new Date().toISOString(),
    })
    .eq('id', pledgeId)
    .select()
    .single()

  if (error) {
    console.error('Error updating pledge:', error)
    throw new Error(`Failed to update pledge status: ${error.message}`)
  }

  console.log('Successfully updated pledge:', data)
  return data
}

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
    console.log(`Processing webhook event: ${event.type}`, {
      id: event.id,
      type: event.type,
      created: new Date(event.created * 1000).toISOString()
    })

    switch (event.type) {
      case 'payment_intent.created': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        console.log('Payment intent created:', {
          id: paymentIntent.id,
          metadata: paymentIntent.metadata
        })
        break
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        console.log('Checkout session completed:', {
          id: session.id,
          paymentIntent: session.payment_intent,
          metadata: session.metadata
        })
        break
      }

      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { pledgeId } = paymentIntent.metadata
        
        console.log('Payment intent succeeded:', {
          id: paymentIntent.id,
          metadata: paymentIntent.metadata,
          pledgeId
        })

        if (pledgeId) {
          try {
            const updatedPledge = await updatePledgeStatus(
              pledgeId,
              'completed',
              paymentIntent.id,
              paymentIntent.payment_method as string
            )
            console.log('Successfully updated pledge:', updatedPledge)
          } catch (error: any) {
            console.error('Failed to update pledge:', {
              error: error.message,
              pledgeId,
              paymentIntentId: paymentIntent.id
            })
            throw error // Re-throw to be caught by outer try-catch
          }
        } else {
          console.error('No pledgeId found in payment intent metadata:', paymentIntent)
        }
        break
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { pledgeId } = paymentIntent.metadata
        
        console.log('Payment intent failed:', {
          id: paymentIntent.id,
          metadata: paymentIntent.metadata,
          pledgeId
        })

        if (pledgeId) {
          try {
            const updatedPledge = await updatePledgeStatus(
              pledgeId,
              'failed',
              paymentIntent.id,
              paymentIntent.payment_method as string
            )
            console.log('Successfully updated pledge status to failed:', updatedPledge)
          } catch (error: any) {
            console.error('Failed to update pledge status:', {
              error: error.message,
              pledgeId,
              paymentIntentId: paymentIntent.id
            })
            throw error
          }
        }
        break
      }

      case 'charge.succeeded':
      case 'charge.updated':
        console.log(`${event.type} event received:`, {
          id: event.id,
          data: event.data.object
        })
        break

      default:
        console.log(`Unhandled event type ${event.type}:`, {
          id: event.id,
          data: event.data.object
        })
    }

    return NextResponse.json({ received: true })
  } catch (err: any) {
    console.error('Error processing webhook:', {
      error: err.message,
      eventType: event.type,
      eventId: event.id
    })
    return NextResponse.json(
      { 
        error: 'Webhook handler failed',
        details: err.message 
      },
      { status: 500 }
    )
  }
}