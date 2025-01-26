/**
 * User Domain Types
 * 
 * This file contains the domain types for user-related entities.
 * These types represent our business domain model for users and authentication.
 */

import { z } from 'zod'
import { userSchema, userTypeEnum } from './schema'

export type User = z.infer<typeof userSchema>
export type UserType = z.infer<typeof userTypeEnum>

export type UserWithCompany = User & {
  company?: {
    id: string
    name: string
    slug: string
  }
}
