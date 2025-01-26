import { cache } from 'react'
import type { UserType, UserDetails } from '@/types/external/supabase'
import { SupabaseError } from '../utils/errors'
import { createServer } from './server'

/**
 * Get the current authenticated user.
 * This is safe to use in Server Components as it revalidates with Supabase Auth.
 * NEVER use getSession() in server code - it isn't guaranteed to revalidate.
 */
export const getUser = cache(async () => {
  try {
    const supabase = createServer()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      throw new SupabaseError(
        'Error getting user',
        'AUTH_GET_USER_ERROR',
        error
      )
    }

    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
})

/**
 * Get user type with proper error handling and typing.
 * Returns 'company' | 'user' | null
 */
export const getUserType = cache(async (): Promise<UserType | null> => {
  try {
    const user = await getUser()
    if (!user) return null

    // First, check user metadata for explicit user type
    const userType = user.user_metadata?.user_type
    if (userType && (userType === 'company' || userType === 'user')) {
      return userType
    }

    // Check if user is part of any company_members
    const supabase = createServer()
    const { data: companyMember, error } = await supabase
      .from('company_members')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new SupabaseError(
        'Error checking company membership',
        'COMPANY_MEMBERSHIP_ERROR',
        error
      )
    }
    
    return companyMember ? 'company' : 'user'
  } catch (error) {
    console.error('Error getting user type:', error)
    return null
  }
})

/**
 * Get user details including company membership, cached for the request.
 * This is safe to use in server components as it validates the session.
 */
export const getUserDetails = cache(async (): Promise<UserDetails | null> => {
  try {
    const user = await getUser()
    if (!user) return null

    // Get company membership details
    const supabase = createServer()
    const { data: membership, error: membershipError } = await supabase
      .from('company_members')
      .select('role, company:companies(name)')
      .eq('user_id', user.id)
      .single()

    if (membershipError && membershipError.code !== 'PGRST116') {
      throw new SupabaseError(
        'Error getting company membership',
        'GET_MEMBERSHIP_ERROR',
        membershipError
      )
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
  try {
    const user = await getUser()
    if (!user) return false

    const supabase = createServer()
    const { data: membership, error } = await supabase
      .from('company_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new SupabaseError(
        'Error checking company access',
        'COMPANY_ACCESS_ERROR',
        error
      )
    }

    return !!membership
  } catch (error) {
    console.error('Error checking company access:', error)
    return false
  }
})
