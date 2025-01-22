import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { stripe } from '@/lib/stripe';
import { CreateCheckoutSessionData } from '@/types/stripe';

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const data: CreateCheckoutSessionData = await request.json();
    const { pledgeOptionId, projectId } = data;

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get pledge option details
    const { data: pledgeOption, error: pledgeError } = await supabase
      .from('pledge_options')
      .select('*, projects(company_id, title)')
      .eq('id', pledgeOptionId)
      .single();

    if (pledgeError || !pledgeOption) {
      return NextResponse.json(
        { error: 'Pledge option not found' },
        { status: 404 }
      );
    }

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
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}`,
      client_reference_id: `${projectId}:${pledgeOptionId}:${user.id}`,
      customer_email: user.email,
      metadata: {
        projectId,
        pledgeOptionId,
        userId: user.id,
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
