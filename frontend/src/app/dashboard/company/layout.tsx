import { ProtectedLayout } from '@/components/layouts/protected-layout'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { UserType } from '@/types/external/supabase/auth'

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedLayout requiredUserType={UserType.COMPANY}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedLayout>
  )
}
