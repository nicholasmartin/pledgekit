"use client"

import { DashboardShell } from '@/components/dashboard/shell'
import { useAuth } from '@/components/providers/auth-provider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userType } = useAuth()

  return (
    <DashboardShell userType={userType}>
      {children}
    </DashboardShell>
  )
}
