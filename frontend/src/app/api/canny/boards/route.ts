import { NextResponse } from "next/server"
import { getCompanyContext, checkRateLimit, errorResponse, setCacheHeaders } from "../utils"

export async function GET() {
  try {
    // Check rate limit
    const rateLimitError = await checkRateLimit()
    if (rateLimitError) return errorResponse(rateLimitError)

    const { supabase, companyId } = await getCompanyContext()

    // Get boards from our database
    const { data: boards, error } = await supabase
      .from("canny_boards")
      .select("*")
      .eq("company_id", companyId)
      .order("name", { ascending: true })

    if (error) throw error

    // Transform the data to match the expected format
    const transformedBoards = boards.map(board => ({
      id: board.canny_board_id,
      name: board.name,
      postCount: board.post_count,
      lastSyncedAt: board.last_synced_at
    }))

    const response = NextResponse.json({
      boards: transformedBoards,
      lastSyncedAt: boards[0]?.last_synced_at || null
    })

    // Add cache headers
    setCacheHeaders(response)

    return response

  } catch (error: any) {
    console.error("Error in /api/canny/boards:", error)
    return errorResponse(error)
  }
}
