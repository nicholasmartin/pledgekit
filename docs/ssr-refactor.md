# Supabase SSR Refactoring Guide

## Overview
This document outlines the plan to refactor the PledgeKit frontend to fully utilize Supabase's Server-Side Rendering (SSR) capabilities using `@supabase/ssr`. This refactoring will improve code maintainability, reduce duplication, and provide a more consistent authentication pattern across the application.

## Current Issues
1. Multiple instances of `createServerComponentClient` across server components
2. Inconsistent usage of Supabase client initialization
3. Duplicate authentication logic across components
4. Mixed usage of old and new Supabase SSR approaches
5. Using deprecated `@supabase/auth-helpers-nextjs` package

## Supabase SSR Requirements & Best Practices

### Authentication Flow
1. Server Components can't write cookies directly
2. Middleware is responsible for:
   - Refreshing Auth tokens (via `supabase.auth.getUser()`)
   - Passing refreshed tokens to Server Components via `request.cookies.set`
   - Passing refreshed tokens to browser via `response.cookies.set`

### Security Requirements
1. Server gets user session from cookies, which can be spoofed
2. ALWAYS use `supabase.auth.getUser()` to protect pages and user data
3. NEVER trust `supabase.auth.getSession()` inside server code - it isn't guaranteed to revalidate
4. `getUser()` is safe because it revalidates with Supabase Auth server every time

### Next.js Data Fetching
1. Call `cookies()` before any Supabase calls in Server Components
2. This opts fetch calls out of Next.js's caching
3. Critical for authenticated data fetches to ensure users only access their data

### Email Templates
1. Update Confirm signup template in Supabase dashboard
2. Change `{{ .ConfirmationURL }}` to:
   ```
   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=signup
   ```

### Route Handler Requirements
1. Auth confirmation route must exchange secure code for Auth token
2. Use Server Component client for route handlers
3. Proper error handling and redirection for auth flows

### Component Types
1. Client Components:
   - Run in browser
   - Use Browser Client from centralized utility
   - Handle real-time subscriptions and client-side auth state

2. Server Components:
   - Run only on server
   - Use Server Client from centralized utility
   - Must call `cookies()` before Supabase calls
   - Use `getUser()` for auth checks

3. Route Handlers:
   - Use Server Client
   - Handle proper cookie management
   - Implement proper error handling

### Middleware Configuration
1. Add proper matcher to exclude static files:
   ```typescript
   export const config = {
     matcher: [
       '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
     ],
   }
   ```

## Critical Rules and Best Practices
1. ALWAYS use `supabase.auth.getUser()` to protect pages and user data
2. NEVER trust `supabase.auth.getSession()` in server code
3. ALWAYS call `cookies()` before any Supabase calls in Server Components
4. Use centralized client creation from our utility files
5. Ensure proper type safety with Database types throughout
6. Proper error handling in all Supabase operations

## Phase 1: Foundation Setup [Status: Almost Complete]
- [x] 1.1 Package Updates
  ```bash
  npm uninstall @supabase/auth-helpers-nextjs
  npm install @supabase/ssr @supabase/supabase-js
  ```
- [x] 1.2 Create Client Utility (`src/lib/supabase/client.ts`)
- [x] 1.3 Create Server Utility (`src/lib/supabase/server.ts`)
- [x] 1.4 Update Middleware
- [x] 1.5 Update Email Templates in Supabase Dashboard

## Phase 2: Core Authentication [Status: Complete]
- [x] 2.1 Implement Auth Confirmation Route Handler
- [x] 2.2 Update Auth Context Provider
- [x] 2.3 Update Protected Route Handling
- [x] 2.4 Implement Proper Error Handling

## Phase 3: Client Components Migration [Status: In Progress]
### High-Priority Components
- [x] 3.1 `src/lib/auth-context.tsx` (Critical for auth flow)
- [x] 3.2 `src/components/navigation/main-nav-client.tsx` (Core navigation)
- [x] 3.3 `src/components/dashboard/projects/project-form-tabs.tsx`

### Standard Priority Components
- [x] 3.4 `src/app/settings/page.tsx`
- [x] 3.5 `src/app/profile/page.tsx`
- [x] 3.6 `src/app/companies/[slug]/page.tsx`
- [x] 3.7 `src/components/dashboard/projects/projects-client.tsx`

## Phase 4: Server Components Migration [Status: Not Started]
### Core Server Utilities
- [x] 4.1 `src/lib/server-supabase.ts`
- [x] 4.2 `src/lib/server-auth.ts`

### Dashboard Pages
- [x] 4.3 `src/app/dashboard/page.tsx`
- [x] 4.4 `src/app/dashboard/user/page.tsx`
- [x] 4.5 `src/app/dashboard/company/settings/page.tsx`
- [x] 4.6 `src/app/dashboard/company/page.tsx`

### Project Pages
- [x] 4.7 `src/app/dashboard/company/projects/page.tsx`
- [x] 4.8 `src/app/dashboard/company/projects/new/page.tsx`
- [x] 4.9 `src/app/dashboard/company/projects/[id]/edit/page.tsx`
- [x] 4.10 `src/app/companies/[slug]/projects/[id]/page.tsx`

## Phase 5: API Routes Migration [Status: Not Started]
### Authentication Routes
- [x] 5.1 `src/app/auth/callback/route.ts`
- [x] 5.2 `src/app/api/user/route.ts`

### Feature Routes
- [x] 5.3 `src/app/api/checkout/route.ts`
- [x] 5.4 `src/app/api/canny/posts/route.ts`
- [x] 5.5 `src/app/api/canny/posts/[id]/route.ts`
- [ ] 5.6 `src/app/api/canny/utils.ts`

## Phase 6: Testing & Cleanup [Status: Not Started]
- [ ] 6.1 Verify all auth flows
- [ ] 6.2 Test protected routes
- [ ] 6.3 Verify session handling
- [ ] 6.4 Remove deprecated imports
- [ ] 6.5 Remove custom implementations
- [ ] 6.6 Add comprehensive logging
- [ ] 6.7 Update documentation

## Migration Checklist Template
When migrating each component, follow this checklist:

### For Client Components:
1. [ ] Replace deprecated imports
2. [ ] Update to centralized client
3. [ ] Add proper type safety
4. [ ] Test component functionality
5. [ ] Verify error handling

### For Server Components:
1. [ ] Replace deprecated imports
2. [ ] Update to centralized server client
3. [ ] Add `cookies()` call before Supabase
4. [ ] Replace `getSession` with `getUser`
5. [ ] Add proper type safety
6. [ ] Test component functionality
7. [ ] Verify error handling

### For API Routes:
1. [ ] Replace deprecated imports
2. [ ] Update to centralized server client
3. [ ] Ensure proper cookie handling
4. [ ] Add proper type safety
5. [ ] Test route functionality
6. [ ] Verify error handling

## Progress Tracking
Each phase above has a [Status] indicator that should be updated as we progress:
- Not Started
- In Progress
- Completed
- Blocked

## Future Improvements: Enhanced Auth Pattern

After completing the current SSR refactor, we should consider implementing a more efficient auth pattern that would:
1. Reduce code duplication
2. Improve security
3. Enhance performance
4. Simplify maintenance

### Proposed Changes

#### 1. Protected Layout Pattern
Instead of checking auth in every component:
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

#### 2. Enhanced Middleware
Implement a more robust middleware that handles:
- Automatic token refresh
- Cookie management
- Session validation
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  await supabase.auth.getSession()
  return response
}
```

### Benefits
1. **Reduced Boilerplate**
   - No need to check auth in every component
   - Centralized auth logic
   - Fewer imports across components

2. **Better Security**
   - Consistent auth checks
   - Server-side validation
   - Proper token refresh handling

3. **Improved Performance**
   - Fewer client-side requests
   - Better caching
   - Reduced bundle size

4. **Easier Maintenance**
   - Single source of truth for auth
   - Simplified component logic
   - Clearer separation of concerns

### Implementation Steps
1. Create protected layout components
2. Implement enhanced middleware
3. Convert applicable Client Components to Server Components
4. Update auth context provider
5. Add proper error boundaries
6. Update documentation

This improvement should be considered after the current refactor is complete, as it builds upon the foundations we're currently establishing.

## Notes
- Add any important notes or discoveries during the refactor here
- Document any patterns or issues that emerge
- Track any dependencies between components
