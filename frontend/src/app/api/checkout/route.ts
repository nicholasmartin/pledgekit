import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { stripe } from '@/lib/stripe'
import type { Database } from '@/types/generated/database'

// Create a Supabase client with the service role key for admin operations
const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

async function createPledge({
  userId,
  projectId,
  pledgeOptionId,
  amount,
}: {
  userId: string
  projectId: string
  pledgeOptionId: string
  amount: number
}) {
  console.log('Creating pledge with params:', {
    userId,
    projectId,
    pledgeOptionId,
    amount
  })

  const { data, error } = await adminClient
    .from('pledges')
    .insert({
      user_id: userId,
      project_id: projectId,
      pledge_option_id: pledgeOptionId,
      amount,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating pledge:', error)
    throw new Error(`Failed to create pledge: ${error.message}`)
  }

  console.log('Successfully created pledge:', data)
  return data
}

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
    console.log('Received pledge request:', { pledgeOptionId, projectId })

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
      console.error('Failed to get pledge option:', pledgeError)
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
      console.error('Failed to get company:', companyError)
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

    // Verify pledge doesn't already exist
    const { data: existingPledge, error: existingError } = await supabase
      .from('pledges')
      .select('*')
      .eq('user_id', user.id)
      .eq('project_id', projectId)
      .eq('pledge_option_id', pledgeOptionId)
      .single()

    if (existingPledge) {
      console.log('Found existing pledge:', existingPledge)
      throw new Error('You have already pledged this amount to this project')
    }

    if (existingError && existingError.code !== 'PGRST116') {
      console.error('Error checking for existing pledge:', existingError)
      throw existingError
    }

    // Create initial pledge record using service role client
    const pledge = await createPledge({
      userId: user.id,
      projectId,
      pledgeOptionId,
      amount: pledgeOption.amount,
    })

    console.log('Created pledge record:', pledge)

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      payment_intent_data: {
        metadata: {
          pledgeId: pledge.id,
          userId: user.id,
          projectId,
          pledgeOptionId,
        },
      },
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
    })

    console.log('Created Stripe session:', {
      sessionId: session.id,
      paymentIntent: session.payment_intent,
      metadata: {
        pledgeId: pledge.id,
        userId: user.id,
        projectId,
        pledgeOptionId,
      }
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
