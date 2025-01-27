import { ProtectedLayout } from '@/components/layouts/protected-layout'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'
import { UserType } from '@/types/external/supabase/auth'

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedLayout requiredUserType={UserType.USER}>
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedLayout>
  )
}
