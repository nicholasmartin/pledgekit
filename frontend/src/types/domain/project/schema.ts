/**
 * Project Schema Definitions
 * 
 * This file contains Zod schemas for validating project-related data.
 * These schemas define the shape and validation rules for our domain types.
 */

import { z } from 'zod'

export const projectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable(),
  goal: z.number().int().positive(),
  amountPledged: z.number().int().nullable(),
  status: z.enum(['draft', 'published', 'completed', 'cancelled']),
  endDate: z.string().datetime().transform(str => new Date(str)),
  headerImageUrl: z.string().url().nullable(),
  visibility: z.enum(['public', 'private']),
  companyId: z.string().uuid()
})
