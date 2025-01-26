import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (token_hash && type) {
    const cookieStore = cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            cookieStore.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (error) {
      return NextResponse.redirect(
        new URL(`/auth/auth-error?error=${encodeURIComponent(error.message)}`, request.url)
      )
    }

    // Successful verification, redirect to the next page
    return NextResponse.redirect(new URL(next, request.url))
  }

  // Invalid request
  return NextResponse.redirect(
    new URL('/auth/auth-error?error=Invalid verification link', request.url)
  )
}
