/**
 * Canny Type Transformers
 * 
 * This file contains functions to transform between database and domain types
 * for Canny-related entities.
 */

import { Tables } from '../helpers/database'
import { CannyPost } from '../domain/canny/types'
import { cannyPostSchema } from '../domain/canny/schema'

export function toCannyPost(dbPost: Tables<'canny_posts'>): CannyPost {
  return cannyPostSchema.parse({
    id: dbPost.canny_post_id,
    title: dbPost.title,
    details: dbPost.details,
    status: dbPost.status,
    score: dbPost.score,
    commentCount: dbPost.comment_count,
    authorName: dbPost.author_name,
    boardId: dbPost.board_id,
    boardName: dbPost.board_name,
    project: dbPost.project_id ? {
      id: dbPost.project_id,
      title: ''
    } : null
  })
}

export function toDbCannyPost(post: CannyPost): Omit<Tables<'canny_posts'>, 'id' | 'created_at' | 'company_id'> {
  return {
    canny_post_id: post.id,
    title: post.title,
    details: post.details,
    status: post.status,
    score: post.score,
    comment_count: post.commentCount,
    author_name: post.authorName,
    board_id: post.boardId,
    board_name: post.boardName,
    project_id: post.project?.id || null,
    last_synced_at: new Date().toISOString(),
    url: post.url
  }
}
