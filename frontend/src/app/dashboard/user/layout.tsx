import { ProtectedLayout } from '@/components/layouts/protected-layout'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export default function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedLayout requiredUserType="public_user">
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedLayout>
  )
}
