import { DashboardShell } from '@/components/dashboard/shell'
import { createServer, getUserType } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { AuthError } from '@/lib/supabase/utils/errors'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    const supabase = createServer()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      redirect('/login')
    }

    const userType = await getUserType(supabase)
    
    return (
      <DashboardShell userType={userType}>
        {children}
      </DashboardShell>
    )
  } catch (error) {
    if (error instanceof AuthError) {
      // Handle auth-specific errors (e.g., rate limiting)
      console.error('Auth error:', error.message)
      redirect('/login')
    }
    // For unexpected errors, throw to error boundary
    throw error
  }
}
