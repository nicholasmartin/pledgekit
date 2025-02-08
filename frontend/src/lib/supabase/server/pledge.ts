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
  console.log('Updating pledge status:', { pledgeId, status, paymentIntentId, paymentMethodId })
  
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

  // First, verify the pledge exists
  const { data: existingPledge, error: fetchError } = await supabase
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

  // Now update the pledge
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

  if (error) {
    console.error('Error updating pledge:', error)
    throw new Error(`Failed to update pledge status: ${error.message}`)
  }

  if (!data || data.length === 0) {
    throw new Error('Pledge was not updated')
  }

  console.log('Successfully updated pledge:', data[0])
  return data[0]
}

export async function getUserProjectPledges(userId: string, projectId: string) {
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