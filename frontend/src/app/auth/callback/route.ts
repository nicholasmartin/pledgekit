import { createServer } from '@/lib/supabase/server'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Must call cookies() before any Supabase calls as per SSR requirements
    cookies()
    const supabase = createServer()

    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const type = requestUrl.searchParams.get('type')
    const next = requestUrl.searchParams.get('next') || '/dashboard'

    if (!code) {
      console.error('No code provided in auth callback')
      return NextResponse.redirect(new URL('/auth/error?error=no_code', requestUrl.origin))
    }

    // Exchange the code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(new URL('/auth/error?error=exchange_failed', requestUrl.origin))
    }

    // Get the user to verify the session
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('Error getting user after exchange:', userError)
      return NextResponse.redirect(new URL('/auth/error?error=session_verify_failed', requestUrl.origin))
    }

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL(next, requestUrl.origin))
  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(new URL('/auth/error?error=unexpected', request.url))
  }
}
