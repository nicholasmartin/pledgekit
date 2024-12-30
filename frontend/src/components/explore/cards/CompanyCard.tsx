"use client";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Building2, Rocket, CheckCircle2, Timer } from "lucide-react";

interface CompanyCardProps {
  company: {
    id: string;
    name: string;
    description: string;
    logo: string;
    stats: {
      totalProjects: number;
      activeProjects: number;
      successfulProjects: number;
    };
    subscription_tier: string;
  };
}

export default function CompanyCard({ company }: CompanyCardProps) {
  // Calculate success rate
  const successRate = Math.round(
    (company.stats.successfulProjects / company.stats.totalProjects) * 100
  ) || 0;

  return (
    <Card className="group overflow-hidden">
      {/* Header */}
      <div className="relative h-32 bg-gradient-to-r from-primary/10 via-primary/5 to-background p-6">
        {/* Company Logo */}
        <div className="absolute -bottom-8 left-6">
          <Avatar className="h-16 w-16 border-4 border-background shadow-md">
            <img src={company.logo} alt={company.name} />
          </Avatar>
        </div>
        
        {/* Subscription Tier Badge */}
        <div className="absolute top-4 right-4">
          <Badge variant={company.subscription_tier === 'enterprise' ? 'default' : 'secondary'}>
            {company.subscription_tier}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 pt-10 space-y-4">
        {/* Company Info */}
        <div>
          <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
            {company.name}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
            {company.description}
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          {/* Projects Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <Building2 className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium">{company.stats.totalProjects}</span>
                {" "}Total Projects
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Rocket className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium">{company.stats.activeProjects}</span>
                {" "}Active Now
              </span>
            </div>
          </div>

          {/* Success Stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium">{company.stats.successfulProjects}</span>
                {" "}Successful
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Timer className="h-4 w-4 text-muted-foreground" />
              <span>
                <span className="font-medium">{successRate}%</span>
                {" "}Success Rate
              </span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
