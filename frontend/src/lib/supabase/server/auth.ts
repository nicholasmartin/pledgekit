import { cache } from 'react'
import type { SupabaseClient, User } from '@supabase/supabase-js'
import { UserType, isUserType } from '@/types/external/supabase/auth'
import type { UserDetails } from '@/types/external/supabase'
import { AuthError, DatabaseError } from '../utils/errors'
import { createServer } from './server'
import { toUserDetails } from '@/types/transformers/user'
import { rateLimit } from '@/lib/rate-limit'

/**
 * Get the current authenticated user.
 * This is safe to use in Server Components as it revalidates with Supabase Auth.
 * NEVER use getSession() in server code - it isn't guaranteed to revalidate.
 */
export const getUser = cache(async (supabase?: SupabaseClient | null) => {
  try {
    const client = supabase ?? createServer()
    const { data: { user }, error } = await client.auth.getUser()
    
    if (error) {
      throw new AuthError({
        message: 'Failed to get user',
        cause: error,
        code: 'AUTH_GET_USER_ERROR'
      })
    }

    return user
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError({
      message: 'Unexpected error getting user',
      cause: error,
      code: 'AUTH_UNEXPECTED_ERROR'
    })
  }
})

/**
 * Get user type with proper error handling and typing.
 * Returns 'company' | 'user' | null
 */
export const getUserType = cache(async (supabase?: SupabaseClient | null): Promise<UserType | null> => {
  try {
    const client = supabase ?? createServer()
    const user = await getUser(client)
    if (!user) return null

    // Rate limit check
    await rateLimit(user.id, 'get-user-type', 10, '1m')

    // First, check user metadata for explicit user type
    const userType = user.user_metadata?.user_type
    if (userType && isUserType(userType)) {
      return userType
    }

    // Check if user is part of any company_members
    const { data: companyMember, error } = await client
      .from('company_members')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new DatabaseError({
        message: 'Failed to check company membership',
        cause: error,
        code: 'COMPANY_MEMBERSHIP_ERROR'
      })
    }
    
    return companyMember ? UserType.COMPANY : UserType.USER
  } catch (error) {
    if (error instanceof AuthError || error instanceof DatabaseError) throw error
    throw new AuthError({
      message: 'Unexpected error getting user type',
      cause: error,
      code: 'AUTH_TYPE_UNEXPECTED_ERROR'
    })
  }
})

/**
 * Get user details including company membership, cached for the request.
 * This is safe to use in server components as it validates the session.
 * Company is returned as an array but database constraints ensure only one company per user.
 */
export const getUserDetails = cache(async (supabase?: SupabaseClient | null): Promise<UserDetails | null> => {
  try {
    const client = supabase ?? createServer()
    const user = await getUser(client)
    if (!user) return null

    // Rate limit check
    await rateLimit(user.id, 'get-user-details', 10, '1m')

    // Get company membership details using foreign key relationship
    const { data: membership, error: membershipError } = await client
      .from('company_members')
      .select('role, companies!company_members_company_id_fkey(name)')
      .eq('user_id', user.id)
      .single()

    if (membershipError && membershipError.code !== 'PGRST116') {
      throw new DatabaseError({
        message: 'Failed to get company membership',
        cause: membershipError,
        code: 'GET_MEMBERSHIP_ERROR'
      })
    }

    // Transform the response to match expected format
    const transformedMembership = membership ? {
      role: membership.role,
      company: Array.isArray(membership.companies) ? membership.companies : [membership.companies || {}]
    } : null

    return toUserDetails(
      {
        id: user.id,
        email: user.email,
        user_metadata: user.user_metadata
      },
      transformedMembership
    )
  } catch (error) {
    if (error instanceof AuthError || error instanceof DatabaseError) throw error
    throw new AuthError({
      message: 'Unexpected error getting user details',
      cause: error,
      code: 'USER_DETAILS_UNEXPECTED_ERROR'
    })
  }
})

/**
 * Check if the current user has access to a specific company
 */
export const hasCompanyAccess = cache(async (companyId: string, supabase?: SupabaseClient | null): Promise<boolean> => {
  try {
    const client = supabase ?? createServer()
    const user = await getUser(client)
    if (!user) return false

    // Rate limit check
    await rateLimit(user.id, 'check-company-access', 20, '1m')

    const { data: membership, error } = await client
      .from('company_members')
      .select('id')
      .eq('user_id', user.id)
      .eq('company_id', companyId)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new DatabaseError({
        message: 'Failed to check company access',
        cause: error,
        code: 'COMPANY_ACCESS_ERROR'
      })
    }

    return !!membership
  } catch (error) {
    if (error instanceof AuthError || error instanceof DatabaseError) throw error
    throw new AuthError({
      message: 'Unexpected error checking company access',
      cause: error,
      code: 'COMPANY_ACCESS_UNEXPECTED_ERROR'
    })
  }
})
