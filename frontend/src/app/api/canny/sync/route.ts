import { NextResponse } from "next/server"
import { getCompanyContext, checkRateLimit, errorResponse } from "../utils"

export async function POST() {
  try {
    // Check rate limit
    const rateLimitError = await checkRateLimit()
    if (rateLimitError) return errorResponse(rateLimitError)

    const { supabase, companyId, cannyApiKey } = await getCompanyContext()

    // Start sync log
    const { data: syncLog } = await supabase
      .from("canny_sync_logs")
      .insert({
        company_id: companyId,
        status: "in_progress",
        records_synced: 0
      })
      .select()
      .single()

    // Fetch all boards first
    const boardsResponse = await fetch("https://canny.io/api/v1/boards/list", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ apiKey: cannyApiKey })
    })

    if (!boardsResponse.ok) {
      throw new Error(`Canny API error: ${boardsResponse.status}`)
    }

    const boardsData = await boardsResponse.json()
    
    // Upsert boards
    const boardsToUpsert = boardsData.boards.map((board: any) => ({
      company_id: companyId,
      canny_board_id: board.id,
      name: board.name,
      post_count: board.postCount,
      last_synced_at: new Date().toISOString()
    }))

    const { error: boardUpsertError } = await supabase
      .from("canny_boards")
      .upsert(boardsToUpsert, {
        onConflict: 'company_id,canny_board_id'
      })

    if (boardUpsertError) throw boardUpsertError

    // Now fetch all posts
    let allPosts: any[] = []
    let hasMore = true
    let skip = 0
    const limit = 100 // Maximum allowed by Canny API

    // Fetch all posts from Canny
    while (hasMore) {
      const response = await fetch("https://canny.io/api/v1/posts/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ apiKey: cannyApiKey, limit, skip })
      })

      if (!response.ok) {
        throw new Error(`Canny API error: ${response.status}`)
      }

      const data = await response.json()
      allPosts = [...allPosts, ...data.posts]
      hasMore = data.hasMore
      skip += limit

      // Update sync log with progress
      await supabase
        .from("canny_sync_logs")
        .update({
          records_synced: allPosts.length
        })
        .eq("id", syncLog.id)
    }

    // Update local database
    const postsToUpsert = allPosts.map(post => ({
      company_id: companyId,
      canny_post_id: post.id,
      title: post.title,
      details: post.details,
      status: post.status,
      score: post.score,
      comment_count: post.commentCount,
      author_name: post.author?.name,
      url: post.url,
      board_id: post.board?.id,
      board_name: post.board?.name,
      created_at: post.created,
      last_synced_at: new Date().toISOString()
    }))

    // Batch upsert posts in chunks to avoid query size limits
    const CHUNK_SIZE = 500
    for (let i = 0; i < postsToUpsert.length; i += CHUNK_SIZE) {
      const chunk = postsToUpsert.slice(i, i + CHUNK_SIZE)
      const { error: upsertError } = await supabase
        .from("canny_posts")
        .upsert(chunk, {
          onConflict: 'company_id,canny_post_id'
        })

      if (upsertError) throw upsertError
    }

    // Update sync log
    await supabase
      .from("canny_sync_logs")
      .update({
        status: "complete",
        records_synced: postsToUpsert.length
      })
      .eq("id", syncLog.id)

    return NextResponse.json({
      success: true,
      recordsSynced: postsToUpsert.length,
      boardsSynced: boardsToUpsert.length
    })

  } catch (error: any) {
    console.error("Error in /api/canny/sync:", error)

    // Update sync log if error occurs
    if (error.syncLog) {
      const { supabase } = await getCompanyContext()
      await supabase
        .from("canny_sync_logs")
        .update({
          status: "error",
          error_message: error.message
        })
        .eq("id", error.syncLog.id)
    }

    return errorResponse(error)
  }
}
