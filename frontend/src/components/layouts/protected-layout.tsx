import { redirect } from 'next/navigation'
import { getUser, getUserType } from '@/lib/supabase/server/auth'
import { UserType } from '@/types/external/supabase/auth'
import { Loader2 } from "lucide-react"

interface ProtectedLayoutProps {
  children: React.ReactNode
  requiredUserType?: UserType
}

export async function ProtectedLayout({ 
  children,
  requiredUserType,
}: ProtectedLayoutProps) {
  try {
    const user = await getUser()
    
    if (!user) {
      redirect('/login')
    }

    const userType = await getUserType()
    console.log('Protected Layout - User Type:', userType)

    if (!userType) {
      // If no user type is set, redirect to complete profile
      redirect('/onboarding')
    }

    // If a specific user type is required, verify it
    if (requiredUserType && userType !== requiredUserType) {
      console.log('Protected Layout - User type mismatch:', { required: requiredUserType, actual: userType })
      // Redirect to appropriate dashboard based on actual user type
      redirect(userType === UserType.COMPANY ? '/dashboard/company' : '/dashboard/user')
    }

    return <>{children}</>
  } catch (error) {
    console.error('Protected Layout - Error:', error)
    // Show loading state while redirecting
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }
}
