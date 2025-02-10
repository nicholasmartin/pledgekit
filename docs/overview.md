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

## App Functionality

PledgeKit is a platform inspired by Kickstarter, specifically designed for software companies and their feature request backlogs. Key features include:

1. **Company Users**:
   - Register and log in to manage their feature request boards.
   - Connect Canny.io feature request boards via API.
   - Create projects based on feature requests, add pledge options, and rewards.

2. **Regular Users**:
   - Register and log in to browse and pledge to projects.
   - Pledge to projects using Stripe for secure payments.

3. **Public Projects**:
   - Projects created by companies are publicly available for users to discover and support.

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

## Company Dashboard Features
- **Pattern:** Server-Side Data Fetching with Client Interactivity
- **Description:** Standard pattern for building company dashboard features that require company-specific data access.

### Implementation Steps
1. **Use Server Components for Data Fetching**
```tsx
// pages/company/my-feature/page.tsx
export default async function MyFeaturePage() {
  const supabase = createServer()
  const user = await getUser(supabase)

  // Standard company data access pattern
  const { data: companyMember } = await supabase
    .from("company_members")
    .select("company_id")
    .eq("user_id", user.id)  // Always filter by user_id!
    .single()

  // Use company_id to fetch feature-specific data
  const { data } = await supabase
    .from("my_table")
    .select("*")
    .eq("company_id", companyMember.company_id)
}
```

2. **Keep Client Components Simple**
```tsx
// components/my-feature.tsx
'use client'

interface Props {
  data: MyData[]  // Receive data as props
}

export function MyFeature({ data }: Props) {
  // Only handle UI and mutations
  const handleDelete = async (id: string) => {
    const supabase = createClient()
    await supabase.from("my_table").delete().eq("id", id)
  }
}
```

### Best Practices
1. **Start with Working Examples**: Check existing implementations (e.g., `pledges` or `users` pages) before building new features.
2. **Data Access Pattern**: Always follow the standard pattern:
   - Get user with `getUser()`
   - Get company_id from `company_members` table (with user_id filter)
   - Use company_id to filter feature data
3. **Component Split**:
   - Server Components: Handle data fetching and initial render
   - Client Components: Handle UI interactions and mutations
4. **Error Handling**: Add proper error logging and user-friendly error messages

### Common Pitfalls to Avoid
1. Don't skip the user_id filter when querying company_members
2. Don't mix data fetching into client components
3. Don't rely on RLS policies alone for data filtering