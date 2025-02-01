# Project Routes Refactor

## Overview

This refactor aligns our project detail pages with the auth modernization efforts while improving component organization and reusability.

### Current State
- Components spread across multiple locations:
  * Route-specific: `/app/(public)/companies/[slug]/projects/[id]/components/`
  * Shared components: `/components/shared/projects/`
- Multiple components handling different states
- Client-side auth checks
- Mixed auth logic

### Goal
Implement a simplified approach with:
- Two clear states (public/authenticated)
- Server-side auth checks
- Better component organization
- Stripe-style navigation

## Component Organization

### Current Structure
```
/app/(public)/companies/[slug]/projects/[id]/
  ├── components/
  │   └── ProjectDetails.tsx    # Route-specific component
  └── page.tsx

/components/shared/projects/    # Shared components
  ├── project-base-info.tsx
  ├── project-full-details.tsx
  └── project-public-view.tsx
```

### New Structure
```
/components
  /projects/                    # Feature module
    /project-details/           # Main project details feature
      ├── index.tsx            # Combined component with both states
      ├── metrics.tsx          # Shared metrics component
      └── pledge-button.tsx    # Pledge functionality
```

Benefits:
- Groups related project components
- Makes components reusable across routes
- Follows Next.js component organization patterns
- Easier to maintain and test

## Implementation

### 1. Feature Module Structure
```typescript
// /components/projects/project-details/index.tsx
interface ProjectDetailsProps {
  project: PublicProject
  company: PublicCompany
  isAuthenticated: boolean
}

export function ProjectDetails({
  project,
  company,
  isAuthenticated
}: ProjectDetailsProps) {
  return (
    <div className="space-y-8">
      {/* Always shown */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold">{project.title}</h1>
        <p className="text-lg text-muted-foreground">
          {project.description}
        </p>
        <ProjectMetrics project={project} />
      </div>

      {isAuthenticated ? (
        <AuthenticatedView project={project} />
      ) : (
        <PublicView />
      )}
    </div>
  )
}

// /components/projects/project-details/metrics.tsx
export function ProjectMetrics({ project }: { project: PublicProject }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <MetricCard
        label="Goal"
        value={`$${project.goal.toLocaleString()}`}
      />
      <MetricCard
        label="Time Remaining"
        value={getTimeRemaining(project.end_date)}
      />
    </div>
  )
}

// /components/projects/project-details/pledge-button.tsx
export function PledgeButton({
  project,
  disabled
}: {
  project: PublicProject
  disabled?: boolean
}) {
  return (
    <Button
      size="lg"
      disabled={disabled || new Date(project.end_date) < new Date()}
      onClick={() => {/* Pledge logic */}}
    >
      Pledge Now
    </Button>
  )
}
```

### 2. Page Integration
```typescript
// app/(public)/companies/[slug]/projects/[id]/page.tsx
import { ProjectDetails } from "@/components/projects/project-details"

export default async function ProjectPage({ params }) {
  const supabase = createServer()
  
  const [
    project,
    { data: { session } }
  ] = await Promise.all([
    getProject(params.id),
    supabase.auth.getSession()
  ])

  return (
    <ProjectDetails
      project={project}
      isAuthenticated={!!session}
    />
  )
}
```

## Implementation Steps

1. **Create New Feature Module**
   - Create project-details directory structure
   - Implement main component with both states
   - Create supporting components (metrics, pledge)

2. **Move and Combine Logic**
   - Move relevant logic from route component
   - Move logic from shared components
   - Combine into new feature module

3. **Update Routes**
   - Update imports in pages
   - Remove old route-specific components
   - Remove old shared components

4. **Auth Integration**
   - Implement server-side session checks
   - Pass auth state through props
   - Remove client-side auth dependencies

## Benefits

1. **Better Organization**
   - Feature-based module structure
   - Clear component hierarchy
   - Better reusability

2. **Simplified States**
   - Two clear auth states
   - Server-side auth checks
   - Cleaner component logic

3. **Improved Maintainability**
   - Related code grouped together
   - Easier to test
   - Better developer experience

## Notes

- Add proper TypeScript types
- Include loading states
- Add error boundaries
- Consider adding analytics
- Document component usage
- Add unit tests for new components