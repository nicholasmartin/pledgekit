# Authentication Modernization

## Overview

### Current Implementation
Currently using:
- React Context (`auth-context.tsx`)
- Client-side auth state
- Component-level auth checks
- Partial protected layout implementation

### Current Protected Layouts
We have an existing protected layout implementation that provides a foundation but needs modernization:

#### Structure
- Central `ProtectedLayout` component in `components/layouts/protected-layout.tsx`
- Used in multiple layouts:
  - `/dashboard/layout.tsx` (base dashboard)
  - `/dashboard/company/layout.tsx` (company-specific)
  - `/dashboard/user/layout.tsx` (user-specific)
  - `/settings/layout.tsx` (settings)

#### Current Features
```typescript
interface ProtectedLayoutProps {
  children: React.ReactNode
  requiredUserType?: UserType
}
```
- Basic auth verification using `getUser()`
- User type validation
- Onboarding flow integration
- Error handling with loading states
- Role-based access control

#### Areas for Improvement
1. **Architecture**
   - Direct auth calls in component should move to middleware
   - Auth logic mixed with UI concerns
   - Multiple auth calls (`getUser` and `getUserType`)

2. **Performance**
   - Redundant auth checks
   - Console logging in production
   - No caching of auth state

3. **Security**
   - Verbose error logging
   - No rate limiting
   - Session validation could be more robust

4. **Code Organization**
   - Mixed concerns in protected layout
   - Duplicated auth logic
   - Inconsistent error handling

### Target Implementation
Moving to:
- Unified Protected Layout Pattern
- Enhanced Middleware
- Server-side auth management

## Benefits
1. Better Performance
   - Reduced client-side state
   - Fewer API calls
   - Smaller bundle size

2. Enhanced Security
   - Server-side validation
   - Consistent auth checks
   - Proper session management

3. Improved Developer Experience
   - Less boilerplate
   - Clearer auth patterns
   - Better maintainability

## Technical Context

### Current Auth Pattern (To Be Replaced)
Currently, user type checks in middleware rely on session data from cookies, which triggers security warnings:
```typescript
// Current pattern (insecure)
const { data: { session } } = await supabase.auth.getSession()
const userType = session?.user?.user_metadata?.user_type
```

### New Auth Pattern
The new pattern uses a unified protected layout for secure user verification:
```typescript
// Unified protected layout example
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Single source of auth truth
  const [userDetails, userType] = await Promise.all([
    getUserDetails(user.id),
    getUserType(user)
  ])
  
  // Make auth data available to all children
  return (
    <AuthProvider
      user={user}
      userDetails={userDetails}
      userType={userType}
    >
      {children}
    </AuthProvider>
  )
}
```

Key improvements:
1. Uses `getUser()` for secure verification
2. Performs type checks at the layout level
3. Keeps middleware lightweight with basic session checks
4. Reduces API calls by verifying once per layout mount

## Progress Tracking
- [x] Step 1: Base Middleware Setup
- [x] Step 2: Unified Protected Layout (requires Step 1)
- [x] Step 2.5: Root Layout Integration (requires Step 2)
- [x] Step 3: Dashboard Shell Layout (requires Step 2.5)
- [x] Step 4: Public Layout Integration (requires Step 3)
- [x] Step 5: API Route Updates (requires Step 1)
- [x] Step 6: Component Auth Updates (requires Steps 1-4)
- [x] Step 7: Auth Hook Updates (requires Step 6)
- [x] Step 8: Migration to New Structure (requires Steps 1-7)
- [ ] Step 9: Cleanup and Finalization (requires Steps 1-8)

## Implementation Strategy

### Step 1: Base Middleware Setup
Pre-conditions:
- None (This is the first step)

Files affected:
- Create/Update: `frontend/src/middleware.ts`
- Create: `frontend/src/lib/supabase/server/middleware.ts`

Implementation details:
```typescript
// middleware.ts
import { createMiddleware } from '@/lib/supabase/server/middleware'

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}

export default createMiddleware()
```

Key features:
- Implements session refresh using Supabase's recommended pattern
- Excludes static assets from auth checks for performance
- Uses Next.js middleware matcher for efficient routing
- Handles CORS and security headers

### Step 2: Unified Protected Layout
Pre-conditions:
- Step 1 completed (Middleware setup)

Files affected:
- Create: `frontend/src/app/(protected)/layout.tsx`
- Modify: `frontend/src/lib/supabase/server/auth.ts`

Current State Analysis:
1. **Existing Types** (`types/external/supabase/auth.ts`):
   - Complete UserType enum and type guard
   - Comprehensive UserDetails type with company info
   - Well-structured type definitions
   - No new types needed

2. **Existing Auth Functions** (`lib/supabase/server/auth.ts`):
   - React.cache optimized functions:
     - getUser() - Gets current authenticated user
     - getUserType() - Gets user type with proper handling
     - getUserDetails() - Gets extended user details
   - Uses SupabaseError for consistent error handling
   - Already server-component compatible

Implementation Strategy:
1. Modify auth functions to:
   - Accept optional Supabase instance from middleware
   - Prevent duplicate client creation
   - Maintain existing caching and error handling

2. Create protected layout that:
   - Uses middleware-provided Supabase instance
   - Leverages existing auth functions
   - Implements proper error boundaries
   - Handles loading states

Implementation details:
```typescript
// lib/supabase/server/auth.ts
import { cache } from 'react'
import { SupabaseClient } from '@supabase/supabase-js'
import { UserType, isUserType } from '@/types/external/supabase/auth'
import type { UserDetails } from '@/types/external/supabase'
import { SupabaseError } from '../utils/errors'
import { createServer } from './server'

// Update functions to accept optional client
export const getUser = cache(async (supabase?: SupabaseClient) => {
  try {
    const client = supabase || createServer()
    const { data: { user }, error } = await client.auth.getUser()
    
    if (error) {
      throw new SupabaseError(
        'Error getting user',
        'AUTH_GET_USER_ERROR',
        error
      )
    }

    return user
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
})

// Other functions updated similarly...

// frontend/src/app/(protected)/layout.tsx
import { redirect } from 'next/navigation'
import { getUser, getUserDetails, getUserType } from '@/lib/supabase/server/auth'
import { AuthProvider } from '@/components/providers/auth-provider'
import { createMiddleware } from '@/lib/supabase/server/middleware'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Use middleware to get Supabase instance and session
  const { supabase, session } = await createMiddleware()
  
  if (!session) {
    redirect('/login')
  }

  // Use existing functions with middleware client
  const [user, userDetails, userType] = await Promise.all([
    getUser(supabase),
    getUserDetails(supabase),
    getUserType(supabase)
  ])

  if (!user) {
    redirect('/login')
  }

  return (
    <AuthProvider
      user={user}
      userDetails={userDetails}
      userType={userType}
    >
      {children}
    </AuthProvider>
  )
}
```

Key features:
1. Auth functions:
   - Accept optional Supabase client
   - Maintain React.cache optimization
   - Keep existing error handling
   - Type-safe implementation

2. Protected layout:
   - Uses middleware for auth check
   - Parallel data fetching
   - Early redirects for security
   - Proper type safety
   - Error boundary support

3. Error Handling:
   - Uses SupabaseError for consistent errors
   - Proper error boundaries
   - Type-safe error handling
   - Clear error messages

4. Performance:
   - Cached auth functions
   - Parallel data fetching
   - Reuse of middleware client
   - Minimal client creation

### Step 2.5: Root Layout Integration
Pre-conditions:
- Step 2 completed (Unified protected layout)

Files affected:
- Create: `frontend/src/components/providers/auth-provider.tsx`
- Create: `frontend/src/components/providers/index.tsx`
- Rename: `frontend/src/components/providers.tsx` to `base-providers.tsx`
- Update: `frontend/src/app/layout.tsx` to use new providers

Implementation Flow:
1. The protected layout (`(protected)/layout.tsx`) fetches user data and passes it to AuthProvider
2. The base providers (`components/providers/base-providers.tsx`) handles non-auth related providers
3. The new providers index (`components/providers/index.tsx`) composes both providers
4. Protected routes use AuthProvider with auth data
5. Public routes only use BaseProviders

Implementation details:
```typescript
// components/providers/auth-provider.tsx
"use client"

import { createContext, useContext } from "react"
import type { User } from "@supabase/supabase-js"
import type { UserDetails, UserType } from "@/types/auth"

interface AuthContextType {
  user: User | null
  userDetails: UserDetails | null
  userType: UserType | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({
  children,
  user,
  userDetails,
  userType,
}: {
  children: React.ReactNode
  user: User | null
  userDetails: UserDetails | null
  userType: UserType | null
}) {
  return (
    <AuthContext.Provider value={{ user, userDetails, userType }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
```

```typescript
// components/providers/index.tsx
import { AuthProvider } from "./auth-provider"
import { BaseProviders } from "./base-providers"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <BaseProviders>
      {/* AuthProvider is only used in protected routes where auth data is available */}
      {children}
    </BaseProviders>
  )
}
```

Key features:
- Separates auth context from other providers
- Maintains existing provider functionality
- Type-safe auth context
- Custom hook for easy auth state access
- Supports both authenticated and unauthenticated routes

Todo:
- Update imports in `frontend/src/app/layout.tsx` to use the new providers path
- Ensure all auth-related provider logic is moved to the new auth provider
- Test both authenticated and unauthenticated routes to verify provider composition works correctly

### Step 3: Dashboard Shell Layout
Pre-conditions:
- Step 2 completed (Unified protected layout)

Files affected:
- Create: `frontend/src/app/(protected)/dashboard/layout.tsx`
- Create: `frontend/src/components/dashboard/shell.tsx`
- Move: Navigation and header components into shell

Implements the unified dashboard shell that handles all UI structure:

```typescript
// frontend/src/app/(protected)/dashboard/layout.tsx
import { DashboardShell } from '@/components/dashboard/shell'
import { useAuth } from '@/components/providers/auth-provider'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Auth data is available from the parent protected layout
  const { userType } = useAuth()
  
  return (
    <DashboardShell userType={userType}>
      {children}
    </DashboardShell>
  )
}
```

```typescript
// frontend/src/components/dashboard/shell.tsx
import { Header } from './header'
import { Navigation } from './navigation'
import type { UserType } from '@/types/auth'

interface ShellProps {
  userType: UserType
  children: React.ReactNode
}

export function DashboardShell({ userType, children }: ShellProps) {
  return (
    <div className="flex h-screen">
      <Navigation userType={userType} />
      <div className="flex-1 flex flex-col">
        <Header userType={userType} />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

### Step 4: Public Layout Integration
Pre-conditions:
- Step 3 completed (Dashboard shell layout)

Files affected:
- Modify: `frontend/src/app/layout.tsx`
- Modify: `frontend/src/app/page.tsx`
- Create: `frontend/src/app/(public)/layout.tsx`

Updates the root layout to handle auth state and sets up public route structure.

### Step 5: API Route Updates
Pre-conditions:
- Step 4 completed (Public Layout Integration)
- Rate limiting configuration:
  - Auth operations: 5 requests per hour
  - Protected API routes: 30 requests per minute
  - Public API routes: 100 requests per minute

Files affected:
- Create: `frontend/src/lib/supabase/server/route-handlers.ts`
- Modify: `frontend/src/app/api/user/route.ts`
  - Replace direct Supabase calls with route handler
  - Add proper error responses
  - Implement rate limiting for sensitive operations

- Modify: `frontend/src/app/api/checkout/route.ts`
  - Add session validation
  - Ensure proper error handling for payment operations
  - Add rate limiting for payment attempts

- Modify: `frontend/src/app/auth/confirm/route.ts`
  - Update to use new auth patterns
  - Add proper error handling for confirmation
  - Implement rate limiting for confirmation attempts

Implementation examples:
```typescript
// lib/supabase/server/route-handlers.ts
import { createServerClient } from "@/lib/supabase/server/server"
import { rateLimit } from "@/lib/rate-limit"

export async function createRouteHandlerClient(request: Request) {
  const supabase = createServerClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  
  if (!session) {
    return new Response("Unauthorized", { status: 401 })
  }
  
  return { supabase, session }
}

// Example usage in API route
// api/user/route.ts
import { createRouteHandlerClient } from "@/lib/supabase/server/route-handlers"

export async function GET(request: Request) {
  const result = await createRouteHandlerClient(request)
  if (result instanceof Response) return result
  
  const { supabase, session } = result
  
  try {
    const { data, error } = await supabase
      .from("users")
      .select()
      .eq("id", session.user.id)
      .single()
      
    if (error) throw error
    
    return Response.json(data)
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Failed to fetch user" }),
      { status: 500 }
    )
  }
}

// Example of rate-limited route
// api/auth/confirm/route.ts
import { rateLimit } from "@/lib/rate-limit"

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for") ?? "127.0.0.1"
  const rateLimitResult = await rateLimit(ip, "auth-confirm", 5, "1h")
  
  if (!rateLimitResult.success) {
    return new Response("Too many attempts", { status: 429 })
  }
  
  // Confirmation logic here
}
```

Key features:
- Consistent auth checking across all API routes
- Proper error handling and status codes
- Type-safe session handling
- Rate limiting on sensitive operations
- Centralized route handler creation

### Step 6: Component Auth Updates
Files affected:
- Modify: `frontend/src/components/navigation/main-nav-client.tsx`
  - Remove direct Supabase auth calls
  - Use new useAuth hook for UI state
  - Keep navigation logic

- Modify: `frontend/src/components/layouts/protected-layout.tsx`
  - This will be largely deprecated
  - Move most logic to new (protected) layout
  - Keep only UI-specific code if needed
  - Consider deleting if purely auth-related

- Modify: `frontend/src/components/forms/login-form.tsx`
  - Update to use new route handlers
  - Remove direct Supabase client usage
  - Implement proper error handling
  - Add rate limiting integration

### Step 7: Auth Hook Updates
Pre-conditions:
- Step 6 completed (Component updates)

Files affected:
- Modify: `frontend/src/hooks/use-access-control.ts`
- Modify: `frontend/src/lib/rbac.ts`
- Modify: `frontend/src/lib/supabase/server/auth.ts`
- Modify: `frontend/src/lib/supabase/client/auth.ts`

Updates hooks and utilities to align with new auth patterns.

### Step 8: Migration to New Structure
Pre-conditions:
- Steps 1-7 completed (New auth infrastructure in place)

Files affected:
- Modify: `frontend/src/components/layouts/protected-layout.tsx`
- Modify: `frontend/src/app/dashboard/layout.tsx`
- Modify: `frontend/src/app/dashboard/company/layout.tsx`
- Modify: `frontend/src/app/dashboard/user/layout.tsx`
- Modify: `frontend/src/app/settings/layout.tsx`

This step migrates existing protected layouts to use the new auth patterns:
- Move auth logic to middleware
- Remove direct auth calls
- Update error handling
- Implement proper loading states

### Step 9: Cleanup and Finalization
Pre-conditions:
- All previous steps completed

Files affected:
- Remove: Any remaining auth context files
- Remove: Deprecated auth utilities
- Remove: Old console.log statements
- Update: Documentation
- Update: Type definitions

Final cleanup and verification of the new auth system.

## Reference Implementations

### Base Protected Layout
```typescript
// app/protected/layout.tsx
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return children
}
```

### Enhanced Middleware
```typescript
// server/middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(/*...*/)
  await supabase.auth.getSession()
  return response
}
```

## Rollback Plan
1. Keep old implementation during migration
2. Test thoroughly in staging
3. Monitor production deployment
4. Quick revert process if needed

## Notes
- Steps must be completed sequentially as each step depends on the previous steps
- The app may have temporary breakage between steps
- Each step should be committed separately for easy rollback if needed
- Performance impact should be monitored during migration
- All new auth utilities will follow the Supabase directory structure
- Auth state flows from the unified protected layout down through providers
- UI shell (header, navigation, content) managed in a unified dashboard layout
