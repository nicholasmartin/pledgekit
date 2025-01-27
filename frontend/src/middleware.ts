import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { UserType } from '@/types/external/supabase/auth'

// Add paths that require authentication
const PROTECTED_PATHS = ['/dashboard']
// Add paths that should redirect to dashboard if already authenticated
const AUTH_PATHS = ['/login', '/register']
const COMPANY_PATHS = ['/dashboard/company']
const PUBLIC_USER_PATHS = ['/dashboard/user']

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Check if we're in a redirect loop using a URL parameter
  const redirectCount = parseInt(req.nextUrl.searchParams.get('rc') || '0')
  console.log('Middleware - Redirect count:', redirectCount)
  
  if (redirectCount >= 3) {
    console.error('Middleware - Max redirects reached, stopping redirect chain')
    // Remove the redirect count and return to dashboard
    const fallbackUrl = new URL('/dashboard', req.url)
    fallbackUrl.searchParams.delete('rc')
    return NextResponse.redirect(fallbackUrl)
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove: (name, options) => {
          res.cookies.delete({
            name,
            ...options,
          })
        }
      }
    }
  )

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
      
      // If user type is not set, allow access to complete setup
      if (!userType) {
        console.log('Middleware - No user type, allowing auth path access')
        return res
      }

      // Only redirect if no specific redirect parameter is set
      if (!req.nextUrl.searchParams.has('redirect')) {
        const defaultRedirect = userType === UserType.COMPANY ? '/dashboard/company' : '/dashboard/user'
        console.log('Middleware - Redirecting to default path:', defaultRedirect)
        const redirectUrl = new URL(defaultRedirect, req.url)
        const response = NextResponse.redirect(redirectUrl)
        response.headers.set('x-redirect-count', (redirectCount + 1).toString())
        return response
      }
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
      
      // If user type is not set or at base dashboard, allow access
      if (!userType || path === '/dashboard') {
        console.log('Middleware - No user type or base dashboard, allowing access')
        return res
      }

      // Create redirect URL with incremented count
      const createRedirectUrl = (path: string) => {
        const url = new URL(path, req.url)
        url.searchParams.set('rc', (redirectCount + 1).toString())
        return url
      }

      // Helper to check if user is a company user (handles both old and new values)
      const isCompanyUser = (type: string | undefined) => 
        type === UserType.COMPANY || type === 'company_member'

      // Handle company-specific paths
      if (isCompanyPath && !isCompanyUser(userType)) {
        console.log('Middleware - Not company user, redirecting to user dashboard')
        return NextResponse.redirect(createRedirectUrl('/dashboard/user'))
      }

      // Handle public user-specific paths
      if (isPublicUserPath && isCompanyUser(userType)) {
        console.log('Middleware - Company user accessing user path, redirecting to company dashboard')
        return NextResponse.redirect(createRedirectUrl('/dashboard/company'))
      }
    }

    console.log('Middleware - Returning response')
    return res
  } catch (error) {
    console.error('Middleware - Error retrieving session:', error)
    return NextResponse.next()
  }
}

// Run middleware on all routes except static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
