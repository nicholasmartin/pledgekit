'use client'

import { Button } from "@/components/ui/button"
import { PublicProject } from "@/types/domain/project/public"
import { PublicCompany } from "@/types/domain/company/public"
import { ProjectBaseInfo } from "./project-base-info"
import Link from "next/link"
import { useSafeAuth } from "@/components/providers/auth-provider"

interface ProjectPublicViewProps {
  project: PublicProject
  company: PublicCompany
}

export function ProjectPublicView({ project, company }: ProjectPublicViewProps) {
  const { userDetails } = useSafeAuth()
  const isAuthenticated = !!userDetails

  return (
    <div className="space-y-8">
      <ProjectBaseInfo project={project} company={company} />
      
      {/* Login CTA for unauthenticated users */}
      {!isAuthenticated && (
        <div className="bg-muted rounded-lg p-6 text-center">
          <h2 className="text-xl font-semibold mb-2">Want to support this project?</h2>
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

      {/* Preview of detailed information */}
      <div className="opacity-60">
        <div className="bg-muted rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Project Progress</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Goal</p>
              <p className="text-2xl font-bold">${project.goal.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Time Remaining</p>
              <p className="text-2xl font-bold">
                {Math.max(0, Math.ceil((new Date(project.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))} days
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}