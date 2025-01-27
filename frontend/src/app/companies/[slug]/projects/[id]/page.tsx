"use client"

import { notFound } from "next/navigation"
import { ProjectDetail } from "@/components/public/projects/project-detail"
import { getProjectData } from "./page.server"

interface PageParams {
  params: {
    slug: string
    id: string
  }
}

export default async function ProjectDetailPage({ params }: PageParams) {
  const project = await getProjectData({ params })

  if (!project) {
    return notFound()
  }

  return (
    <div className="container py-8">
      <ProjectDetail project={project} />
    </div>
  )
}
