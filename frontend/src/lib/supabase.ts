import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from './database.types'

// Create a single Supabase client for client-side use
export const supabase = createClientComponentClient<Database>()

// Client-side function to get user type from metadata only
export async function getClientUserType() {
  const { data: { user } } = await supabase.auth.getUser()
  return user?.user_metadata?.user_type || null
}

// Logout function
export async function logout() {
  try {
    await supabase.auth.signOut()
    window.location.href = '/login'
  } catch (error) {
    console.error('Error logging out:', error)
    throw error
  }
}
