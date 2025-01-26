import { useEffect, useState } from 'react'
import { createClient } from '../client'
import type { User } from '@supabase/supabase-js'
import type { Database } from '@/types/generated/database'
import { SupabaseClient } from '@supabase/supabase-js'

/**
 * Hook to access the Supabase client.
 * Ensures only one instance is created.
 */
export function useSupabase() {
  const [client] = useState(() => createClient())
  return client as SupabaseClient<Database>
}

/**
 * Hook to access and subscribe to the current user.
 * Automatically updates when the user's session changes.
 */
export function useUser() {
  const client = useSupabase()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    client.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Subscribe to auth changes
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [client])

  return { user, loading }
}
