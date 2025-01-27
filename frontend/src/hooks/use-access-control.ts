import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useSupabase } from "@/lib/supabase/hooks"
import type { Database } from "@/types/generated/database"
import { UserType } from "@/types/external/supabase/auth"

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
  const router = useRouter()
  const supabase = useSupabase()
  const [userType, setUserType] = useState<UserType | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
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
    }
    
    getSession()
  }, [supabase])

  const refreshUserType = async () => {
    const { data: { session } } = await supabase.auth.getSession()
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
  }

  const isAuthorized = useCallback((requiredType?: UserType): boolean => {
    if (!requiredType) return true
    return userType === requiredType
  }, [userType])

  const getDashboardPath = useCallback((): string => {
    switch (userType) {
      case UserType.COMPANY:
        return '/dashboard/company'
      case UserType.USER:
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
