import { redirect } from 'next/navigation'
import { getSession } from '@/lib/server-auth'
import { UserType } from '@/types/auth'

interface ProtectedLayoutProps {
  children: React.ReactNode
  requiredUserType?: UserType
}

export async function ProtectedLayout({ 
  children,
  requiredUserType,
}: ProtectedLayoutProps) {
  const session = await getSession()
  
  if (!session) {
    redirect('/login')
  }

  const userType = session.user?.user_metadata?.user_type as UserType

  if (!userType) {
    // If no user type is set, redirect to complete profile
    redirect('/onboarding')
  }

  // If a specific user type is required, verify it
  if (requiredUserType && userType !== requiredUserType) {
    // Redirect to appropriate dashboard based on actual user type
    redirect(userType === 'company_member' ? '/dashboard/company' : '/dashboard/user')
  }

  return <>{children}</>
}
