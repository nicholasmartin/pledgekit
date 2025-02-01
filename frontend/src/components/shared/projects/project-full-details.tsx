'use client'

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { PublicProject } from "@/types/domain/project/public"
import { PublicCompany } from "@/types/domain/company/public"
import { ProjectBaseInfo } from "./project-base-info"

interface ProjectFullDetailsProps {
  project: PublicProject
  company: PublicCompany
  onPledge?: () => void
}

export function ProjectFullDetails({ project, company, onPledge }: ProjectFullDetailsProps) {
  if (!project) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Project not found</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-8">
      <ProjectBaseInfo project={project} company={company} />
      
      {/* Additional details only visible to authenticated users */}
      <div className="space-y-6">
        <div className="bg-muted rounded-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">Detailed Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Amount Pledged</p>
              <p className="text-2xl font-bold">${project.amount_pledged.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Progress</p>
              <p className="text-2xl font-bold">
                {Math.round((project.amount_pledged / project.goal) * 100)}%
              </p>
            </div>
          </div>
        </div>

        {/* Pledge action */}
        <div className="flex justify-end">
          <Button 
            size="lg" 
            onClick={onPledge}
            disabled={new Date(project.end_date) < new Date()}
          >
            Pledge Now
          </Button>
        </div>
      </div>
    </div>
  )
}