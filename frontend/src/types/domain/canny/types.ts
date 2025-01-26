/**
 * Canny Domain Types
 * 
 * This file contains the domain types for Canny-related entities.
 * These types represent our business domain model for feature requests.
 */

import { z } from 'zod'
import { cannyPostSchema } from './schema'

export type CannyPost = z.infer<typeof cannyPostSchema>

export type CannyBoard = {
  id: string
  name: string
  postCount: number
  lastSyncedAt: Date
}
