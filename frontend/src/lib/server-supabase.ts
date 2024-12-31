import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { Database } from './database.types'

export async function getUserType() {
  const supabase = createServerComponentClient<Database>({ cookies })
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
      return 'company_member'
    }

    // If not a company member, they are a public user
    return 'public_user'
  } catch (error) {
    console.error('Error checking user type:', error)
    return null
  }
}
