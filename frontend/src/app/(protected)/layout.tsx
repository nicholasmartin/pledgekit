import { redirect } from 'next/navigation'
import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { getUser, getUserDetails, getUserType } from '@/lib/supabase/server/auth'
import { createMiddleware } from '@/lib/supabase/server/middleware'
import { ErrorBoundary } from '@/components/error-boundary'
import { AuthProvider } from '@/components/providers/auth-provider'
import { BaseProviders } from '@/components/providers/base-providers'

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
    // Get the current request headers to preserve cookies
    const headersList = headers()
    const requestHeaders = new Headers()
    
    // Add cookie header if available
    const cookie = headersList.get('cookie')
    if (cookie) {
      requestHeaders.set('cookie', cookie)
    }

    const { supabase, session } = await createMiddleware()(
      new NextRequest(
        new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
        { headers: requestHeaders }
      )
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
        <BaseProviders>
          <AuthProvider
            user={user}
            userDetails={userDetails}
            userType={userType}
          >
            {children}
          </AuthProvider>
        </BaseProviders>
      </ErrorBoundary>
    )
  } catch (error) {
    console.error('Protected layout error:', error)
    redirect('/login')
  }
}
