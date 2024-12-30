# Explore Feature UI Development Roadmap

## Overview
This document outlines the UI-first development approach for the Explore feature. Each component will be built with mock data and focus solely on visual implementation before adding functionality.

## Mock Data Structure

```typescript
// Mock Company Data (matches companies table)
const mockCompanies = [
  {
    id: "uuid-1",
    name: "Acme Corp",
    slug: "acme-corp",
    description: "Leading developer tools company",
    logo: "/mock/logos/acme.png",
    settings: {
      primaryColor: "#2563eb",
      accent: "#1e40af"
    },
    branding: {
      logo: "/mock/logos/acme.png",
      banner: "/mock/banners/acme.png"
    },
    subscription_tier: "growth",
    stats: {
      totalProjects: 5,
      activeProjects: 2,
      successfulProjects: 3
    }
  },
  // Add 4-5 more companies...
];

// Mock Project Data (matches projects table)
const mockProjects = [
  {
    id: "uuid-1",
    company_id: "uuid-1",
    title: "API Authentication System",
    description: "Advanced authentication system with OAuth2 support",
    goal: 50000,
    amount_pledged: 35000,
    end_date: "2024-01-30T00:00:00Z",
    header_image_url: "/mock/projects/auth-system.png",
    status: "published",
    total_views: 1200,
    unique_views: 800,
    visibility: "public"
  },
  // Add 8-9 more projects...
];
```

## Development Tasks

### 1. Base Layout Components (Task ID: BASE-01)
**Purpose**: Create the foundational layout structure for the Explore page

Components to build:
- Main explore page layout with navigation
- Tab system for Projects/Companies views
- Filter sidebar shell
- Main content area with grid layout

```typescript
// Component Structure
<ExploreLayout>
  <ExploreTabs />
  <div className="flex">
    <FilterSidebar />
    <MainContent />
  </div>
</ExploreLayout>
```

**UI Components**:
- shadcn/ui Tabs
- Container component for layout
- Basic responsive grid system

### 2. Filter Sidebar UI (Task ID: FILTER-01)
**Purpose**: Build the visual structure of the filter sidebar

Components to build:
- Search input field
- Category filter accordion
- Status filter checkboxes
- Price range slider
- Clear filters button

**UI Components**:
- shadcn/ui Input
- shadcn/ui Accordion
- shadcn/ui Checkbox
- shadcn/ui Slider
- shadcn/ui Button

### 3. Project Card Component (Task ID: CARD-01)
**Purpose**: Create the project card design

Features:
- Project header image
- Company logo overlay
- Progress bar
- Funding statistics
- Time remaining indicator
- Hover state animations

```typescript
<ProjectCard>
  <ProjectImage />
  <CompanyBadge />
  <ProjectInfo />
  <ProjectStats />
  <ProjectProgress />
</ProjectCard>
```

**UI Components**:
- shadcn/ui Card
- shadcn/ui Progress
- shadcn/ui Badge
- Custom image component with overlay

### 4. Company Card Component (Task ID: CARD-02)
**Purpose**: Create the company card design

Features:
- Company logo
- Company statistics
- Project count badges
- Success rate indicator
- Hover state animations

```typescript
<CompanyCard>
  <CompanyLogo />
  <CompanyInfo />
  <CompanyStats />
  <ProjectCountBadges />
</CompanyCard>
```

**UI Components**:
- shadcn/ui Card
- shadcn/ui Badge
- Custom stat displays

### 5. Grid View Controls (Task ID: GRID-01)
**Purpose**: Implement grid view controls and sorting UI

Components to build:
- View toggle (grid/list)
- Sort dropdown
- Results count
- Grid layout system

**UI Components**:
- shadcn/ui ToggleGroup
- shadcn/ui Select
- shadcn/ui Separator

### 6. Responsive Adaptations (Task ID: RESP-01)
**Purpose**: Implement responsive behavior for all components

Features:
- Collapsible sidebar on mobile
- Adjusted grid columns for different breakpoints
- Mobile-friendly filters
- Touch-friendly interactions

**Breakpoints**:
```css
/* Tailwind breakpoints */
sm: 640px   /* 2 columns */
md: 768px   /* 3 columns */
lg: 1024px  /* 4 columns */
xl: 1280px  /* 4 columns + wider margins */
```

### 7. Loading States (Task ID: LOAD-01)
**Purpose**: Add loading state UI components

Components to build:
- Skeleton loaders for cards
- Loading indicators for filters
- Progressive image loading

**UI Components**:
- shadcn/ui Skeleton
- Custom loading animations
- Image loading placeholders

## Component Directory Structure
```
src/
└── components/
    └── explore/
        ├── layout/
        │   ├── ExploreLayout.tsx
        │   ├── FilterSidebar.tsx
        │   └── MainContent.tsx
        ├── cards/
        │   ├── ProjectCard.tsx
        │   └── CompanyCard.tsx
        ├── filters/
        │   ├── SearchInput.tsx
        │   ├── CategoryFilter.tsx
        │   └── PriceFilter.tsx
        └── controls/
            ├── ViewToggle.tsx
            └── SortSelect.tsx
```

## Implementation Notes

1. Each task should be implemented independently
2. Use Tailwind CSS for styling
3. Include hover states and transitions
4. Maintain consistent spacing using Tailwind's spacing scale
5. Use shadcn/ui's dark mode support
6. Keep accessibility in mind (ARIA labels, keyboard navigation)

## Getting Started

To begin implementation, choose any task ID (e.g., "BASE-01") and request the specific implementation details. Each task is self-contained and can be built independently, though they follow a logical progression.

## Design References

For visual inspiration, reference:
- GitHub Explore page
- ProductHunt
- Kickstarter Discover
