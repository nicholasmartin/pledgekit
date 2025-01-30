"use client"

import { useAuth } from '@/components/providers/auth-provider'
import { UserType } from '@/types/external/supabase/auth'
import { redirect } from 'next/navigation'

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userType } = useAuth()

  // Verify user is a company user
  if (userType !== UserType.COMPANY) {
    redirect('/dashboard')
  }

  return children
}
