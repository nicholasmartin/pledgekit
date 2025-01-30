"use client"

import { BaseProviders } from "./base-providers"
import type { User } from "@supabase/supabase-js"
import type { UserDetails, UserType } from "@/types/external/supabase/auth"
import { AuthProvider } from "./auth-provider"

interface ProvidersProps {
  children: React.ReactNode
  user?: User | null
  userDetails?: UserDetails | null
  userType?: UserType | null
}

export function Providers({ children, user, userDetails, userType }: ProvidersProps) {
  return (
    <BaseProviders>
      {user ? (
        <AuthProvider 
          user={user ?? null}
          userDetails={userDetails ?? null}
          userType={userType ?? null}
        >
          {children}
        </AuthProvider>
      ) : (
        children
      )}
    </BaseProviders>
  )
}
