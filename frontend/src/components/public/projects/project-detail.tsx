"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { PublicProject } from "@/types/domain/project/public"
import { CalendarIcon } from "@heroicons/react/24/outline"
import Image from "next/image"

interface ProjectDetailProps {
  project: PublicProject
}

export function ProjectDetail({ project }: ProjectDetailProps) {
  const percentageFunded = Math.min((project.amount_pledged / project.goal) * 100, 100)
  const daysLeft = Math.max(0, Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative w-full h-[400px] mb-8">
        <Image
          src={project.header_image_url}
          alt={project.title}
          fill
          className="object-cover rounded-lg"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h1 className="text-3xl font-bold mb-4">{project.title}</h1>
          <div className="prose max-w-none">
            {project.description}
          </div>
        </div>

        <div>
          <Card className="p-6 sticky top-6">
            <div className="space-y-6">
              <div>
                <Progress value={percentageFunded} className="h-2 mb-2" />
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{formatCurrency(project.amount_pledged)} raised</span>
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

              <Button className="w-full" size="lg">
                Back this project
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
