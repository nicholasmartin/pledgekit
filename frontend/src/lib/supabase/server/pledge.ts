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

  // First check if we have permission to create pledges
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) {
    console.error('Auth error when creating pledge:', authError)
    throw new Error(`Auth error: ${authError.message}`)
  }

  if (!authData.user) {
    throw new Error('No authenticated user found')
  }

  if (authData.user.id !== userId) {
    throw new Error('User ID mismatch')
  }

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
  console.log('Updating pledge status:', {
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

  // First, verify the pledge exists and get its details
  const { data: existingPledge, error: fetchError } = await supabase
    .from('pledges')
    .select('*')
    .eq('id', pledgeId)

  if (fetchError) {
    console.error('Error fetching pledge:', fetchError)
    throw new Error(`Failed to find pledge with ID ${pledgeId}: ${fetchError.message}`)
  }

  if (!existingPledge || existingPledge.length === 0) {
    console.error('No pledge found with ID:', pledgeId)
    throw new Error(`No pledge found with ID ${pledgeId}`)
  }

  console.log('Found existing pledge:', existingPledge[0])

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

  // First verify the user exists
  const { data: authData, error: authError } = await supabase.auth.getUser()
  if (authError) {
    console.error('Auth error when getting pledges:', authError)
    throw new Error(`Auth error: ${authError.message}`)
  }

  if (!authData.user) {
    throw new Error('No authenticated user found')
  }

  if (authData.user.id !== userId) {
    throw new Error('User ID mismatch')
  }

  // Get pledges directly first to verify RLS
  const { data: pledges, error: pledgeError } = await supabase
    .from('pledges')
    .select('*')
    .eq('user_id', userId)
    .eq('project_id', projectId)

  if (pledgeError) {
    console.error('Error getting pledges directly:', pledgeError)
  } else {
    console.log('Found pledges directly:', pledges)
  }

  // Now try the RPC
  const { data, error } = await supabase
    .rpc('get_user_project_pledges', {
      p_user_id: userId,
      p_project_id: projectId
    })

  if (error) {
    console.error('Error getting user project pledges:', error)
    throw new Error(`Failed to get user project pledges: ${error.message}`)
  }

  console.log('Successfully got user project pledges:', data || [])
  return data || []
}