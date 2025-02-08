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
  console.log('Creating pledge with params:', {
    userId,
    projectId,
    pledgeOptionId,
    amount,
    status
  })

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
    console.error('Error creating pledge:', error)
    throw new Error(`Failed to create pledge: ${error.message}`)
  }

  if (!data) {
    throw new Error('No data returned from pledge creation')
  }

  console.log('Successfully created pledge:', data)
  return data
}

export async function updatePledgeStatus(
  pledgeId: string,
  status: Database['public']['Enums']['pledge_status'],
  paymentIntentId?: string,
  paymentMethodId?: string
) {
  console.log('Starting pledge status update:', {
    pledgeId,
    status,
    paymentIntentId,
    paymentMethodId
  })

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

  // First verify the pledge exists
  console.log('Verifying pledge exists:', pledgeId)
  const { data: existingPledge, error: fetchError } = await supabase
    .from('pledges')
    .select('*')
    .eq('id', pledgeId)
    .single()

  if (fetchError) {
    console.error('Error fetching pledge:', {
      error: fetchError,
      code: fetchError.code,
      details: fetchError.details,
      hint: fetchError.hint
    })
    throw new Error(`Failed to find pledge with ID ${pledgeId}: ${fetchError.message}`)
  }

  if (!existingPledge) {
    console.error('No pledge found with ID:', pledgeId)
    throw new Error(`No pledge found with ID ${pledgeId}`)
  }

  console.log('Found existing pledge:', existingPledge)

  // Now update the pledge
  console.log('Attempting to update pledge:', {
    id: pledgeId,
    currentStatus: existingPledge.status,
    newStatus: status
  })

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
    console.error('Error updating pledge:', {
      error,
      code: error.code,
      details: error.details,
      hint: error.hint
    })
    throw new Error(`Failed to update pledge status: ${error.message}`)
  }

  console.log('Successfully updated pledge:', data)
  return data
}

export async function getUserProjectPledges(userId: string, projectId: string) {
  console.log('Getting user project pledges:', { userId, projectId })

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

  // Use the database function that returns pledges with pledge option details
  const { data: pledges, error: pledgeError } = await supabase
    .rpc('get_user_project_pledges', {
      p_user_id: userId,
      p_project_id: projectId
    })

  if (pledgeError) {
    console.error('Error getting pledges:', {
      error: pledgeError,
      code: pledgeError.code,
      details: pledgeError.details,
      hint: pledgeError.hint
    })
    throw new Error(`Failed to get user project pledges: ${pledgeError.message}`)
  }

  console.log('Found pledges:', pledges || [])
  return pledges || []
}