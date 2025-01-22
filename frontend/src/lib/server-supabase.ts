import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export function createServerSupabase() {
  const cookieStore = cookies()

  return createServerClient<Database>(
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
}

export async function getUserType() {
  const supabase = createServerSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // First, check user metadata for explicit user type
  if (user.user_metadata?.user_type) {
    return user.user_metadata.user_type
  }

  // Check if user is part of any company_members
  try {
    const { data: companyMember } = await supabase
      .from('company_members')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (companyMember) {
      return 'company'
    }

    // If not a company member, default to regular user
    return 'user'
  } catch (error) {
    console.error('Error checking user type:', error)
    return null
  }
}
