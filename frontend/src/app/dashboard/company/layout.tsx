import { ProtectedLayout } from '@/components/layouts/protected-layout'
import { DashboardShell } from '@/components/dashboard/shell'
import { UserType } from '@/types/external/supabase/auth'

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedLayout requiredUserType={UserType.COMPANY}>
      <DashboardShell userType={UserType.COMPANY}>{children}</DashboardShell>
    </ProtectedLayout>
  )
}
