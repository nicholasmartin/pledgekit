import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Try to refresh the session
  await supabase.auth.getSession()

  // Get the latest session state
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Auth required routes
  if (req.nextUrl.pathname.startsWith('/dashboard') || req.nextUrl.pathname.startsWith('/settings')) {
    if (!session) {
      // Save the original URL to redirect back after login
      const redirectUrl = req.nextUrl.pathname
      return NextResponse.redirect(new URL(`/login?redirect=${redirectUrl}`, req.url))
    }
  }

  // Auth pages (login/register) - redirect to dashboard if already logged in
  if (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')) {
    if (session) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
  }

  return res
}

// Only run on auth-required routes and auth pages
export const config = {
  matcher: ['/dashboard/:path*', '/settings/:path*', '/login', '/register']
}
