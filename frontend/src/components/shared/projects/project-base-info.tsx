'use client'

import { Alert, AlertDescription } from "@/components/ui/alert"
import { PublicProject } from "@/types/domain/project/public"
import { PublicCompany } from "@/types/domain/company/public"

interface ProjectBaseInfoProps {
  project: PublicProject
  company: PublicCompany
}

export function ProjectBaseInfo({ project, company }: ProjectBaseInfoProps) {
  if (!project) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Project not found</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4">
      <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
      <p className="text-lg text-muted-foreground whitespace-pre-wrap">{project.description}</p>
      
      <div className="flex justify-between items-center py-4">
        <div>
          <p className="text-sm text-muted-foreground">Goal</p>
          <p className="text-2xl font-bold">${project.goal.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-sm text-muted-foreground">End Date</p>
          <p className="text-2xl font-bold">{new Date(project.end_date).toLocaleDateString()}</p>
        </div>
      </div>

      {project.header_image_url && (
        <img
          src={project.header_image_url}
          alt={project.title}
          className="w-full rounded-lg object-cover aspect-video"
        />
      )}
    </div>
  )
}