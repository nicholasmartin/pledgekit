import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import type { Database } from '@/types/generated/database'

export async function POST(request: Request) {
  try {
    const cookieStore = cookies()
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
        },
      }
    )

    const { pledgeOptionId, projectId } = await request.json()

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get pledge option details and company slug
    const { data: pledgeOption, error: pledgeError } = await supabase
      .from('pledge_options')
      .select('*, projects!inner(title, company_id)')
      .eq('id', pledgeOptionId)
      .single()

    if (pledgeError || !pledgeOption || !pledgeOption.projects) {
      return NextResponse.json(
        { error: 'Pledge option not found' },
        { status: 404 }
      )
    }

    // Get company slug
    const { data: company, error: companyError } = await supabase
      .from('companies')
      .select('slug')
      .eq('id', pledgeOption.projects.company_id)
      .single()

    if (companyError || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      )
    }

    // Get origin from request headers
    const origin = request.headers.get('origin') || request.headers.get('referer')
    if (!origin) {
      throw new Error('No origin or referer found in request headers')
    }

    const projectPath = `/companies/${company.slug}/projects/${projectId}`

    // Create Stripe checkout session
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
      success_url: `${origin}${projectPath}?success=true`,
      cancel_url: `${origin}${projectPath}?canceled=true`,
      metadata: {
        projectId,
        pledgeOptionId,
        userId: user.id,
      },
    })

    // Return redirect URL
    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error('Stripe session creation error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to create checkout session',
        details: error.message 
      },
      { status: 500 }
    )
  }
}
