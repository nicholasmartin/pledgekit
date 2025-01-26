/**
 * Database Type Helpers
 * 
 * This file contains utility types and functions for working with database types.
 * It provides type-safe access to database tables and transformers for converting
 * between database and domain types.
 */

import { Database } from '../generated/database'

// Type-safe table access
export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type InsertType<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type UpdateType<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']

// Type-safe enum access
export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T]
