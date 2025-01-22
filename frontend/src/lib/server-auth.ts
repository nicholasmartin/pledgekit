import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
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
 * Get the current session, cached for the request
 */
export const getSession = cache(async () => {
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
  try {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) throw error
    return session
  } catch (error) {
    console.error('Error getting session:', error)
    return null
  }
})

/**
 * Get user details including company membership, cached for the request
 */
export const getUserDetails = cache(async (): Promise<UserDetails | null> => {
  const session = await getSession()
  if (!session?.user) return null

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
  try {
    // Get company membership details
    const { data: membership, error } = await supabase
      .from('company_members')
      .select('role, company:companies(name)')
      .eq('user_id', session.user.id)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
      console.error('Error getting membership:', error)
    }

    return {
      user: session.user,
      membership: membership || null
    }
  } catch (error) {
    console.error('Error getting user details:', error)
    return {
      user: session.user,
      membership: null
    }
  }
})

/**
 * Check if the current user has access to a specific company
 */
export const hasCompanyAccess = cache(async (companyId: string): Promise<boolean> => {
  const session = await getSession()
  if (!session?.user) return false

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
  try {
    const { data: membership, error } = await supabase
      .from('company_members')
      .select('id')
      .eq('user_id', session.user.id)
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
