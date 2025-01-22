"use client"

import { useEffect, useState } from 'react'
import { useSupabase } from '@/lib/supabase/hooks'
import { NavigationSidebar } from './navigation-sidebar'
import { userNavigation, companyNavigation } from "@/config/navigation"
import { UserType } from "@/types/auth"

export function NavigationWrapper() {
  const [navigation, setNavigation] = useState(userNavigation)
  const supabase = useSupabase()

  useEffect(() => {
    const getNavigation = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const userType = session?.user?.user_metadata?.user_type as UserType
      setNavigation(userType === 'company_member' ? companyNavigation : userNavigation)
    }

    getNavigation()
  }, [supabase.auth])

  return <NavigationSidebar navigation={navigation} />
}
