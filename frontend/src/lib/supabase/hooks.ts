import { useEffect, useState } from 'react'
import { createClient } from './client'
import type { User } from '@supabase/supabase-js'
import type { Database } from '../database.types'
import { SupabaseClient } from '@supabase/supabase-js'

export function useSupabase() {
  const [client] = useState(() => createClient())
  return client as SupabaseClient<Database>
}

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

    const { data: { subscription } } = client.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [client])

  return { user, loading }
}
