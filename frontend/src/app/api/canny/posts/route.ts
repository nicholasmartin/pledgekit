import { cookies } from "next/headers"
import { NextResponse } from "next/server"
import { getCompanyContext, checkRateLimit, errorResponse, setCacheHeaders } from "../utils"
import { Database } from "@/lib/database.types"

type CannyPost = Database['public']['Tables']['canny_posts']['Row'] & {
  projects: {
    id: string;
    title: string;
  } | null;
}

export async function POST(request: Request) {
  try {
    // Check rate limit
    const rateLimitError = await checkRateLimit()
    if (rateLimitError) return errorResponse(rateLimitError)

    const { sortBy = "score", sortDirection = "desc", postIds } = await request.json() as {
      sortBy?: "score" | "comment_count" | "created_at";
      sortDirection?: "asc" | "desc";
      postIds?: string[];
    }
    
    // Validate parameters
    if (sortBy && !["score", "comment_count", "created_at"].includes(sortBy)) {
      return errorResponse({ message: "Invalid sort field", status: 400 })
    }
    
    if (sortDirection && !["asc", "desc"].includes(sortDirection)) {
      return errorResponse({ message: "Invalid sort direction", status: 400 })
    }

    const { supabase, companyId } = await getCompanyContext()

    // Get the last sync time
    const { data: lastSync, error: syncError } = await supabase
      .from("canny_sync_logs")
      .select("created_at")
      .eq("company_id", companyId)
      .eq("status", "complete")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (syncError) {
      console.error("Error fetching last sync time:", syncError)
    }

    let query = supabase
      .from("canny_posts")
      .select(`
        *,
        projects (
          id,
          title
        )
      `)
      .eq("company_id", companyId)

    // Filter by specific post IDs if provided
    if (postIds?.length) {
      query = query.in("canny_post_id", postIds)
    }

    // Apply sorting
    const sortField = sortBy === "score" ? "score" : 
                     sortBy === "comment_count" ? "comment_count" : "created_at"
    query = query.order(sortField, { ascending: sortDirection === "asc" })

    const { data: posts, error } = await query

    if (error) throw error

    // Transform the data to match the expected format
    const transformedPosts = (posts as CannyPost[]).map(post => ({
      id: post.id,
      canny_post_id: post.canny_post_id,
      title: post.title,
      details: post.details,
      status: post.status,
      score: post.score,
      commentCount: post.comment_count,
      created: post.created_at,
      board: {
        id: post.board_id,
        name: post.board_name
      },
      author: {
        name: post.author_name
      },
      project: post.projects ? {
        id: post.projects.id,
        title: post.projects.title
      } : null
    }))

    const response = NextResponse.json({
      posts: transformedPosts,
      lastSyncedAt: lastSync?.created_at
    })

    // Add cache headers
    setCacheHeaders(response)

    return response

  } catch (error: any) {
    console.error("Error in /api/canny/posts:", error)
    return errorResponse(error)
  }
}
