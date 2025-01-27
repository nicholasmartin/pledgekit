import Link from "next/link"
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { PublicProject } from "@/types/domain/project/public"

interface ProjectCardProps {
  project: PublicProject
}

export function ProjectCard({ project }: ProjectCardProps) {
  const progress = (project.amount_pledged / project.goal) * 100
  const endDate = new Date(project.end_date)
  const now = new Date()
  const daysRemaining = Math.ceil(
    (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <Link href={`/companies/${project.company_slug}/projects/${project.id}`}>
      <Card className="overflow-hidden transition-shadow hover:shadow-lg">
        {project.header_image_url && (
          <div className="aspect-video w-full overflow-hidden">
            <img
              src={project.header_image_url}
              alt={project.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}
        
        <CardHeader>
          <CardTitle className="text-lg font-bold">
            <Link href={`/companies/${project.company_slug}/projects/${project.id}`} className="hover:underline">
              {project.title}
            </Link>
          </CardTitle>
          <p className="line-clamp-2 text-sm text-muted-foreground">
            {project.description || "No description available"}
          </p>
        </CardHeader>
        
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>${project.amount_pledged.toLocaleString()}</span>
              <span>
                {progress.toFixed(0)}% of ${project.goal.toLocaleString()}
              </span>
            </div>
            
            <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${Math.min(100, progress)}%` }}
              />
            </div>
          </div>
        </CardContent>
        
        <CardFooter>
          <div className="flex w-full justify-between text-sm text-muted-foreground">
            <span>{daysRemaining} days remaining</span>
            <span>Ends {endDate.toLocaleDateString()}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  )
}
