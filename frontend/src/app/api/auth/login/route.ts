import { rateLimit } from "@/lib/rate-limit"
import { createServer } from "@/lib/supabase/server/server"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1"
    const rateLimitResult = await rateLimit(ip, "auth-login", 5, "1h")
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many login attempts. Please try again later." },
        { status: 429 }
      )
    }

    // Get request body
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = createServer()

    // Attempt login
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      )
    }

    // Get user type for redirect
    const userType = data.user?.user_metadata?.user_type

    return NextResponse.json({
      user: data.user,
      userType,
    })
  } catch (error) {
    console.error("[Auth API] Login error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    )
  }
}
