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

  try {
    // Try to refresh the session if it exists
    const { data: { session } } = await supabase.auth.getSession()

    const path = req.nextUrl.pathname
    console.log('Middleware - Path:', path)
    console.log('Middleware - Session:', !!session)
    if (session?.user) {
      console.log('Middleware - User type:', session.user.user_metadata?.user_type)
    }

    const isProtectedPath = PROTECTED_PATHS.some(prefix => path.startsWith(prefix))
    const isAuthPath = AUTH_PATHS.some(prefix => path.startsWith(prefix))
    const isCompanyPath = COMPANY_PATHS.some(prefix => path.startsWith(prefix))
    const isPublicUserPath = PUBLIC_USER_PATHS.some(prefix => path.startsWith(prefix))

    console.log('Middleware - Path types:', {
      isProtectedPath,
      isAuthPath,
      isCompanyPath,
      isPublicUserPath
    })

    // Handle auth pages (login/register)
    if (isAuthPath && session) {
      console.log('Middleware - Handling auth path with session')
      const userType = session.user?.user_metadata?.user_type
      // If user type is not set, redirect to dashboard to handle setup
      if (!userType) {
        console.log('Middleware - No user type, redirecting to dashboard')
        const redirectUrl = new URL('/dashboard', req.url)
        return NextResponse.redirect(redirectUrl)
      }
      // Get redirect URL from query params or use default based on user type
      const redirectTo = req.nextUrl.searchParams.get('redirect') || 
        (userType === 'company_member' ? '/dashboard/company' : '/dashboard/user')
      console.log('Middleware - Redirecting to:', redirectTo)
      const redirectUrl = new URL(redirectTo, req.url)
      return NextResponse.redirect(redirectUrl)
    }

    // Handle protected routes
    if (isProtectedPath) {
      if (!session) {
        // Save the original URL to redirect back after login
        const redirectUrl = req.nextUrl.pathname + req.nextUrl.search
        console.log('Middleware - No session, redirecting to login')
        return NextResponse.redirect(
          new URL(`/login?redirect=${encodeURIComponent(redirectUrl)}`, req.url)
        )
      }

      const userType = session.user?.user_metadata?.user_type
      
      // If user type is not set, allow access only to dashboard for setup
      if (!userType && path !== '/dashboard') {
        console.log('Middleware - No user type, redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }

      // Handle company-specific paths
      if (isCompanyPath && userType !== 'company_member') {
        console.log('Middleware - Not company member, redirecting to user dashboard')
        return NextResponse.redirect(new URL('/dashboard/user', req.url))
      }

      // Handle public user-specific paths
      if (isPublicUserPath && userType !== 'public_user') {
        console.log('Middleware - Not public user, redirecting to company dashboard')
        return NextResponse.redirect(new URL('/dashboard/company', req.url))
      }

      // Redirect root dashboard to appropriate type-specific dashboard
      if (path === '/dashboard') {
        if (!userType) {
          // Let the dashboard page handle user type setup
          console.log('Middleware - No user type, letting dashboard handle setup')
          return res
        }
        if (userType === 'company_member') {
          console.log('Middleware - Redirecting to company dashboard')
          return NextResponse.redirect(new URL('/dashboard/company', req.url))
        } else {
          console.log('Middleware - Redirecting to user dashboard')
          return NextResponse.redirect(new URL('/dashboard/user', req.url))
        }
      }
    }

    console.log('Middleware - Returning response')
    return res
  } catch (error) {
    console.error('Middleware - Error retrieving session:', error)
    return NextResponse.next()
  }
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
