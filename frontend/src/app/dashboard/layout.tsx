import { Header } from "@/components/dashboard/header-server"
import { Sidebar } from "@/components/dashboard/sidebar"
import { ProtectedLayout } from "@/components/layouts/protected-layout"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedLayout requireCompany={true}>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <div className="flex-1">
            <main className="container py-6">
              {children}
            </main>
          </div>
        </div>
      </div>
    </ProtectedLayout>
  )
}
