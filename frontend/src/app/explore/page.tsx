"use client";

import { useState } from "react";
import ExploreLayout from "@/components/explore/layout/ExploreLayout";
import FilterSidebar from "@/components/explore/layout/FilterSidebar";
import MainContent from "@/components/explore/layout/MainContent";
import ProjectCard from "@/components/explore/cards/ProjectCard";
import CompanyCard from "@/components/explore/cards/CompanyCard";

// Mock companies data
const mockCompanies = [
  {
    id: "1",
    name: "SecureStack",
    description: "Enterprise-grade authentication and security solutions for modern applications. Trusted by thousands of companies worldwide.",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=SecureStack",
    stats: {
      totalProjects: 8,
      activeProjects: 2,
      successfulProjects: 5
    },
    subscription_tier: "enterprise"
  },
  {
    id: "2",
    name: "CodeAI",
    description: "Pioneering AI-powered developer tools that enhance productivity and code quality. Building the future of software development.",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=CodeAI",
    stats: {
      totalProjects: 5,
      activeProjects: 1,
      successfulProjects: 3
    },
    subscription_tier: "growth"
  },
  {
    id: "3",
    name: "DataViz Pro",
    description: "Creating beautiful and intuitive data visualization tools. Making complex data accessible and actionable for everyone.",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=DataViz",
    stats: {
      totalProjects: 6,
      activeProjects: 2,
      successfulProjects: 4
    },
    subscription_tier: "growth"
  },
  {
    id: "4",
    name: "CloudBackup",
    description: "Reliable and secure cloud backup solutions for businesses of all sizes. Protecting your data with enterprise-grade security.",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=CloudBackup",
    stats: {
      totalProjects: 4,
      activeProjects: 1,
      successfulProjects: 2
    },
    subscription_tier: "starter"
  },
  {
    id: "5",
    name: "MobileMetrics",
    description: "Advanced mobile app analytics and monitoring. Helping developers build better mobile experiences through data-driven insights.",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=MobileMetrics",
    stats: {
      totalProjects: 3,
      activeProjects: 1,
      successfulProjects: 1
    },
    subscription_tier: "starter"
  },
  {
    id: "6",
    name: "GraphTools",
    description: "Modern GraphQL development tools and utilities. Simplifying API development with powerful automation and best practices.",
    logo: "https://api.dicebear.com/7.x/shapes/svg?seed=GraphTools",
    stats: {
      totalProjects: 7,
      activeProjects: 2,
      successfulProjects: 4
    },
    subscription_tier: "growth"
  }
];

// Mock data
const mockProjects = [
  {
    id: "1",
    title: "Advanced Authentication System",
    description: "Implement OAuth2, SSO, and MFA with an easy-to-use API and dashboard. Perfect for enterprise applications requiring secure and flexible authentication.",
    goal: 50000,
    amount_pledged: 35000,
    end_date: "2024-01-30T00:00:00Z",
    header_image_url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5",
    company: {
      name: "SecureStack",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=SecureStack"
    }
  },
  {
    id: "2",
    title: "AI-Powered Code Review Assistant",
    description: "Automated code review tool that uses AI to detect bugs, security vulnerabilities, and suggest improvements. Integrates with GitHub, GitLab, and Bitbucket.",
    goal: 75000,
    amount_pledged: 45000,
    end_date: "2024-02-15T00:00:00Z",
    header_image_url: "https://images.unsplash.com/photo-1555949963-ff9fe0c870eb",
    company: {
      name: "CodeAI",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=CodeAI"
    }
  },
  {
    id: "3",
    title: "Real-time Analytics Dashboard",
    description: "Beautiful and performant analytics dashboard with real-time updates, customizable widgets, and support for multiple data sources.",
    goal: 40000,
    amount_pledged: 38000,
    end_date: "2024-01-20T00:00:00Z",
    header_image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71",
    company: {
      name: "DataViz Pro",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=DataViz"
    }
  },
  {
    id: "4",
    title: "Serverless Database Backup Solution",
    description: "Automated backup system for popular databases with point-in-time recovery, encryption, and multi-cloud support. Perfect for mission-critical applications.",
    goal: 30000,
    amount_pledged: 28500,
    end_date: "2024-01-25T00:00:00Z",
    header_image_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31",
    company: {
      name: "CloudBackup",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=CloudBackup"
    }
  },
  {
    id: "5",
    title: "Mobile App Performance Monitor",
    description: "Real-time performance monitoring for mobile apps. Track crashes, ANRs, and performance metrics with detailed analytics and alerting.",
    goal: 45000,
    amount_pledged: 12000,
    end_date: "2024-02-28T00:00:00Z",
    header_image_url: "https://images.unsplash.com/photo-1526498460520-4c246339dccb",
    company: {
      name: "MobileMetrics",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=MobileMetrics"
    }
  },
  {
    id: "6",
    title: "GraphQL Schema Generator",
    description: "Automatically generate GraphQL schemas from your database structure with type safety and documentation. Supports PostgreSQL, MySQL, and MongoDB.",
    goal: 25000,
    amount_pledged: 23000,
    end_date: "2024-01-15T00:00:00Z",
    header_image_url: "https://images.unsplash.com/photo-1623282033815-40b05d96c903",
    company: {
      name: "GraphTools",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=GraphTools"
    }
  },
  {
    id: "7",
    title: "Kubernetes Cost Optimizer",
    description: "AI-powered Kubernetes resource optimization tool. Automatically adjust resource limits and requests based on actual usage patterns.",
    goal: 60000,
    amount_pledged: 15000,
    end_date: "2024-03-01T00:00:00Z",
    header_image_url: "https://images.unsplash.com/photo-1667372393119-3d4c48d07fc9",
    company: {
      name: "KubeSave",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=KubeSave"
    }
  },
  {
    id: "8",
    title: "API Documentation Generator",
    description: "Generate beautiful, interactive API documentation from OpenAPI specs. Includes code samples, playground, and versioning support.",
    goal: 35000,
    amount_pledged: 31000,
    end_date: "2024-01-18T00:00:00Z",
    header_image_url: "https://images.unsplash.com/photo-1516259762381-22954d7d3ad2",
    company: {
      name: "DocGen",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=DocGen"
    }
  },
  {
    id: "9",
    title: "E2E Testing Framework",
    description: "Modern end-to-end testing framework with AI-powered test generation, visual regression testing, and cross-browser support.",
    goal: 55000,
    amount_pledged: 42000,
    end_date: "2024-02-10T00:00:00Z",
    header_image_url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6",
    company: {
      name: "TestMaster",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=TestMaster"
    }
  },
  {
    id: "10",
    title: "CI/CD Pipeline Analyzer",
    description: "Analyze and optimize your CI/CD pipelines. Identify bottlenecks, suggest improvements, and track metrics over time.",
    goal: 40000,
    amount_pledged: 8000,
    end_date: "2024-03-15T00:00:00Z",
    header_image_url: "https://images.unsplash.com/photo-1618401471353-b98afee0b2eb",
    company: {
      name: "PipelineOps",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=PipelineOps"
    }
  },
  {
    id: "11",
    title: "Cloud Cost Management Platform",
    description: "Unified cloud cost management platform for AWS, Azure, and GCP. Features include budget alerts, cost allocation, and optimization recommendations.",
    goal: 80000,
    amount_pledged: 65000,
    end_date: "2024-02-05T00:00:00Z",
    header_image_url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa",
    company: {
      name: "CloudCosts",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=CloudCosts"
    }
  },
  {
    id: "12",
    title: "Feature Flag Management System",
    description: "Enterprise-grade feature flag management with A/B testing, gradual rollouts, and detailed analytics. Includes SDKs for all major platforms.",
    goal: 45000,
    amount_pledged: 41000,
    end_date: "2024-01-22T00:00:00Z",
    header_image_url: "https://images.unsplash.com/photo-1557853197-aefb550b6fdc",
    company: {
      name: "FeatureFlow",
      logo: "https://api.dicebear.com/7.x/shapes/svg?seed=FeatureFlow"
    }
  }
];

export default function ExplorePage() {
  const [activeView, setActiveView] = useState<'projects' | 'companies'>('projects');

  return (
    <ExploreLayout activeView={activeView} onViewChange={setActiveView}>
      <MainContent view={activeView}>
        {activeView === 'projects' ? (
          // Projects Grid
          mockProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))
        ) : (
          // Companies Grid
          mockCompanies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))
        )}
      </MainContent>
    </ExploreLayout>
  );
}
