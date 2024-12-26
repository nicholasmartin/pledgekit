'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'
import type { User } from '@supabase/supabase-js'
import type { UserDetails } from './server-auth'

interface AuthContextType {
  user: User | null
  userDetails: UserDetails | null
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ 
  children,
  initialUserDetails 
}: { 
  children: React.ReactNode
  initialUserDetails: UserDetails | null 
}) {
  const router = useRouter()
  const [userDetails, setUserDetails] = useState<UserDetails | null>(initialUserDetails)
  const [user, setUser] = useState<User | null>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        setUser(session.user)
      } else {
        setUser(null)
        setUserDetails(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error in signOut:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, userDetails, signOut }}>
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
