import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get user's company
    const { data: companyMember } = await supabase
      .from("company_members")
      .select("company_id")
      .eq("user_id", user.id)
      .single()

    if (!companyMember) {
      return NextResponse.json(
        { error: "Company not found" },
        { status: 404 }
      )
    }

    // Get company's Canny API key
    const { data: settings } = await supabase
      .from("company_settings")
      .select("canny_api_key")
      .eq("company_id", companyMember.company_id)
      .single()

    if (!settings?.canny_api_key) {
      return NextResponse.json(
        { error: "Canny API key not found" },
        { status: 404 }
      )
    }

    // Make request to Canny API
    const response = await fetch("https://canny.io/api/v1/posts/list", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        apiKey: settings.canny_api_key,
      }),
    })

    if (!response.ok) {
      throw new Error(`Canny API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error in Canny posts API route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
