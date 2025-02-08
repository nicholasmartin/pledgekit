'use client'

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { PublicProject } from "@/types/domain/project/public"
import { PublicCompany } from "@/types/domain/company/public"
import { ProjectMetrics } from "./metrics"
import { PledgeOptions } from "./pledge-options"
import { useAuth } from "@/components/providers/auth-provider"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import type { Database } from "@/types/generated/database"
import type { UserProjectPledge } from "@/types/domain/pledge"

type PledgeOption = Database['public']['Tables']['pledge_options']['Row']

interface ProjectDetailsProps {
  project: PublicProject
  company: PublicCompany
  pledgeOptions: PledgeOption[]
  userPledges?: UserProjectPledge[]
}

export function ProjectDetails({
  project,
  company,
  pledgeOptions,
  userPledges = [],
}: ProjectDetailsProps) {
  const { user } = useAuth()
  const isAuthenticated = !!user
  const progress = Math.round((project.amount_pledged / project.goal) * 100)

  if (!project) {
    return (
      <Alert variant="destructive">
        <AlertDescription>Project not found</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Column - Main Content */}
      <div className="lg:col-span-2 space-y-6">
        {project.header_image_url && (
          <img
            src={project.header_image_url}
            alt={project.title}
            className="w-full rounded-lg object-cover aspect-video"
          />
        )}
        <h1 className="text-4xl font-bold tracking-tight">{project.title}</h1>
        <p className="text-lg text-muted-foreground whitespace-pre-wrap">
          {project.description}
        </p>
      </div>

      {/* Right Column - Project Details */}
      <div className="space-y-6">
        <div className="bg-muted rounded-lg p-6">
          <div className="space-y-6">
            {/* Status */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Status</h3>
              <p className="text-lg font-semibold">{project.status}</p>
            </div>

            {/* Goal */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Goal</h3>
              <p className="text-2xl font-bold">${project.goal.toLocaleString()}</p>
            </div>

            {/* Amount Pledged */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Amount Pledged</h3>
              <p className="text-2xl font-bold">${project.amount_pledged.toLocaleString()}</p>
            </div>

            {/* Progress */}
            <div>
              <div className="flex justify-between mb-2">
                <h3 className="text-sm font-medium text-muted-foreground">Progress</h3>
                <span className="text-sm font-medium">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Time Remaining */}
            <div>
              <h3 className="text-sm font-medium text-muted-foreground">Time Remaining</h3>
              <p className="text-lg font-semibold">30 days</p>
            </div>
          </div>
        </div>

        {isAuthenticated ? (
          <PledgeOptions 
            options={pledgeOptions} 
            projectId={project.id}
            project={project}
            disabled={project.status !== 'published'}
            userPledges={userPledges}
          />
        ) : (
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
    </div>
  )
}