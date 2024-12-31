import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that require authentication
const PROTECTED_PATHS = ['/dashboard']
// Add paths that should redirect to dashboard if already authenticated
const AUTH_PATHS = ['/login', '/register']
const COMPANY_PATHS = ['/dashboard/company']
const PUBLIC_USER_PATHS = ['/dashboard/user']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Try to refresh the session if it exists
  await supabase.auth.getSession()

  // Get the latest session state
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const path = req.nextUrl.pathname
  const isProtectedPath = PROTECTED_PATHS.some(prefix => path.startsWith(prefix))
  const isAuthPath = AUTH_PATHS.some(prefix => path.startsWith(prefix))
  const isCompanyPath = COMPANY_PATHS.some(prefix => path.startsWith(prefix))
  const isPublicUserPath = PUBLIC_USER_PATHS.some(prefix => path.startsWith(prefix))

  // Handle protected routes
  if (isProtectedPath) {
    if (!session) {
      // Save the original URL to redirect back after login
      const redirectUrl = req.nextUrl.pathname + req.nextUrl.search
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(redirectUrl)}`, req.url)
      )
    }

    // Get user type from session
    const userType = session.user?.user_metadata?.user_type

    // Handle company-specific paths
    if (isCompanyPath && userType !== 'company_member') {
      return NextResponse.redirect(new URL('/dashboard/user', req.url))
    }

    // Handle public user-specific paths
    if (isPublicUserPath && userType !== 'public_user') {
      return NextResponse.redirect(new URL('/dashboard/company', req.url))
    }

    // Redirect root dashboard to appropriate type-specific dashboard
    if (path === '/dashboard') {
      if (userType === 'company_member') {
        return NextResponse.redirect(new URL('/dashboard/company', req.url))
      } else {
        return NextResponse.redirect(new URL('/dashboard/user', req.url))
      }
    }
  }

  // Handle auth pages (login/register)
  if (isAuthPath && session) {
    const userType = session.user?.user_metadata?.user_type
    // Redirect to type-specific dashboard
    const redirectTo = req.nextUrl.searchParams.get('redirect') || 
      (userType === 'company_member' ? '/dashboard/company' : '/dashboard/user')
    return NextResponse.redirect(new URL(redirectTo, req.url))
  }

  return res
}

// Run middleware on all routes except static files and API routes
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
