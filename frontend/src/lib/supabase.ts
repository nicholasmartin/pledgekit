import { createClient } from '@supabase/supabase-js'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

// Ensure a single Supabase client instance
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create a single Supabase client for both server and client-side use
export const supabase = createClientComponentClient({
  supabaseUrl,
  supabaseKey: supabaseAnonKey,
})

// Add a function to check user type
export async function getUserType() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  // First, check user metadata for explicit user type
  if (user.user_metadata?.user_type) {
    console.log('User type from metadata:', user.user_metadata.user_type)
    return user.user_metadata.user_type
  }

  // Check if user is part of any company_members
  try {
    const { data: companyMembership, error: membershipError } = await supabase
      .from('company_members')
      .select('role')
      .eq('user_id', user.id)
      .maybeSingle()

    console.log('Company Membership:', companyMembership)
    console.log('Membership Error:', membershipError)

    // If user is in company_members, they are a company user
    if (companyMembership) {
      return 'company'
    }

    // If no company membership, default to public
    return 'public'
  } catch (error) {
    console.error('Error checking user type:', error)
    // Fallback to public if there's an error
    return 'public'
  }
}

// Logout function to centralize logout logic
export async function logout() {
  try {
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      throw error
    }

    // Redirect to login page after logout
    window.location.href = '/login'
  } catch (error) {
    console.error('Unexpected logout error:', error)
    throw error
  }
}
