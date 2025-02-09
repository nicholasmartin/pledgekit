# PledgeKit Architecture Overview

## Authentication & Authorization
- **Pattern:** Unified Protected Layout with Server-Side Authentication
- **Description:** Uses Supabase auth middleware for session management. Implements role-based access control (RBAC) with UserTypes (company|user).
- **Key Features:**
  - Session validation at the edge
  - Role-based navigation and access control
  - Centralized auth state management
  - Rate limiting on sensitive operations

### Accessing Auth Information
- **Pattern:** Centralized Auth Access
- **Description:** Auth information (user and userType) is managed at the layout level and provided through hooks.
- **Implementation:**
  - User type validation in layout: `frontend/src/app/(protected)/dashboard/company/layout.tsx`
  - Auth provider: `frontend/src/components/providers/auth-provider.tsx`
  - **IMPORTANT:** Always use the useAuth hook to access user information
- **Example:**
  ```tsx
  // Correct: Using useAuth hook
  import { useAuth } from '@/components/providers/auth-provider'

  export default function MyComponent() {
    const { user, userType } = useAuth()
    return <div>Welcome {user.email}</div>
  }

  // Incorrect: Don't fetch user/type directly
  export default function MyComponent() {
    const [userType, setUserType] = useState()
    useEffect(() => {
      const supabase = createClient()
      // Don't do this! Use useAuth instead
      const getUserType = async () => {
        const { data } = await supabase.auth.getUser()
      }
    }, [])
  }
  ```

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

### Dashboard Shell Architecture
- **Pattern:** Single Shell Instance
- **Description:** The DashboardShell component is implemented at the root layout level to provide consistent navigation and layout.
- **Key Implementation:**
  - Defined in `frontend/src/app/(protected)/dashboard/layout.tsx`
  - Single instance wraps all dashboard routes
  - Handles responsive navigation and header
  - **IMPORTANT:** Never use DashboardShell in page components as it's already provided by the layout
- **Example:**
  ```tsx
  // Correct: Page component
  export default function MyPage() {
    return (
      <div>
        <h1>My Content</h1>
      </div>
    )
  }

  // Incorrect: Don't wrap with DashboardShell
  export default function MyPage() {
    return (
      <DashboardShell>  // Don't do this!
        <div>
          <h1>My Content</h1>
        </div>
      </DashboardShell>
    )
  }
  ```

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