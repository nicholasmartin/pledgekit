import { ProtectedLayout } from '@/components/layouts/protected-layout'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <ProtectedLayout>{children}</ProtectedLayout>
}
