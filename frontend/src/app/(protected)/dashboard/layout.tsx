import { DashboardShell } from '@/components/dashboard/shell'
import { useAuth } from '@/components/providers/auth-provider'

export const metadata = {
  title: 'Dashboard',
  description: 'Manage your pledges and account',
}

/**
 * Dashboard layout that wraps all dashboard pages.
 * Uses the auth context from the parent protected layout to get user information.
 */
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
