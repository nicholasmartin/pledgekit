# Supabase SSR Refactoring Guide

## Overview
This document outlines the plan to refactor the PledgeKit frontend to fully utilize Supabase's Server-Side Rendering (SSR) capabilities using `@supabase/ssr`. This refactoring will improve code maintainability, reduce duplication, and provide a more consistent authentication pattern across the application.

## Current Issues
1. Multiple instances of `createServerComponentClient` across server components
2. Inconsistent usage of Supabase client initialization
3. Duplicate authentication logic across components
4. Mixed usage of old and new Supabase SSR approaches

## Refactoring Plan

### 1. Core Infrastructure Updates

#### Create New Utility Files
```typescript
// src/lib/supabase-server.ts
- Create centralized server-side Supabase client creation
- Implement caching mechanisms for performance
- Add type safety for database operations

// src/lib/supabase-client.ts
- Create centralized browser-side Supabase client creation
- Handle client-side authentication flows
```

#### Update Existing Files
- `src/lib/server-auth.ts`: Enhance to be single source of truth for server-side auth
- `src/lib/auth-context.tsx`: Update to use new SSR approach
- `src/middleware.ts`: Review and update authentication middleware

### 2. Component Updates

#### Server Components to Update
1. Dashboard Pages:
   - `/dashboard/company/projects/page.tsx`
   - `/dashboard/company/projects/[id]/edit/page.tsx`
   - `/dashboard/company/projects/new/page.tsx`
   - `/dashboard/company/page.tsx`
   - `/dashboard/company/settings/page.tsx`
   - `/dashboard/page.tsx`
   - `/dashboard/user/page.tsx`

2. Company/Project Pages:
   - `/companies/[slug]/[company]/projects/[id]/page.tsx`
   - `/companies/[slug]/projects/[id]/page.tsx`
   - `/companies/[slug]/page.tsx`

3. Other Pages:
   - `/settings/page.tsx`
   - `/profile/page.tsx`

### 3. Authentication Flow Updates

#### Client-Side Changes
1. Update `AuthProvider` component:
   - Remove direct Supabase client creation
   - Use new centralized utilities
   - Implement proper error handling

2. Update `AuthListener` component:
   - Migrate to new SSR authentication pattern
   - Ensure proper session management

### 4. Database Operations

#### Create Typed Database Utilities
```typescript
// src/lib/db-types.ts
- Define proper TypeScript types for all database operations
- Create typed helper functions for common queries
```

### 5. Testing Requirements

1. Authentication Flows:
   - Test sign in/sign out flows
   - Verify session persistence
   - Check protected route access

2. Data Operations:
   - Verify all CRUD operations work with new utilities
   - Test error handling
   - Validate type safety

### 6. Implementation Steps

1. **Phase 1: Infrastructure**
   - Create new utility files
   - Update core authentication files
   - Set up type system

2. **Phase 2: Server Components**
   - Update dashboard pages
   - Update company/project pages
   - Update other server components

3. **Phase 3: Client Components**
   - Update authentication components
   - Migrate client-side data fetching

4. **Phase 4: Testing & Validation**
   - Run comprehensive tests
   - Verify all flows work as expected
   - Performance testing

### 7. Migration Considerations

- Maintain backward compatibility during migration
- Consider implementing feature flags
- Plan for rollback scenarios
- Document all changes thoroughly

## Centralized Supabase Client Creation

### Current Issues with Direct Client Creation
Currently, we're initializing Supabase clients in individual components like this:

```typescript
// Client-side
const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// Server-side
const supabase = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  }
)
```

This approach has several problems:
1. Code duplication across components
2. Inconsistent configuration
3. Harder to maintain and update
4. No type safety guarantees across the application

### Recommended Solution

#### 1. Create Centralized Client Utilities

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './database.types'

export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from './database.types'

export function createServer() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

#### 2. Create Custom Hooks for Client Components

```typescript
// src/lib/supabase/hooks.ts
import { useEffect, useState } from 'react'
import { createClient } from './client'
import type { User } from '@supabase/supabase-js'

export function useSupabase() {
  const [client] = useState(() => createClient())
  return client
}

export function useUser() {
  const client = useSupabase()
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    const { data: { subscription } } = client.auth.onAuthStateChange(
      (_, session) => {
        setUser(session?.user ?? null)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [client])

  return user
}
```

#### 3. Usage in Components

```typescript
// Client Components
import { useSupabase } from '@/lib/supabase/hooks'

export function ClientComponent() {
  const supabase = useSupabase()
  // Use supabase client...
}

// Server Components
import { createServer } from '@/lib/supabase/server'

export async function ServerComponent() {
  const supabase = createServer()
  // Use supabase client...
}
```

### Migration Steps

1. Create the centralized utilities:
   - Create `src/lib/supabase/` directory
   - Add `client.ts`, `server.ts`, and `hooks.ts`
   - Ensure proper type definitions are in place

2. Update existing components:
   - Replace direct client creation with centralized utilities
   - Use custom hooks in client components
   - Use server utility in server components

3. Benefits of this approach:
   - Single source of truth for client configuration
   - Type safety across the application
   - Easier to maintain and update
   - Consistent error handling
   - Better testing capabilities
   - Simplified usage in components

4. Additional Considerations:
   - Add error boundaries for Supabase operations
   - Implement proper loading states
   - Add retry mechanisms for failed operations
   - Consider implementing caching strategies

### Example Error Handling

```typescript
// src/lib/supabase/error.ts
export class SupabaseError extends Error {
  constructor(
    message: string,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message)
    this.name = 'SupabaseError'
  }
}

// In the client utility
export function createClient() {
  try {
    return createBrowserClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
  } catch (error) {
    throw new SupabaseError(
      'Failed to initialize Supabase client',
      'INIT_ERROR',
      error
    )
  }
}
```

This centralized approach will make the SSR migration more manageable and provide a better foundation for future updates.

## Best Practices

1. **Server Components**
```typescript
// Use centralized utilities
import { getServerSupabase } from '@/lib/supabase-server'

export default async function ServerComponent() {
  const supabase = getServerSupabase()
  // Use typed queries
  const { data, error } = await supabase.from('table').select('*')
}
```

2. **Client Components**
```typescript
// Use auth context
import { useAuth } from '@/lib/auth-context'

export function ClientComponent() {
  const { user, signOut } = useAuth()
  // Handle client-side operations
}
```

## Future Considerations

1. Performance Optimization:
   - Implement proper caching strategies
   - Consider implementing React Suspense
   - Optimize data fetching patterns

2. Security:
   - Review and update security middleware
   - Implement proper CORS policies
   - Add rate limiting where necessary

3. Monitoring:
   - Add proper error tracking
   - Implement performance monitoring
   - Set up logging for authentication events

## Resources

- [Supabase SSR Documentation](https://supabase.com/docs/guides/auth/server-side/creating-a-client)
- [Next.js Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [TypeScript Best Practices](https://www.typescriptlang.org/docs/handbook/declaration-files/do-s-and-don-ts.html)
