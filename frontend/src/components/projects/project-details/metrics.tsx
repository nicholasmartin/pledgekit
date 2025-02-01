'use client'

import { PublicProject } from "@/types/domain/project/public"

interface MetricCardProps {
  label: string
  value: string
}

function MetricCard({ label, value }: MetricCardProps) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  )
}

export function ProjectMetrics({ project }: { project: PublicProject }) {
  const timeRemaining = Math.max(0, Math.ceil(
    (new Date(project.end_date).getTime() - new Date().getTime()) / 
    (1000 * 60 * 60 * 24)
  ))

  return (
    <div className="grid grid-cols-2 gap-4">
      <MetricCard
        label="Goal"
        value={`$${project.goal.toLocaleString()}`}
      />
      <MetricCard
        label="Time Remaining"
        value={`${timeRemaining} days`}
      />
    </div>
  )
}