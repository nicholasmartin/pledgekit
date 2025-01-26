import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/types/generated/database'

// Create a single Supabase client for client-side use
export const supabase = createBrowserClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Client-side function to get user type from metadata only
export async function getClientUserType() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  return user.user_metadata?.user_type || null
}

// Logout function
export async function logout() {
  const { error } = await supabase.auth.signOut()
  if (error) {
    console.error('Error logging out:', error.message)
  }
  return { error }
}
