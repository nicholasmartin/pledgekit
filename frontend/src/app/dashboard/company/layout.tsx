import { ProtectedLayout } from '@/components/layouts/protected-layout'
import { DashboardLayout } from '@/components/layouts/dashboard-layout'

export default function CompanyDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedLayout requiredUserType="company_member">
      <DashboardLayout>{children}</DashboardLayout>
    </ProtectedLayout>
  )
}
