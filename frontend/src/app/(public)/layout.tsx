/**
 * Public Layout
 * 
 * This layout wraps all public routes and provides auth state through
 * the AuthProvider. This ensures components like MainNav can access
 * auth state consistently across the app.
 */

import { headers } from 'next/headers'
import { NextRequest } from 'next/server'
import { getUser, getUserDetails, getUserType } from '@/lib/supabase/server/auth'
import { createMiddleware } from '@/lib/supabase/server/middleware'
import { AuthProvider } from "@/components/providers/auth-provider"
import { BaseProviders } from "@/components/providers/base-providers"
import { MainNav } from "@/components/navigation/main-nav"
import { Footer } from "@/components/navigation/footer"

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode
}) {
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

  // Get user data if session exists
  const [user, userDetails, userType] = session ? await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getUserType(supabase)
  ]) : [null, null, null]
  
  return (
    <BaseProviders>
      <AuthProvider
        user={user}
        userDetails={userDetails}
        userType={userType}
      >
        <div className="relative min-h-screen">
          <MainNav />
          
          {/* Main content with padding for footer */}
          <main className="pb-16">
            {children}
          </main>
          
          {/* Footer absolutely positioned at bottom */}
          <Footer className="absolute bottom-0 w-full" />
        </div>
      </AuthProvider>
    </BaseProviders>
  )
}
