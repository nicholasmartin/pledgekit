"use client"

import { DashboardShell } from "@/components/dashboard/shell"
import { useAuth } from "@/components/providers/auth-provider"

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userType } = useAuth()

  return (
    <DashboardShell userType={userType}>
      <div className="container py-6">
        <div className="mx-auto max-w-2xl">
          {children}
        </div>
      </div>
    </DashboardShell>
  )
}
