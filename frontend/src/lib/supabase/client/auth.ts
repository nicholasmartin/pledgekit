import { type User } from '@supabase/supabase-js'
import { SupabaseError } from '../utils/errors'
import { createClient } from './client'
import { UserType, UserTypeValues } from '@/types/external/supabase'

/**
 * Get the current user session.
 * Returns null if no session exists.
 */
export const getSession = async () => {
  try {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      throw new SupabaseError(
        'Error getting session',
        'AUTH_GET_SESSION_ERROR',
        error
      )
    }

    return session
  } catch (error) {
    throw new SupabaseError(
      'Failed to get session',
      'AUTH_GET_SESSION_ERROR',
      error
    )
  }
}

/**
 * Get the current user.
 * Returns null if no user is authenticated.
 */
export const getUser = async (): Promise<User | null> => {
  try {
    const session = await getSession()
    return session?.user ?? null
  } catch (error) {
    throw new SupabaseError(
      'Failed to get user',
      'AUTH_GET_USER_ERROR',
      error
    )
  }
}

/**
 * Sign in with email and password
 */
export const signInWithPassword = async (email: string, password: string) => {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      throw new SupabaseError(
        'Error signing in',
        'AUTH_SIGN_IN_ERROR',
        error
      )
    }

    return data
  } catch (error) {
    throw new SupabaseError(
      'Failed to sign in',
      'AUTH_SIGN_IN_ERROR',
      error
    )
  }
}

/**
 * Sign up with email and password
 */
export const signUpWithPassword = async (
  email: string,
  password: string,
  userType: UserType
) => {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_type: userType
        }
      }
    })

    if (error) {
      throw new SupabaseError(
        'Error signing up',
        'AUTH_SIGN_UP_ERROR',
        error
      )
    }

    return data
  } catch (error) {
    throw new SupabaseError(
      'Failed to sign up',
      'AUTH_SIGN_UP_ERROR',
      error
    )
  }
}

interface RegisterUserParams {
  email: string
  password: string
  firstName: string
  lastName: string
  userType: UserType
  metadata?: Record<string, any>
}

/**
 * Register a new user with email, password, and additional user details
 */
export async function registerUser({
  email,
  password,
  firstName,
  lastName,
  userType,
  metadata = {}
}: RegisterUserParams) {
  try {
    const supabase = createClient()
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login?verified=true`,
        data: {
          first_name: firstName,
          last_name: lastName,
          user_type: userType,
          ...metadata
        },
      },
    })

    if (error) {
      throw new SupabaseError(
        'Error registering user',
        'AUTH_REGISTER_ERROR',
        error
      )
    }

    return data
  } catch (error) {
    throw new SupabaseError(
      'Error registering user',
      'AUTH_REGISTER_ERROR',
      error
    )
  }
}

/**
 * Get the current user's type from their metadata
 */
export async function getUserType(): Promise<UserType> {
  try {
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error) {
      throw new SupabaseError(
        'Error getting user type',
        'AUTH_GET_USER_TYPE_ERROR',
        error
      )
    }

    return (user?.user_metadata?.user_type as UserType) || UserTypeValues.USER
  } catch (error) {
    throw new SupabaseError(
      'Error getting user type',
      'AUTH_GET_USER_TYPE_ERROR',
      error
    )
  }
}

/**
 * Sign out the current user
 */
export const signOut = async () => {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new SupabaseError(
        'Error signing out',
        'AUTH_SIGN_OUT_ERROR',
        error
      )
    }
  } catch (error) {
    throw new SupabaseError(
      'Failed to sign out',
      'AUTH_SIGN_OUT_ERROR',
      error
    )
  }
}
