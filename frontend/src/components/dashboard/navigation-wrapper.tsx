"use client"

import { useEffect, useState } from 'react'
import { useSupabase, useUser } from '@/lib/supabase/hooks'
import { NavigationSidebar } from './navigation-sidebar'
import { userNavigation, companyNavigation } from "@/config/navigation"
import type { UserType } from "@/types/external/supabase"

export function NavigationWrapper() {
  const [navigation, setNavigation] = useState(userNavigation)
  const { user } = useUser()

  useEffect(() => {
    const userType = user?.user_metadata?.user_type
    // Handle both old 'company_member' and new 'company' values
    const isCompanyUser = userType === 'company' || userType === 'company_member'
    setNavigation(isCompanyUser ? companyNavigation : userNavigation)
  }, [user])

  return <NavigationSidebar navigation={navigation} />
}
