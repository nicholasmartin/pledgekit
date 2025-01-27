import { z } from 'zod'

export const publicProjectSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1),
  description: z.string(),
  goal: z.number().int().positive(),
  amount_pledged: z.number().int().min(0),
  end_date: z.string(),
  header_image_url: z.string(),
  company_id: z.string().uuid(),
  company_slug: z.string(),
  status: z.literal("published"),
})

export type PublicProject = z.infer<typeof publicProjectSchema>

// Helper function to validate a project is public
export function isPublicProject(project: unknown): project is PublicProject {
  return publicProjectSchema.safeParse(project).success
}
