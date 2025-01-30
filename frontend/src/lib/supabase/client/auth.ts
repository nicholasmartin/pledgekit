import { type User } from '@supabase/supabase-js'
import { AuthError } from '../utils/errors'
import { createClient } from './client'
import { UserType, isUserType } from '@/types/external/supabase/auth'

/**
 * Get the current user session.
 * Returns null if no session exists.
 */
export const getSession = async () => {
  try {
    const supabase = createClient()
    const { data: { session }, error } = await supabase.auth.getSession()

    if (error) {
      throw new AuthError({
        message: 'Failed to get session',
        code: 'AUTH_SESSION_ERROR',
        cause: error
      })
    }

    return session
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError({
      message: 'Unexpected error getting session',
      code: 'AUTH_UNEXPECTED_ERROR',
      cause: error
    })
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
    if (error instanceof AuthError) throw error
    throw new AuthError({
      message: 'Unexpected error getting user',
      code: 'AUTH_UNEXPECTED_ERROR',
      cause: error
    })
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
      throw new AuthError({
        message: 'Invalid email or password',
        code: 'AUTH_INVALID_CREDENTIALS',
        cause: error
      })
    }

    return data
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError({
      message: 'Unexpected error during sign in',
      code: 'AUTH_UNEXPECTED_ERROR',
      cause: error
    })
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
      throw new AuthError({
        message: 'Failed to create account',
        code: 'AUTH_SIGN_UP_ERROR',
        cause: error
      })
    }

    return data
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError({
      message: 'Unexpected error during sign up',
      code: 'AUTH_UNEXPECTED_ERROR',
      cause: error
    })
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
      throw new AuthError({
        message: 'Failed to register user',
        code: 'AUTH_SIGN_UP_ERROR',
        cause: error
      })
    }

    return data
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError({
      message: 'Unexpected error during registration',
      code: 'AUTH_UNEXPECTED_ERROR',
      cause: error
    })
  }
}

/**
 * Get the current user's type from their metadata
 */
export async function getUserType(): Promise<UserType> {
  try {
    const user = await getUser()
    if (!user) {
      throw new AuthError({
        message: 'No authenticated user found',
        code: 'AUTH_UNAUTHORIZED'
      })
    }

    const userType = user.user_metadata?.user_type
    if (!userType || !isUserType(userType)) {
      throw new AuthError({
        message: 'Invalid or missing user type',
        code: 'AUTH_INVALID_USER_TYPE'
      })
    }

    return userType
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError({
      message: 'Unexpected error getting user type',
      code: 'AUTH_UNEXPECTED_ERROR',
      cause: error
    })
  }
}

/**
 * Sign out the current user
 */
export async function signOut() {
  try {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      throw new AuthError({
        message: 'Failed to sign out',
        code: 'AUTH_SIGN_OUT_ERROR',
        cause: error
      })
    }
  } catch (error) {
    if (error instanceof AuthError) throw error
    throw new AuthError({
      message: 'Unexpected error during sign out',
      code: 'AUTH_UNEXPECTED_ERROR',
      cause: error
    })
  }
}
