"use client"

import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { formatCurrency } from "@/lib/utils"
import { PublicProject } from "@/types/domain/project/public"
import { CalendarIcon } from "@heroicons/react/24/outline"
import Image from "next/image"
import Link from "next/link"

interface ProjectCardProps {
  project: PublicProject
  companySlug: string
}

export function ProjectCard({ project, companySlug }: ProjectCardProps) {
  const percentageFunded = Math.min((project.amount_pledged / project.goal) * 100, 100)
  const daysLeft = Math.max(0, Math.ceil((new Date(project.end_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))

  return (
    <Link href={`/companies/${companySlug}/projects/${project.id}`}>
      <Card className="h-full hover:shadow-lg transition-shadow">
        <CardHeader className="p-0">
          <div className="relative w-full h-48">
            <Image
              src={project.header_image_url}
              alt={project.title}
              fill
              className="object-cover rounded-t-lg"
            />
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <h3 className="text-lg font-semibold mb-2">{project.title}</h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {project.description}
          </p>
          <Progress value={percentageFunded} className="h-2 mb-2" />
          <div className="flex justify-between text-sm text-gray-600">
            <span>{formatCurrency(project.amount_pledged)} raised</span>
            <span>{Math.round(percentageFunded)}%</span>
          </div>
        </CardContent>
        <CardFooter className="px-4 py-3 border-t">
          <div className="flex items-center text-sm text-gray-600">
            <CalendarIcon className="h-4 w-4 mr-1" />
            <span>{daysLeft} days left</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
