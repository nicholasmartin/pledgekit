# Database Types Migration Plan

## Overview
We need to update all imports of the Database type to use our new types structure. The Database type should now be imported from `@/types/generated/database` instead of `@/lib/database.types`.

## Files Requiring Updates

### Hooks
- `src/hooks/use-access-control.ts`
  - Current: `import type { Database } from "@/lib/database.types"`
  - New: `import type { Database } from "@/types/generated/database"`

### Library Files
- `src/lib/server-auth.ts`
- `src/lib/server-supabase.ts`
- `src/lib/supabase.ts`
- `src/lib/rbac.ts`

### Supabase Related
- `src/lib/supabase/hooks.ts`
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`

### Components
- `src/components/dashboard/projects/project-form-tabs.tsx`
- `src/components/dashboard/projects/projects-client.tsx`

### App Routes
- `src/app/companies/[slug]/page.tsx`
- `src/app/dashboard/company/projects/[id]/edit/page.tsx`

### API Routes
- `src/app/api/canny/utils.ts`
- `src/app/api/canny/posts/route.ts`
- `src/app/api/canny/posts/[id]/route.ts`
- `src/app/api/checkout/route.ts`

## Migration Steps

1. First, ensure the new Database type in `@/types/generated/database` is complete and correct
2. For each file:
   - Update the import path
   - Test any type usage to ensure compatibility
   - Pay special attention to any type extensions or interfaces that might depend on the Database type

## Additional Considerations

1. Check for any indirect usage of Database types through other type imports
2. Verify that the new Database type includes all necessary table and enum definitions
3. Update any related documentation or type definitions that might reference the old location

## Post-Migration

1. After all files are migrated and tested:
   - Remove the old `database.types.ts` file
   - Update any related documentation
   - Run a full TypeScript check to ensure no type errors remain
