import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { UserType } from '@/types/external/supabase/auth'
import { createMiddleware } from '@/lib/supabase/server/middleware'

// Add paths that require authentication
const PROTECTED_PATHS = ['/dashboard']
// Add paths that should redirect to dashboard if already authenticated
const AUTH_PATHS = ['/login', '/register']
const COMPANY_PATHS = ['/dashboard/company']
const PUBLIC_USER_PATHS = ['/dashboard/user']

// Helper to check if user is a company user (handles both old and new values)
const isCompanyUser = (type: string | undefined) => 
  type === UserType.COMPANY || type === 'company_member'

export async function middleware(req: NextRequest) {
  // Check if we're in a redirect loop using a URL parameter
  const redirectCount = parseInt(req.nextUrl.searchParams.get('rc') || '0')
  if (redirectCount >= 3) {
    // Remove the redirect count and return to dashboard
    const fallbackUrl = new URL('/dashboard', req.url)
    fallbackUrl.searchParams.delete('rc')
    return NextResponse.redirect(fallbackUrl)
  }

  const supabaseMiddleware = createMiddleware()
  const { res, session, supabase } = await supabaseMiddleware(req)
  
  if (!supabase) {
    return res
  }

  const path = req.nextUrl.pathname
  const isProtectedPath = PROTECTED_PATHS.some(prefix => path.startsWith(prefix))
  const isAuthPath = AUTH_PATHS.some(prefix => path.startsWith(prefix))
  const isCompanyPath = COMPANY_PATHS.some(prefix => path.startsWith(prefix))
  const isPublicUserPath = PUBLIC_USER_PATHS.some(prefix => path.startsWith(prefix))

  // Handle auth pages (login/register)
  if (isAuthPath && session) {
    const userType = session.user?.user_metadata?.user_type
    
    // If user type is not set, allow access to complete setup
    if (!userType) {
      return res
    }

    // Only redirect if no specific redirect parameter is set
    if (!req.nextUrl.searchParams.has('redirect')) {
      const defaultRedirect = userType === UserType.COMPANY ? '/dashboard/company' : '/dashboard/user'
      const redirectUrl = new URL(defaultRedirect, req.url)
      return NextResponse.redirect(redirectUrl)
    }
  }

  // Handle protected routes
  if (isProtectedPath) {
    if (!session) {
      // Save the original URL to redirect back after login
      const redirectUrl = req.nextUrl.pathname + req.nextUrl.search
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(redirectUrl)}`, req.url)
      )
    }

    const userType = session.user?.user_metadata?.user_type
    
    // If user type is not set or at base dashboard, allow access
    if (!userType || path === '/dashboard') {
      return res
    }

    // Create redirect URL with incremented count
    const createRedirectUrl = (path: string) => {
      const url = new URL(path, req.url)
      url.searchParams.set('rc', (redirectCount + 1).toString())
      return url
    }

    // Handle company-specific paths
    if (isCompanyPath && !isCompanyUser(userType)) {
      return NextResponse.redirect(createRedirectUrl('/dashboard/user'))
    }

    // Handle public user-specific paths
    if (isPublicUserPath && isCompanyUser(userType)) {
      return NextResponse.redirect(createRedirectUrl('/dashboard/company'))
    }
  }

  return res
}

// Run middleware on all routes except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
