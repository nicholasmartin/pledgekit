import { NextResponse } from "next/server"
import { getCompanyContext, errorResponse } from "../../utils"
import { Database } from "@/lib/database.types"

type CannyPost = Database['public']['Tables']['canny_posts']['Row']

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, companyId } = await getCompanyContext()

    // Get post details from our database
    const { data: post, error } = await supabase
      .from("canny_posts")
      .select("*")
      .eq("company_id", companyId)
      .eq("canny_post_id", params.id)
      .single()

    if (error) {
      return errorResponse({ 
        message: "Post not found",
        status: 404 
      })
    }

    return NextResponse.json({ post })
  } catch (error: any) {
    console.error("Error in /api/canny/posts/[id]:", error)
    return errorResponse(error)
  }
}
