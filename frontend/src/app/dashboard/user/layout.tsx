import { ProtectedLayout } from '@/components/layouts/protected-layout'
import { DashboardShell } from '@/components/dashboard/shell'
import { UserType } from '@/types/external/supabase/auth'

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedLayout requiredUserType={UserType.USER}>
      <DashboardShell userType={UserType.USER}>{children}</DashboardShell>
    </ProtectedLayout>
  )
}
