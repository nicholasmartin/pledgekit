import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/types/generated/database'

// Create a Supabase client with the service role key for admin operations
// This should only be used in server-side code (API routes, webhooks)
if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
}

export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Helper functions for admin operations
export async function adminUpdatePledgeStatus(
  pledgeId: string,
  status: Database['public']['Enums']['pledge_status'],
  paymentIntentId?: string,
  paymentMethodId?: string
) {
  console.log('Admin updating pledge status:', {
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

  // Now update the pledge
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