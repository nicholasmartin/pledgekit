/**
 * User Schema Definitions
 * 
 * This file contains Zod schemas for validating user-related data.
 * These schemas define the shape and validation rules for our domain types.
 */

import { z } from 'zod'

export const userTypeEnum = z.enum(['company_member', 'public_user'])

export const userMetadataSchema = z.object({
  user_type: userTypeEnum,
  first_name: z.string().optional(),
  last_name: z.string().optional()
})

export const userMembershipSchema = z.object({
  company_id: z.string(),
  role: z.string()
}).optional()

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  metadata: userMetadataSchema,
  membership: userMembershipSchema
})
