import { z } from 'zod'

export const publicCompanySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable(),
  logoUrl: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
})

export type PublicCompany = z.infer<typeof publicCompanySchema>

// Helper function to validate a company is public
export function isPublicCompany(company: unknown): company is PublicCompany {
  return publicCompanySchema.safeParse(company).success
}
