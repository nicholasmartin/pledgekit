/**
 * Canny Schema Definitions
 * 
 * This file contains Zod schemas for validating Canny-related data.
 * These schemas define the shape and validation rules for our domain types.
 */

import { z } from 'zod'

export const cannyPostSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  details: z.string().nullable(),
  status: z.enum(['open', 'under_review', 'planned', 'in_progress', 'complete', 'closed']),
  score: z.number().int(),
  commentCount: z.number().int(),
  authorName: z.string().nullable(),
  boardId: z.string().nullable(),
  boardName: z.string().nullable(),
  project: z.object({
    id: z.string(),
    title: z.string()
  }).nullable(),
  url: z.string().nullable()
})
