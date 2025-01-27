"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { DashboardProject } from "@/types/domain/project/dashboard"
import { CalendarIcon } from "@heroicons/react/24/outline"
import Image from "next/image"

interface ProjectPreviewProps {
  project: DashboardProject
  pledgeOptions: {
    amount: number
    benefits: string[]
    created_at: string | null
    description: string | null
    id: string
    project_id: string | null
    title: string
  }[]
}

export function ProjectPreview({ project, pledgeOptions }: ProjectPreviewProps) {
  const percentageFunded = Math.min((project.amount_pledged || 0) / project.goal * 100, 100)
  const daysLeft = Math.max(0, Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
        This is a preview of how your project will appear to the public. Make changes in the edit form to update this preview.
      </div>

      <div className="relative w-full h-[400px] mb-8">
        <Image
          src={project.header_image_url || '/placeholder-project.jpg'}
          alt={project.title}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
          <div className="prose max-w-none">
            {project.description || 'No description provided yet.'}
          </div>
        </div>

        <div>
          <Card className="p-6 sticky top-6">
            <div className="space-y-6">
              <div>
                <Progress value={percentageFunded} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatCurrency(project.amount_pledged || 0)} raised</span>
                  <span>{Math.round(percentageFunded)}%</span>
                </div>
              </div>

              <div>
                <div className="text-2xl font-bold mb-1">
                  {formatCurrency(project.goal)}
                </div>
                <div className="text-sm text-gray-600">funding goal</div>
              </div>

              <div>
                <div className="flex items-center text-2xl font-bold mb-1">
                  <span>{daysLeft}</span>
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <CalendarIcon className="h-4 w-4 mr-1" />
                  <span>days left</span>
                </div>
              </div>

              <Button className="w-full" size="lg" disabled>
                Back this project
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
