import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Get post details from our database
    const { data: post, error } = await supabase
      .from("canny_posts")
      .select("*")
      .eq("company_id", companyMember.company_id)
      .eq("canny_post_id", params.id)
      .single()

    if (error) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      )
    }

    return NextResponse.json({ post })
  } catch (error) {
    console.error("Error in Canny post details API route:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
