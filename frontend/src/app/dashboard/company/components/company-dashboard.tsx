"use client"

import { Card } from '@/components/ui/card'
import { ProjectsClient } from '@/components/dashboard/projects/projects-client'
import { DashboardHeader } from '@/components/ui/dashboard-header'
import { PublicPageCard } from '@/components/dashboard/company/public-page-card'
import { ProjectWithPledges } from '@/types/domain/project/types'

interface CompanyDashboardProps {
  companySlug: string
  projects: ProjectWithPledges[]
}

export function CompanyDashboard({ companySlug, projects }: CompanyDashboardProps) {
  const activeProjectsCount = projects?.length || 0

  return (
    <div className="space-y-6 max-w-[1200px]">
      <DashboardHeader
        heading="Company Dashboard"
        text="Manage your projects and view pledge statistics."
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">Active Projects</h3>
            <p className="mt-2 text-3xl font-bold">{activeProjectsCount}</p>
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">Total Pledges</h3>
            {/* Add pledge stats */}
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">Completion Rate</h3>
            {/* Add completion stats */}
          </div>
        </Card>
        <Card>
          <div className="p-6">
            <h3 className="font-semibold">User Engagement</h3>
            {/* Add engagement stats */}
          </div>
        </Card>
      </div>

      <PublicPageCard companySlug={companySlug} />
    </div>
  )
}
