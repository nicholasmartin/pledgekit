'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  error: Error | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ 
  children 
}: { 
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        if (session?.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('An error occurred during auth state change'))
      } finally {
        setIsLoading(false)
      }
    })

    // Get initial session
    const initializeAuth = async () => {
      try {
        setIsLoading(true)
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error) throw error
        if (user) {
          setUser(user)
        }
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to initialize auth'))
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      router.push('/login')
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to sign out'))
      throw err // Re-throw to allow handling by the caller
    }
  }

  const value = {
    user,
    isLoading,
    error,
    signOut,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
