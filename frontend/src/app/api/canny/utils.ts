import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { RateLimiter } from "limiter"
import { Database } from "@/types/generated/database"
import { PostgrestError } from '@supabase/supabase-js'

// Rate limiter: 100 requests per minute
const limiter = new RateLimiter({
  tokensPerInterval: 100,
  interval: "minute",
})

export interface CannyError {
  message: string;
  status: number;
  code?: string;  // For database error codes
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

// Define strict types for company-related data
type CompanyMember = Database['public']['Tables']['company_members']['Row']
type CompanySettings = Database['public']['Tables']['company_settings']['Row']

type CompanyContext = {
  supabase: ReturnType<typeof createServerClient<Database>>;
  companyId: CompanyMember['company_id'];
  cannyApiKey: NonNullable<CompanySettings['canny_api_key']>;
}

// Get authenticated company context
export async function getCompanyContext(): Promise<CompanyContext> {
  const cookieStore = cookies()

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle edge cases where cookies cannot be set
            console.error('Error setting cookie:', error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // Handle edge cases where cookies cannot be removed
            console.error('Error removing cookie:', error)
          }
        },
      },
    }
  )

  // Check if user is authenticated
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw { message: "Unauthorized", status: 401 }
  }

  // Get user's company
  const { data: companyMember, error: companyError } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)
    .single()

  if (companyError || !companyMember) {
    throw { message: "Company not found", status: 404 }
  }

  // Get company's Canny API key
  const { data: settings, error: settingsError } = await supabase
    .from("company_settings")
    .select("canny_api_key")
    .eq("company_id", companyMember.company_id)
    .single()

  if (settingsError || !settings?.canny_api_key) {
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
export function errorResponse(
  error: CannyError | Error | PostgrestError, 
  status = 500
): NextResponse {
  // Handle PostgrestError specifically
  if ('code' in error) {
    return NextResponse.json({ 
      error: error.message,
      code: error.code 
    }, { 
      status: 'status' in error ? error.status : status 
    })
  }

  // Handle standard errors
  const message = 'message' in error ? error.message : 'Internal server error'
  const statusCode = 'status' in error ? error.status : status
  return NextResponse.json({ error: message }, { status: statusCode })
}

// Cache control helper
export function setCacheHeaders(response: NextResponse): NextResponse {
  // Cache for 5 minutes, allow stale data for up to 1 hour while revalidating
  response.headers.set(
    'Cache-Control',
    'public, s-maxage=300, stale-while-revalidate=3600'
  )
  return response
}
