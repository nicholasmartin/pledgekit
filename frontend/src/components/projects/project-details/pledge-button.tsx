'use client'

import { Button } from "@/components/ui/button"
import { PublicProject } from "@/types/domain/project/public"

interface PledgeButtonProps {
  project: PublicProject
  disabled?: boolean
  onPledge?: () => void
}

export function PledgeButton({
  project,
  disabled,
  onPledge
}: PledgeButtonProps) {
  const isExpired = new Date(project.end_date) < new Date()
  
  return (
    <div className="flex justify-end">
      <Button
        size="lg"
        onClick={onPledge}
        disabled={disabled || isExpired}
      >
        {isExpired ? 'Project Ended' : 'Pledge Now'}
      </Button>
    </div>
  )
}