import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'
import { getUser, getUserDetails, getUserType } from '@/lib/supabase/server/auth'
import { AuthProvider } from '@/components/providers/auth-provider'
import { createMiddleware } from '@/lib/supabase/server/middleware'
import { ErrorBoundary } from '@/components/error-boundary'

/**
 * Protected layout that handles authentication and authorization.
 * All routes under (protected) will be wrapped with this layout.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  try {
    // TODO: This is a temporary solution for Step 2 of auth modernization.
    // Will be replaced with proper Next.js middleware in Step 8: Migration to New Structure
    const { supabase, session } = await createMiddleware()(
      new NextRequest(new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'))
    )
    
    if (!session) {
      redirect('/login')
    }

    // Parallel fetch of user data using the same Supabase instance
    const [user, userDetails, userType] = await Promise.all([
      getUser(supabase),
      getUserDetails(supabase),
      getUserType(supabase)
    ])

    if (!user) {
      redirect('/login')
    }

    return (
      <ErrorBoundary>
        <AuthProvider
          user={user}
          userDetails={userDetails}
          userType={userType}
        >
          {children}
        </AuthProvider>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Protected layout error:', error)
    redirect('/login')
  }
}
