import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { createServer } from '@/lib/supabase/server/server'
import { UserType } from '@/types/external/supabase/auth'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') || '/dashboard'

  if (!token_hash || !type) {
    return NextResponse.redirect(
      new URL('/auth/auth-error?error=Invalid verification link', request.url)
    )
  }

  try {
    // Call cookies() before any Supabase calls as per SSR requirements
    const cookieStore = cookies()
    const supabase = createServer()

    // Verify the token
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (verifyError) {
      throw verifyError
    }

    // Get the current user after verification
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      throw userError || new Error('User not found after verification')
    }

    // If this is a company user, create the company and related records
    if (user.user_metadata?.user_type === UserType.COMPANY) {
      if (!user.email) {
        throw new Error('User email is required for company creation')
      }

      const { error: companyError } = await supabase.rpc('create_company_with_owner', {
        user_id: user.id,
        company_name: user.user_metadata?.company_name,
        owner_first_name: user.user_metadata?.first_name,
        owner_last_name: user.user_metadata?.last_name,
        company_email: user.email,
        company_website: user.user_metadata?.website_url || null
      })

      if (companyError) {
        console.error('Error creating company:', companyError)
        return NextResponse.redirect(
          new URL('/auth/auth-error?error=Failed to create company records', request.url)
        )
      }
    }

    // Redirect to dashboard with success message
    const successUrl = new URL(next, request.url)
    successUrl.searchParams.set('emailVerified', 'true') // Add success parameter
    return NextResponse.redirect(successUrl)
  } catch (error) {
    console.error('Verification error:', error)
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during verification'
    return NextResponse.redirect(
      new URL(`/auth/auth-error?error=${encodeURIComponent(errorMessage)}`, request.url)
    )
  }
}
