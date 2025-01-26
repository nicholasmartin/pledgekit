# Supabase Server/Client Refactor

## Overview
We currently have two implementations of the Supabase server client:
1. `frontend/src/lib/supabase/server.ts` (newer)
2. `frontend/src/lib/server-supabase.ts` (older)

This document outlines the plan to consolidate these implementations into a single, more robust solution.

## Current Issues
1. Duplicate server client implementations
2. Inconsistent client usage across codebase
3. Mixed concerns in utility files

## Current Usage
The older `server-supabase.ts` is currently used in:
- Server-side authentication (`server-auth.ts`)
- Multiple dashboard pages:
  - `/dashboard/user/page.tsx`
  - `/dashboard/company/page.tsx`
  - `/dashboard/company/settings/page.tsx`
  - `/dashboard/company/projects/page.tsx`
  - `/dashboard/company/projects/new/page.tsx`
  - `/dashboard/company/projects/[id]/edit/page.tsx`
- Company project pages:
  - `/companies/[slug]/projects/[id]/page.tsx`

## New Structure
```
frontend/src/lib/supabase/
├── client/
│   ├── auth.ts       # Client-side auth functions
│   └── client.ts     # Client initialization
├── server/
│   ├── auth.ts       # Server-side auth functions
│   └── server.ts     # Server initialization
└── utils/           # Shared utilities
    └── errors.ts    # Error handling
```

## Implementation Details

### 1. Enhanced Server Client
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { cache } from 'react'
import type { Database } from '../database.types'
import { SupabaseError } from './client'

/**
 * Create a cached version of the Supabase server client.
 * IMPORTANT: This should only be used in Server Components.
 * Always call cookies() before any Supabase calls.
 */
export const createServer = cache(() => {
  try {
    const cookieStore = cookies()
    
    return createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => cookieStore.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            cookieStore.set({ name, value, ...options })
          },
          remove: (name: string, options: any) => {
            cookieStore.delete({ name, ...options })
          }
        },
      }
    )
  } catch (error) {
    throw new SupabaseError(
      'Failed to initialize Supabase server client',
      'SERVER_INIT_ERROR',
      error
    )
  }
})
```

### 2. Helper Functions
```typescript
// Re-implement helper functions from server-supabase.ts
export async function getUserByEmail(email: string) {
  const supabase = createServer()
  // Implementation
}

// Additional helper functions will be migrated as needed
```

## Migration Steps

### 1. Consolidate Server Implementation
- Combine `server.ts` and `server-supabase.ts`
- Keep best features from both:
  - Caching from `server-supabase.ts`
  - Error handling from `supabase/server.ts`
  - Complete cookie implementation
  - Helper functions

### 2. Update File References
Files to update:
- [ ] `frontend/src/lib/server-auth.ts`
- [ ] `frontend/src/app/dashboard/user/page.tsx`
- [ ] `frontend/src/app/dashboard/company/page.tsx`
- [ ] `frontend/src/app/dashboard/company/settings/page.tsx`
- [ ] `frontend/src/app/dashboard/company/projects/page.tsx`
- [ ] `frontend/src/app/dashboard/company/projects/new/page.tsx`
- [ ] `frontend/src/app/dashboard/company/projects/[id]/edit/page.tsx`
- [ ] `frontend/src/app/companies/[slug]/projects/[id]/page.tsx`

### 3. Testing Plan
1. Server Client Tests
   - Authentication flows
   - Cookie management
   - Error handling
   - Helper functions

2. Integration Tests
   - Dashboard functionality
   - Project management
   - Settings pages

### 4. Rollback Plan
- Keep old implementations temporarily
- Test thoroughly in staging
- Quick revert process if issues arise

## Benefits
1. **Reduced Boilerplate**
   - Single source of truth for server client
   - Consistent error handling
   - Reusable helper functions

2. **Better Performance**
   - Proper caching implementation
   - Optimized cookie management
   - Reduced duplicate code

3. **Enhanced Security**
   - Consistent error handling
   - Proper type safety
   - Better cookie management

4. **Improved Maintainability**
   - Clear file structure
   - Better code organization
   - Easier to update and extend
