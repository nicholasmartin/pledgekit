import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { RateLimiter } from "limiter"

// Rate limiter: 100 requests per minute
const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: "minute",
})

export interface CannyError {
  message: string
  status: number
}

// Validate pagination parameters
export function validatePagination(limit?: number | null, skip?: number): CannyError | null {
  if (limit !== null && limit !== undefined && (isNaN(limit) || limit < 1 || limit > 100)) {
    return { message: "Invalid limit parameter. Must be between 1 and 100.", status: 400 }
  }
  if (skip && (isNaN(skip) || skip < 0)) {
    return { message: "Invalid skip parameter. Must be non-negative.", status: 400 }
  }
  return null
}

// Get authenticated company context
export async function getCompanyContext() {
  const supabase = createRouteHandlerClient({ cookies })

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw { message: "Unauthorized", status: 401 }
  }

  // Get user's company
  const { data: companyMember } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single()

  if (!companyMember) {
    throw { message: "Company not found", status: 404 }
  }

  // Get company's Canny API key
  const { data: settings } = await supabase
    .from("company_settings")
    .select("canny_api_key")
    .eq("company_id", companyMember.company_id)
    .single()

  if (!settings?.canny_api_key) {
    throw { message: "Canny API key not found", status: 404 }
  }

  return {
    supabase,
    companyId: companyMember.company_id,
    cannyApiKey: settings.canny_api_key
  }
}

// Rate limit check
export async function checkRateLimit(): Promise<CannyError | null> {
  const hasToken = await limiter.tryRemoveTokens(1)
  if (!hasToken) {
    return { message: "Too many requests. Please try again later.", status: 429 }
  }
  return null
}

// Error response helper
export function errorResponse(error: CannyError | Error, status = 500) {
  const message = 'message' in error ? error.message : 'Internal server error'
  const statusCode = 'status' in error ? error.status : status
  return NextResponse.json({ error: message }, { status: statusCode })
}

// Cache control helper
export function setCacheHeaders(response: NextResponse) {
  // Cache for 5 minutes, allow stale data for up to 1 hour while revalidating
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=3600'
  )
  return response
}
