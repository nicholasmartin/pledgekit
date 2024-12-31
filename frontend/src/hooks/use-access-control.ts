import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Database } from '@/lib/database.types'

export enum UserType {
  COMPANY_MEMBER = 'company_member',
  PUBLIC_USER = 'public_user',
}

interface UserMetadata {
  user_type: UserType
}

interface UseAccessControlReturn {
  userType: UserType | null
  isLoading: boolean
  error: Error | null
  isAuthorized: (requiredType?: UserType) => boolean
  getDashboardPath: () => string
  refreshUserType: () => Promise<void>
}

export function useAccessControl(): UseAccessControlReturn {
  const supabase = createClientComponentClient<Database>()
  const router = useRouter()
  const [userType, setUserType] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [session, setSession] = useState<any>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession()
      setSession(currentSession)
    }
    
    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })

    return () => subscription.unsubscribe()
  }, [supabase])

  const refreshUserType = useCallback(async () => {
    if (!session?.user) {
      setUserType(null)
      setIsLoading(false)
      return
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) throw error
      
      const userMetadata = user?.user_metadata as UserMetadata
      setUserType(userMetadata?.user_type || null)
    } catch (e) {
      setError(e instanceof Error ? e : new Error('Failed to fetch user type'))
    } finally {
      setIsLoading(false)
    }
  }, [session?.user, supabase.auth])

  useEffect(() => {
    refreshUserType()
  }, [refreshUserType])

  const isAuthorized = useCallback((requiredType?: UserType): boolean => {
    if (!requiredType) return true
    return userType === requiredType
  }, [userType])

  const getDashboardPath = useCallback((): string => {
    switch (userType) {
      case UserType.COMPANY_MEMBER:
        return '/dashboard/company'
      case UserType.PUBLIC_USER:
        return '/dashboard/user'
      default:
        return '/auth/login'
    }
  }, [userType])

  return {
    userType,
    isLoading,
    error,
    isAuthorized,
    getDashboardPath,
    refreshUserType,
  }
}
