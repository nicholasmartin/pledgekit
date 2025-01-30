import { ProtectedLayout } from "@/components/layouts/protected-layout"
import { DashboardShell } from "@/components/dashboard/shell"
import { getUserDetails, getUserType } from "@/lib/supabase/server/auth"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export default async function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Call cookies() before any Supabase calls
  cookies()

  const userDetails = await getUserDetails()
  if (!userDetails) {
    redirect('/login')
  }
  
  const userType = await getUserType()

  return (
    <ProtectedLayout>
      <DashboardShell userType={userType}>
        <div className="container py-6">
          <div className="mx-auto max-w-2xl">
            {children}
          </div>
        </div>
      </DashboardShell>
    </ProtectedLayout>
  )
}
