import { createRouteHandlerClient, getClientIp, rateLimit } from "@/lib/supabase/server/route-handlers"
import { NextResponse } from "next/server"
import { createServer } from '@/lib/supabase/server/server'
import { UserType } from '@/types/external/supabase/auth'

/**
 * Rate limit configuration for auth operations
 */
const RATE_LIMITS = {
  confirm: { limit: 5, window: 3600 }, // 5 attempts per hour
}

/**
 * GET /auth/confirm
 * Handles email confirmation and password reset confirmations
 */
export async function GET(request: Request) {
  // Apply strict rate limiting for auth operations
  const ip = getClientIp(request)
  const { success } = await rateLimit(
    ip,
    "auth-confirm",
    RATE_LIMITS.confirm.limit,
    RATE_LIMITS.confirm.window
  )

  if (!success) {
    return new Response(
      JSON.stringify({ error: "Too many confirmation attempts" }),
      { 
        status: 429,
        headers: { "Retry-After": RATE_LIMITS.confirm.window.toString() }
      }
    )
  }

  const { searchParams } = new URL(request.url)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')
  const next = searchParams.get('next') || '/dashboard'

  if (!token_hash || !type) {
    return new Response(
      JSON.stringify({ error: "Missing confirmation parameters" }),
      { status: 400 }
    )
  }

  try {
    const result = await createRouteHandlerClient(request)
    let supabase;
    if (result instanceof Response) {
      // For confirmations, we still want to proceed even if there's no session
      supabase = result.status === 401 ? createServer() : (result as any).supabase;
    } else {
      supabase = result.supabase;
    }

    let error = null
    
    switch (type) {
      case "signup":
        const { error: signupError } = await supabase.auth.verifyOtp({
          token_hash,
          type: "signup",
        })
        error = signupError
        break

      case "recovery":
        const { error: recoveryError } = await supabase.auth.verifyOtp({
          token_hash,
          type: "recovery",
        })
        error = recoveryError
        break

      default:
        return new Response(
          JSON.stringify({ error: "Invalid confirmation type" }),
          { status: 400 }
        )
    }

    if (error) {
      console.error(`Error confirming ${type}:`, error)
      return new Response(
        JSON.stringify({ error: "Confirmation failed" }),
        { status: 400 }
      )
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
        return new Response(
          JSON.stringify({ error: "Failed to create company records" }),
          { status: 500 }
        )
      }
    }

    // Redirect to dashboard with success message
    const successUrl = new URL(next, request.url)
    successUrl.searchParams.set('emailVerified', 'true') // Add success parameter
    return NextResponse.redirect(successUrl)
  } catch (error) {
    console.error("Confirmation error:", error)
    const errorMessage = error instanceof Error ? error.message : 'An error occurred during verification'
    return NextResponse.redirect(
      new URL(`/auth/auth-error?error=${encodeURIComponent(errorMessage)}`, request.url)
    )
  }
}
