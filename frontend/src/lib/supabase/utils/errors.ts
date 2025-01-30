/**
 * Type for error parameters that all Supabase-related errors share
 */
type BaseErrorParams = {
  message: string
  cause?: unknown
  code: string
}

/**
 * Base error class for all Supabase-related errors.
 * Provides structured error information for better error handling and debugging.
 */
export class SupabaseError extends Error {
  public readonly code: string
  public readonly cause?: unknown

  constructor({ message, code, cause }: BaseErrorParams) {
    super(message)
    this.name = 'SupabaseError'
    this.code = code
    this.cause = cause
  }
}

/**
 * Error codes specific to authentication operations
 */
export type AuthErrorCode = 
  // User retrieval and session errors
  | 'AUTH_GET_USER_ERROR'
  | 'AUTH_SESSION_ERROR'
  | 'AUTH_UNAUTHORIZED'
  
  // Authentication action errors
  | 'AUTH_SIGN_UP_ERROR'
  | 'AUTH_SIGN_OUT_ERROR'
  | 'AUTH_INVALID_CREDENTIALS'
  
  // User type and metadata errors
  | 'AUTH_INVALID_USER_TYPE'
  | 'AUTH_TYPE_UNEXPECTED_ERROR'
  
  // Rate limiting and security
  | 'AUTH_RATE_LIMIT_EXCEEDED'
  
  // Generic errors
  | 'AUTH_UNEXPECTED_ERROR'
  | 'USER_DETAILS_UNEXPECTED_ERROR'
  | 'COMPANY_ACCESS_UNEXPECTED_ERROR'

/**
 * Authentication-specific error class.
 * Used for errors related to user authentication, sessions, and access control.
 */
export class AuthError extends SupabaseError {
  constructor(params: BaseErrorParams & { code: AuthErrorCode }) {
    super(params)
    this.name = 'AuthError'
  }
}

/**
 * Error codes specific to database operations
 */
export type DatabaseErrorCode = 
  | 'COMPANY_MEMBERSHIP_ERROR'
  | 'GET_MEMBERSHIP_ERROR'
  | 'COMPANY_ACCESS_ERROR'
  | 'DB_QUERY_ERROR'
  | 'DB_INSERT_ERROR'
  | 'DB_UPDATE_ERROR'
  | 'DB_DELETE_ERROR'
  | 'DB_CONSTRAINT_ERROR'

/**
 * Database-specific error class.
 * Used for errors related to database operations, queries, and constraints.
 */
export class DatabaseError extends SupabaseError {
  constructor(params: BaseErrorParams & { code: DatabaseErrorCode }) {
    super(params)
    this.name = 'DatabaseError'
  }
}
