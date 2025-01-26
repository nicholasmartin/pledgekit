import { cookies } from 'next/headers'
import { cache } from 'react'
import { createServerSupabase } from './server-supabase'
import { Database } from './database.types'

export type UserDetails = {
  user: {
    id: string
    email?: string
    user_metadata: {
      company_name?: string
    }
  }
  membership?: {
    role: string
    company: {
      name: string
    } | null
  } | null
}

/**
 * Get the current authenticated user, cached for the request.
 * This is the safe way to get user data on the server as it validates with Supabase Auth.
 */
export const getUser = cache(async () => {
  // Call cookies() before any Supabase calls
  cookies()
  const supabase = createServerSupabase()
  
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
})

/**
 * Get user details including company membership, cached for the request.
 * This is safe to use in server components as it validates the session.
 */
export const getUserDetails = cache(async (): Promise<UserDetails | null> => {
  // Call cookies() before any Supabase calls
  cookies()
  const supabase = createServerSupabase()

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError) throw userError
    if (!user) return null

    // Get company membership details
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('role, company:companies(name)')
      .eq('user_id', user.id)
      .single()

    if (membershipError && membershipError.code !== 'PGRST116') {
      throw membershipError
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      },
      membership: membership
    }
  } catch (error) {
    console.error('Error getting user details:', error)
    return null
  }
})

/**
 * Check if the current user has access to a specific company
 */
export const hasCompanyAccess = cache(async (companyId: string): Promise<boolean> => {
  const user = await getUser()
  if (!user) return false

  const supabase = createServerSupabase()
  try {
    const { data: membership, error } = await supabase
      .from('company_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error checking company access:', error)
    }

    return !!membership
  } catch (error) {
    console.error('Error checking company access:', error)
    return false
  }
})
