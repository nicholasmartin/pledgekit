'use client'

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { PublicProject } from "@/types/domain/project/public"
import { PublicCompany } from "@/types/domain/company/public"
import { ProjectMetrics } from "./metrics"
import { PledgeButton } from "./pledge-button"
import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"

interface ProjectDetailsProps {
  project: PublicProject
  company: PublicCompany
}

export function ProjectDetails({
  project,
  company,
}: ProjectDetailsProps) {
  const { user } = useAuth()
  const isAuthenticated = !!user

  if (!project) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Project not found</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      {/* Base project info - always shown */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
        <p className="text-lg text-muted-foreground whitespace-pre-wrap">
          {project.description}
        </p>
        <ProjectMetrics project={project} />

        {project.header_image_url && (
          <img
            src={project.header_image_url}
            alt={project.title}
            className="w-full rounded-lg object-cover aspect-video"
          />
        )}
      </div>

      {isAuthenticated ? (
        // Authenticated view - Full details + pledge
        <div className="space-y-6">
          <div className="bg-muted rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">Detailed Information</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Amount Pledged</p>
                <p className="text-2xl font-bold">
                  ${project.amount_pledged.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Progress</p>
                <p className="text-2xl font-bold">
                  {Math.round((project.amount_pledged / project.goal) * 100)}%
                </p>
              </div>
            </div>
          </div>
          <PledgeButton project={project} />
        </div>
      ) : (
        // Public view - Login CTA
        <div className="bg-muted rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">
            Want to support this project?
          </h2>
          <p className="text-muted-foreground mb-4">
            Log in to see full project details and make pledges.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="outline" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}