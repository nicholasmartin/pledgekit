import { Header } from "@/components/dashboard/header-server"
import { ProtectedLayout } from "@/components/layouts/protected-layout"

export default async function UserDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedLayout>
      <div className="flex min-h-screen flex-col">
        <Header />
        <div className="flex-1">
          <main className="container py-6">
            {children}
          </main>
        </div>
      </div>
    </ProtectedLayout>
  )
}
