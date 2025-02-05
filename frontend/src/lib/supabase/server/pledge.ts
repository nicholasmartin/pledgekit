import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/generated/database'

interface CreatePledgeParams {
  userId: string
  projectId: string
  pledgeOptionId: string
  amount: number
  paymentIntentId?: string
  paymentMethodId?: string
  status?: Database['public']['Enums']['pledge_status']
}

export async function getPledgeOptions(projectId: string) {
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

  const { data, error } = await supabase
    .from('pledge_options')
    .select('*')
    .eq('project_id', projectId)
    .order('amount', { ascending: true })

  if (error) {
    throw new Error(`Failed to get pledge options: ${error.message}`)
  }

  return data
}

export async function createPledge({
  userId,
  projectId,
  pledgeOptionId,
  amount,
  paymentIntentId,
  paymentMethodId,
  status = 'pending'
}: CreatePledgeParams) {
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

  const { data, error } = await supabase
    .from('pledges')
    .insert({
      user_id: userId,
      project_id: projectId,
      pledge_option_id: pledgeOptionId,
      amount,
      payment_intent_id: paymentIntentId,
      payment_method_id: paymentMethodId,
      status,
    })
    .select()
    .single()

  if (error) {
    throw new Error(`Failed to create pledge: ${error.message}`)
  }

  return data
}

export async function updatePledgeStatus(
  pledgeId: string,
  status: Database['public']['Enums']['pledge_status'],
  paymentIntentId?: string,
  paymentMethodId?: string
) {
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

  const { data, error } = await supabase
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
    throw new Error(`Failed to update pledge status: ${error.message}`)
  }

  return data
}

export async function getPledgeByPaymentIntentId(paymentIntentId: string) {
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

  const { data, error } = await supabase
    .from('pledges')
    .select('*')
    .eq('payment_intent_id', paymentIntentId)
    .single()

  if (error) {
    throw new Error(`Failed to get pledge: ${error.message}`)
  }

  return data
}