import { notFound } from "next/navigation"
import { cookies } from "next/headers"
import { createServer } from "@/lib/supabase/server"
import { toPublicProject } from "@/types/transformers/project"

interface PageParams {
  params: {
    slug: string
    id: string
  }
}

export async function getProjectData({ params }: PageParams) {
  // Must call cookies() before any Supabase calls as per SSR requirements
  cookies()
  const supabase = createServer()
  
  // Fetch project
  const { data: project, error } = await supabase
    .from("projects")
    .select("*, pledge_options(*)")
    .eq("id", params.id)
    .eq("status", "published") // Ensure only published projects are visible
    .single()

  if (error || !project) {
    console.error('Error fetching project:', error)
    return null
  }

  return toPublicProject(project)
}
