import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import { Database } from './database.types'

type UserType = 'company' | 'user'

/**
 * Create a cached version of the Supabase server client.
 * IMPORTANT: This should only be used in Server Components.
 * Always call cookies() before any Supabase calls.
 */
export const createServerSupabase = cache(() => {
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name: string) => {
          return cookieStore.get(name)?.value
        },
        set: (name: string, value: string, options: any) => {
          cookieStore.set({ name, value, ...options })
        },
        remove: (name: string, options: any) => {
          cookieStore.delete({ name, ...options })
        }
      }
    }
  )
})

/**
 * Get the current authenticated user.
 * This is safe to use in Server Components as it revalidates with Supabase Auth.
 * NEVER use getSession() in server code - it isn't guaranteed to revalidate.
 */
export const getUser = cache(async () => {
  const supabase = createServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error) {
    console.error('Error getting user:', error)
    return null
  }

  if (!user) {
    return null
  }

  return user
})

/**
 * Get user type with proper error handling and typing.
 * Returns 'company' | 'user' | null
 */
export const getUserType = cache(async (): Promise<UserType | null> => {
  const user = await getUser()
  if (!user) return null

  // First, check user metadata for explicit user type
  const userType = user.user_metadata?.user_type
  if (userType && (userType === 'company' || userType === 'user')) {
    return userType
  }

  // Check if user is part of any company_members
  try {
    const supabase = createServerSupabase()
    const { data: companyMember, error } = await supabase
      .from('company_members')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error) {
      console.error('Error checking company membership:', error)
      throw error
    }
    
    return companyMember ? 'company' : 'user'
  } catch (error) {
    console.error('Error checking user type:', error)
    return null
  }
})

/**
 * Get company data with proper typing and error handling.
 * Throws if company is not found or on error.
 */
export const getCompany = cache(async (slug: string) => {
  const supabase = createServerSupabase()
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .single()

  if (error) {
    console.error('Error fetching company:', error)
    throw error
  }

  if (!data) {
    throw new Error('Company not found')
  }

  return data
})

/**
 * Get published projects for a company with proper typing.
 * Handles pagination and data transformation.
 */
export const getCompanyProjects = cache(async (companyId: string, page: number = 0) => {
  const supabase = createServerSupabase()
  const from = page * 10
  const to = from + 9

  const { data, error } = await supabase
    .from('projects')
    .select('*, companies!inner(slug)')
    .eq('company_id', companyId)
    .eq('status', 'published')
    .order('created_at', { ascending: false })
    .range(from, to)

  if (error) {
    console.error('Error fetching company projects:', error)
    throw error
  }

  return data.map(project => ({
    ...project,
    company_slug: (project.companies as { slug: string }).slug
  }))
})
