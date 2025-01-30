import { rateLimit } from "@/lib/rate-limit"
import { createServer } from "@/lib/supabase/server/server"
import { UserType } from "@/types/external/supabase/auth"
import { NextResponse } from "next/server"
import { z } from "zod"

// Validation schema for registration request
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  companyName: z.string().min(2),
  userType: z.enum([UserType.COMPANY]),
})

export async function POST(request: Request) {
  try {
    // Rate limiting
    const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1"
    const rateLimitResult = await rateLimit(ip, "auth-register", 3, "1h")
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: "Too many registration attempts. Please try again later." },
        { status: 429 }
      )
    }

    // Get and validate request body
    const body = await request.json()
    const result = registerSchema.safeParse(body)
    
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid registration data", details: result.error.issues },
        { status: 400 }
      )
    }

    const { email, password, firstName, lastName, companyName, userType } = result.data

    // Create Supabase client
    const supabase = createServer()

    // Attempt registration
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          company_name: companyName,
          user_type: userType,
        },
      },
    })

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: error.status || 500 }
      )
    }

    return NextResponse.json({
      user: data.user,
      message: "Registration successful. Please check your email to confirm your account.",
    })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json(
      { error: "An unexpected error occurred during registration." },
      { status: 500 }
    )
  }
}
