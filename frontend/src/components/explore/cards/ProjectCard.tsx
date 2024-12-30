"use client";

import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string;
    goal: number;
    amount_pledged: number;
    end_date: string;
    header_image_url: string;
    company: {
      name: string;
      logo: string;
    };
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  // Calculate funding progress
  const progress = Math.min(Math.round((project.amount_pledged / project.goal) * 100), 100);
  
  // Calculate days remaining
  const daysRemaining = Math.max(
    Math.ceil(
      (new Date(project.end_date).getTime() - new Date().getTime()) / 
      (1000 * 60 * 60 * 24)
    ),
    0
  );

  return (
    <Card className="group overflow-hidden">
      {/* Project Image */}
      <div className="relative aspect-[16/9] overflow-hidden bg-muted">
        {/* Header Image */}
        <img
          src={project.header_image_url}
          alt={project.title}
          className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
        />
        
        {/* Company Logo Overlay */}
        <div className="absolute top-3 left-3">
          <Avatar className="h-8 w-8 border-2 border-background">
            <img src={project.company.logo} alt={project.company.name} />
          </Avatar>
        </div>

        {/* Days Remaining Badge */}
        <div className="absolute top-3 right-3">
          <div className="bg-background/80 backdrop-blur-sm text-xs px-2 py-1 rounded-full">
            {daysRemaining} days left
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {/* Title and Company */}
        <div>
          <h3 className="font-semibold line-clamp-1 group-hover:text-primary transition-colors">
            {project.title}
          </h3>
          <p className="text-sm text-muted-foreground">
            by {project.company.name}
          </p>
        </div>

        {/* Description */}
        <p className="text-sm text-muted-foreground line-clamp-2">
          {project.description}
        </p>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">${project.amount_pledged.toLocaleString()}</span>
            <span className="text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Pledged of ${project.goal.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
