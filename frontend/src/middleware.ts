import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add paths that require authentication
const PROTECTED_PATHS = ['/dashboard', '/settings', '/projects']
// Add paths that should redirect to dashboard if already authenticated
const AUTH_PATHS = ['/login', '/register']

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

  // Handle protected routes
  if (isProtectedPath) {
    if (!session) {
      // Save the original URL to redirect back after login
      const redirectUrl = req.nextUrl.pathname + req.nextUrl.search
      return NextResponse.redirect(
        new URL(`/login?redirect=${encodeURIComponent(redirectUrl)}`, req.url)
      )
    }
  }

  // Handle auth pages (login/register)
  if (isAuthPath && session) {
    // Get the intended redirect URL or default to dashboard
    const redirectTo = req.nextUrl.searchParams.get('redirect') || '/dashboard'
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
