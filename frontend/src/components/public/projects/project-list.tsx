"use client"

import { useCallback, useEffect, useState } from "react"
import { useInView } from "react-intersection-observer"
import { useSupabase } from "@/lib/supabase/hooks"
import { PublicProject } from "@/types/domain/project/public"
import { toPublicProject } from "@/types/transformers/project"
import { ProjectCard } from "./project-card"

const ITEMS_PER_PAGE = 9

interface ProjectListProps {
  companyId: string
  companySlug: string
  initialProjects?: PublicProject[]
}

export function ProjectList({ companyId, companySlug, initialProjects = [] }: ProjectListProps) {
  const [projects, setProjects] = useState<PublicProject[]>(initialProjects)
  const [isLoading, setIsLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const { ref, inView } = useInView()
  const supabase = useSupabase()

  const loadMoreProjects = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    const from = projects.length
    const to = from + ITEMS_PER_PAGE - 1

    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("company_id", companyId)
        .eq("status", "published")
        .order("created_at", { ascending: false })
        .range(from, to)

      if (error) {
        throw new Error(error.message)
      }

      const validProjects = data
        .map(toPublicProject)
        .filter((p): p is PublicProject => p !== null)

      setProjects(prev => [...prev, ...validProjects])
      setHasMore(data.length === ITEMS_PER_PAGE)
    } catch (error) {
      console.error("Error loading projects:", error)
    } finally {
      setIsLoading(false)
    }
  }, [companyId, hasMore, isLoading, projects.length, supabase])

  useEffect(() => {
    if (inView) {
      loadMoreProjects()
    }
  }, [inView, loadMoreProjects])

  if (projects.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No projects available at this time.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            companySlug={companySlug}
          />
        ))}
      </div>
      {hasMore && (
        <div ref={ref} className="flex justify-center py-4">
          {isLoading && <div>Loading more projects...</div>}
        </div>
      )}
    </div>
  )
}
