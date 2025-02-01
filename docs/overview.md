# PledgeKit Architecture Overview

## Authentication & Authorization
- **Pattern:** Unified Protected Layout with Server-Side Authentication
- **Description:** Uses Supabase auth middleware for session management. Implements role-based access control (RBAC) with UserTypes (company|user).
- **Key Features:**
  - Session validation at the edge
  - Role-based navigation and access control
  - Centralized auth state management
  - Rate limiting on sensitive operations

## Navigation Structure
- **Pattern:** Role-Based Navigation
- **Description:** Separate navigation configurations for companies and users.
- **Key Features:**
  - Company Dashboard: Projects, Feature Requests, Settings
  - User Dashboard: Pledges, Watchlist, Profile
  - Public Routes: How it Works, Explore

## Data Access
- **Pattern:** Supabase Server Client
- **Description:** Uses server-side client for database operations.
- **Key Features:**
  - Centralized data access layer
  - Cookie-based session management
  - Error handling with SupabaseError
  - Caching for performance

## API Routes
- **Pattern:** Protected API Endpoints
- **Description:** All API routes require authentication.
- **Key Features:**
  - Rate limiting on all routes
  - Unified error response format
  - Session validation
  - Type-safe responses

## UI Components
- **Pattern:** Component-Driven Architecture
- **Description:** Reusable UI components with clear separation of concerns.
- **Key Features:**
  - Dashboard shells with role-based rendering
  - Form components with validation
  - Navigation providers
  - Toast notifications

## Security
- **Pattern:** Edge-Level Security
- **Description:** Security implemented at the edge.
- **Key Features:**
  - Session validation on every request
  - Rate limiting
  - Proper error handling
  - Input validation

## Performance
- **Pattern:** Caching and Optimization
- **Description:** Optimized for performance.
- **Key Features:**
  - Cached server client
  - Parallel data fetching
  - Efficient state management
  - Optimized database queries

## Migration Strategy
- **Pattern:** Incremental Migration
- **Description:** Gradual migration to new architecture.
- **Key Features:**
  - Step-by-step implementation
  - Backwards compatibility
  - Clear rollback plan
  - Comprehensive testing

## Folder/Project Structure
- **Description:** High-level overview of the project structure.
- **Key Folders:**
  - `frontend/src/components/`: Core UI components
  - `frontend/src/lib/supabase/`: Supabase client and server setup
  - `frontend/src/app/`: Next.js pages and layouts
  - `docs/`: Project documentation and architecture details
  - `supabase/migrations/`: Database migration files

## File Structure
- **Key Files:**
  - `frontend/src/config/navigation.ts`: Navigation configuration
  - `frontend/src/lib/supabase/client.ts`: Supabase client setup
  - `frontend/src/lib/supabase/server.ts`: Supabase server client
  - `frontend/src/components/providers/auth-provider.tsx`: Auth provider
  - `frontend/src/app/(protected)/layout.tsx`: Protected layout implementation