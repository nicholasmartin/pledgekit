/**
 * Canny External Types
 * 
 * This file contains type definitions for the Canny API integration.
 * These types represent the external Canny API structure.
 */

// Canny API Response Types
export type CannyApiPost = {
  id: string
  title: string
  details: string
  status: string
  score: number
  commentCount: number
  board: {
    id: string
    name: string
  }
}
