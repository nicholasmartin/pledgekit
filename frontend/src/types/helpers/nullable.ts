/**
 * Nullable Type Helpers
 * 
 * This file contains utility types and functions for handling nullable fields.
 * It provides type-safe ways to work with null and undefined values.
 */

export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

export type NullableToOptional<T> = {
  [P in keyof T]: T[P] extends null ? never : T[P]
}

// Utility for safely accessing nullable fields
export function assertNonNull<T>(value: T | null | undefined, message?: string): T {
  if (value == null) {
    throw new Error(message ?? 'Value must not be null')
  }
  return value
}
