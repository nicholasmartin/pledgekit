/**
 * API Response Types
 * 
 * This file contains type definitions for API response payloads.
 * Each response type should correspond to a specific API endpoint.
 */

import { z } from 'zod'

// Example: Will be populated with actual response types
export type ApiResponse<T> = {
  data?: T
  error?: {
    message: string
    code?: string
  }
}
