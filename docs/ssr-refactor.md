# Supabase SSR Refactoring Guide

## Overview
This document outlines the plan to refactor the PledgeKit frontend to fully utilize Supabase's Server-Side Rendering (SSR) capabilities using `@supabase/ssr`. This refactoring will improve code maintainability, reduce duplication, and provide a more consistent authentication pattern across the application.

## Current Issues
1. Multiple instances of `createServerComponentClient` across server components
2. Inconsistent usage of Supabase client initialization
3. Duplicate authentication logic across components
4. Mixed usage of old and new Supabase SSR approaches
5. Using deprecated `@supabase/auth-helpers-nextjs` package

## Migration Steps

### 1. Package Updates
```bash
npm uninstall @supabase/auth-helpers-nextjs
npm install @supabase/ssr
```

### 2. Core Infrastructure Updates

#### Create New Utility Files
```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// src/lib/supabase/server.ts
import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  const cookieStore = cookies()
  
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

#### Update Middleware
Update `src/middleware.ts` to handle auth token refresh and cookie management:
```typescript
import { type NextRequest } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

### 3. Files to Update

#### Client Components (using createBrowserClient)
1. `src/components/dashboard/projects/project-form-tabs.tsx`
2. `src/app/settings/page.tsx`
3. `src/app/profile/page.tsx`
4. `src/app/companies/[slug]/page.tsx`

#### API Routes (using createServerClient)
1. `src/app/api/checkout/route.ts`
2. `src/app/api/canny/posts/route.ts`
3. `src/app/api/canny/posts/[id]/route.ts`

### 4. Important Security Notes
1. Always use `supabase.auth.getUser()` to protect pages and user data - never trust `supabase.auth.getSession()`
2. Call `cookies()` before any Supabase calls in Server Components to opt out of Next.js caching
3. Update email templates in Supabase dashboard to use the new confirmation URL format:
   - Change `{{ .ConfirmationURL }}` to `{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup`

## Progress Tracking

### Completed
- [ ] Package updates
- [ ] Core infrastructure setup
- [ ] Middleware updates
- [ ] Email template updates

### Components to Migrate
- [ ] `src/components/dashboard/projects/project-form-tabs.tsx`
- [ ] `src/app/settings/page.tsx`
- [ ] `src/app/profile/page.tsx`
- [ ] `src/app/companies/[slug]/page.tsx`

### API Routes to Migrate
- [ ] `src/app/api/checkout/route.ts`
- [ ] `src/app/api/canny/posts/route.ts`
- [ ] `src/app/api/canny/posts/[id]/route.ts`

## Post-Migration Cleanup
1. Verify all auth flows (signup, login, password reset)
2. Test protected routes and API endpoints
3. Verify session handling and token refresh
4. Remove any remaining references to `@supabase/auth-helpers-nextjs`
5. Update types and interfaces to match new SSR patterns

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

export async function createServer() {
  const cookieStore = cookies()
  
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: any) {
          cookieStore.set({ name, value: '', ...options })
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
