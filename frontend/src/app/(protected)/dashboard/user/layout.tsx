"use client"

import { DashboardShell } from '@/components/dashboard/shell'
import { useAuth } from '@/components/providers/auth-provider'
import { UserType } from '@/types/external/supabase/auth'
import { redirect } from 'next/navigation'

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userType } = useAuth()

  // Verify user is a regular user
  if (userType !== UserType.USER) {
    redirect('/dashboard')
  }

  return (
    <DashboardShell userType={UserType.USER}>
      {children}
    </DashboardShell>
  )
}
