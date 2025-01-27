# Project Structure Analysis and Refactoring Plan

## Current Structure Analysis

### Routes and Pages

1. **Public Project Pages**
   - `/companies/[slug]` - Company profile with published projects
   - `/companies/[slug]/projects/[id]` - Public project detail page
   
2. **Dashboard (Internal) Pages**
   - `/dashboard/company/projects` - Internal project management
   - `/dashboard/company/projects/[id]` - Project preview/edit page
   - `/dashboard/company/projects/[id]/edit` - Project edit form
   - `/dashboard/company/projects/new` - New project creation

### Components and Types

1. **Components**
   - `components/companies/company-projects.tsx` - Used for both public and dashboard views
   - `components/companies/project-detail.tsx` - Mixed usage between public/dashboard

2. **Types and Schemas**
   - `types/domain/project/schema.ts` - Project type definitions
   - `types/domain/company/schema.ts` - Company-related types

## Issues Identified

1. **Component Reuse Confusion**
   - The same components are being used for both public and dashboard views
   - This creates type conflicts as dashboard needs to handle all project statuses while public only shows published
   - Type guards are becoming complex due to mixed concerns

2. **Unclear Data Flow**
   - No clear separation between public and internal project data
   - Type definitions don't reflect the different requirements of public vs dashboard views

3. **Mixed Responsibilities**
   - Components are trying to handle too many use cases
   - No clear separation between public presentation and internal management

## Proposed Solutions

1. **Separate Public and Dashboard Components**
   ```
   components/
   ├── public/
   │   ├── projects/
   │   │   ├── project-card.tsx
   │   │   ├── project-detail.tsx
   │   │   └── project-list.tsx
   ├── dashboard/
   │   ├── projects/
   │   │   ├── project-form.tsx
   │   │   ├── project-preview.tsx
   │   │   └── project-list.tsx
   ```

2. **Split Type Definitions**
   ```
   types/domain/project/
   ├── base.ts           # Shared project types
   ├── public.ts         # Public-facing project types
   └── dashboard.ts      # Dashboard-specific project types
   ```

3. **Clear Data Models**
   - Create separate interfaces for different project views:
     ```typescript
     // Public project (published only)
     interface PublicProject {
       id: string
       title: string
       description: string
       goal: number
       amount_pledged: number
       end_date: string
       header_image_url: string
       company_id: string
       status: "published" // Only published status
     }

     // Dashboard project (all statuses)
     interface DashboardProject {
       id: string
       title: string
       description: string | null
       goal: number
       amount_pledged: number | null
       end_date: string
       header_image_url: string | null
       company_id: string
       status: "draft" | "published" | "completed" | "cancelled"
       visibility: string | null
       created_at: string | null
       updated_at: string | null
     }
     ```

## Implementation Steps

1. **Create New Component Structure**
   - Create new directories for public and dashboard components
   - Move existing components to appropriate locations
   - Update imports in all files

2. **Update Type Definitions**
   - Create new type files with clear separation of concerns
   - Update existing components to use appropriate types
   - Add proper type guards for each context

3. **Refactor Pages**
   - Update page components to use new component structure
   - Ensure proper data fetching based on context
   - Add proper error handling and loading states

4. **Data Fetching**
   - Add proper filters for public vs dashboard queries
   - Ensure published-only filter for public views
   - Add proper type guards for each context

## Benefits

1. **Clear Separation of Concerns**
   - Each component has a single responsibility
   - Types accurately reflect data requirements
   - Easier to maintain and debug

2. **Improved Type Safety**
   - Proper type definitions for each context
   - Reduced need for complex type guards
   - Better TypeScript inference

3. **Better User Experience**
   - Clear separation between public and internal views
   - Proper handling of project statuses
   - Improved error handling and loading states
