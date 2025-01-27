"use client"

import { PublicProject } from "@/types/domain/project/public"
import { ProjectCard } from "./project-card"

interface ProjectListProps {
  companyId: string
  companySlug: string
  projects: PublicProject[]
  isLoading?: boolean
  loadMoreRef?: (node?: Element | null) => void
}

export function ProjectList({ companyId, companySlug, projects, isLoading, loadMoreRef }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="container py-12">
        <p className="text-gray-600 text-center">No projects available at this time.</p>
      </div>
    )
  }

  return (
    <div className="container py-8 space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            companySlug={companySlug}
          />
        ))}
      </div>
      <div ref={loadMoreRef} className="flex justify-center py-4">
        {isLoading && <div>Loading more projects...</div>}
      </div>
    </div>
  )
}
