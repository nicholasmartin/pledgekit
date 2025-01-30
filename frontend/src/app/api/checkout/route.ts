import { createRouteHandlerClient, getClientIp, rateLimit } from "@/lib/supabase/server/route-handlers"
import { NextResponse } from "next/server"
import { cookies } from 'next/headers'
import { createServer } from '@/lib/supabase/server'
import { stripe } from '@/lib/stripe'
import { Database } from '@/types/generated/database'
import { SupabaseError } from "@/lib/supabase/utils/errors"

/**
 * Rate limit configuration for payment operations
 */
const RATE_LIMITS = {
  checkout: { limit: 5, window: 300 }, // 5 attempts per 5 minutes
}

export const dynamic = 'force-dynamic'

type CreateCheckoutSessionData = {
  pledgeOptionId: string
  projectId: string
}

/**
 * POST /api/checkout
 * Creates a new checkout session for pledges
 */
export async function POST(request: Request) {
  // Apply strict rate limiting for payment operations
  const ip = getClientIp(request)
  const { success } = await rateLimit(
    ip,
    "checkout-create",
    RATE_LIMITS.checkout.limit,
    RATE_LIMITS.checkout.window
  )

  if (!success) {
    return new Response(
      JSON.stringify({ error: "Too many checkout attempts" }),
      { 
        status: 429,
        headers: { "Retry-After": RATE_LIMITS.checkout.window.toString() }
      }
    )
  }

  const result = await createRouteHandlerClient(request)
  if (result instanceof Response) return result

  const { supabase, session } = result

  try {
    // Must call cookies() before any Supabase calls
    cookies()

    // Parse and validate request data
    let data: CreateCheckoutSessionData
    try {
      data = await request.json()
      if (!data.pledgeOptionId || !data.projectId) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }
    } catch (error) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      )
    }

    // Verify user is authenticated using getUser as per SSR requirements
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      console.error('Authentication error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get pledge option details with proper type safety
    const { data: pledgeOption, error: pledgeError } = await supabase
      .from('pledge_options')
      .select('*, projects!inner(company_id, title)')
      .eq('id', data.pledgeOptionId)
      .single()

    if (pledgeError || !pledgeOption || !pledgeOption.projects) {
      console.error('Error fetching pledge option:', pledgeError)
      return NextResponse.json(
        { error: 'Pledge option not found' },
        { status: 404 }
      )
    }

    // Verify project exists and matches the pledge option
    if (pledgeOption.projects.company_id !== data.projectId) {
      return NextResponse.json(
        { error: 'Invalid project ID for this pledge option' },
        { status: 400 }
      )
    }

    // Create Stripe checkout session
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: pledgeOption.title,
                description: pledgeOption.description || undefined,
              },
              unit_amount: Math.round(pledgeOption.amount * 100), // Convert to cents
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${data.projectId}`,
        client_reference_id: `${data.projectId}:${data.pledgeOptionId}:${user.id}`,
        customer_email: user.email || undefined,
        metadata: {
          projectId: data.projectId,
          pledgeOptionId: data.pledgeOptionId,
          userId: user.id,
        },
      })

      return NextResponse.json({ id: session.id, url: session.url })
    } catch (stripeError) {
      console.error('Stripe session creation error:', stripeError)
      return NextResponse.json(
        { error: 'Failed to create checkout session' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Unexpected error in checkout route:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
