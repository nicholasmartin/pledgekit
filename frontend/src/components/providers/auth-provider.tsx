'use client'

import { createContext, useContext } from "react"
import type { User } from "@supabase/supabase-js"
import type { UserDetails, UserType } from "@/types/external/supabase/auth"

interface AuthContextType {
  user: User | null
  userDetails: UserDetails | null
  userType: UserType | null
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userDetails: null,
  userType: null
})

export function AuthProvider({
  children,
  user,
  userDetails,
  userType,
}: {
  children: React.ReactNode
  user: User | null
  userDetails: UserDetails | null
  userType: UserType | null
}) {
  return (
    <AuthContext.Provider value={{ user, userDetails, userType }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useSafeAuth(): AuthContextType {
  return useContext(AuthContext)
}
