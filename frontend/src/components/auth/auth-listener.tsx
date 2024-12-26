'use client'

import { useEffect } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export function AuthListener() {
  useEffect(() => {
    const supabase = createClientComponentClient()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // Immediately redirect on sign out
        window.location.href = '/login'
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return null
}
