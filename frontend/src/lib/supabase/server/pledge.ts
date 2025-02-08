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

interface UserProjectPledge {
  id: string
  user_id: string
  project_id: string
  pledge_option_id: string
  amount: number
  status: Database['public']['Enums']['pledge_status']
  payment_intent_id: string | null
  payment_method_id: string | null
  created_at: string
  updated_at: string
  pledge_option_title: string
  pledge_option_amount: number
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

export async function getPledgeByMetadata(
  userId: string,
  projectId: string,
  pledgeOptionId: string
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
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)
    .eq('pledge_option_id', pledgeOptionId)
    .single()

  if (error && error.code !== 'PGRST116') { // Ignore "no rows returned" error
    throw new Error(`Failed to get pledge: ${error.message}`)
  }

  return data
}

export async function getUserProjectPledges(userId: string, projectId: string): Promise<UserProjectPledge[]> {
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
    .rpc('get_user_project_pledges', {
      p_user_id: userId,
      p_project_id: projectId
    })

  if (error) {
    throw new Error(`Failed to get user project pledges: ${error.message}`)
  }

  return data || []
}