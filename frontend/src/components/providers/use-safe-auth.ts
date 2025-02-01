'use client'

import { useContext } from "react"
import { AuthContext } from "./auth-provider"
import type { User } from "@supabase/supabase-js"
import type { UserDetails, UserType } from "@/types/external/supabase/auth"

interface AuthContextType {
  user: User | null
  userDetails: UserDetails | null
  userType: UserType | null
}

export function useSafeAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    return {
      user: null,
      userDetails: null,
      userType: null
    }
  }
  return context
}