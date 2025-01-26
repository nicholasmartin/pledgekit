# Type Safety Implementation Plan

## Current Challenge

We're experiencing type mismatches between our database schema and frontend TypeScript types. This leads to:
- Manual type assertions and transformations in components
- Potential runtime errors when database schema changes
- Inconsistent type definitions across the application
- Technical debt as manual types drift from actual database schema

### Concrete Example: Project Status Type Mismatch

A clear example of this issue exists in our project status handling:

```typescript
// Database type (generated)
type ProjectRow = {
  status: string | null;  // Too permissive
  // ... other fields
}

// Component type (manual)
type Project = {
  status: "draft" | "published" | "completed" | "cancelled";  // Strictly typed
  // ... other fields
}
```

This mismatch causes several issues:
1. TypeScript errors when passing database results to components
2. No runtime validation of status values
3. Potential for invalid status values in the database
4. Inconsistent type enforcement across the application

The solution will involve:
1. Using enums in the database schema
2. Generating proper TypeScript types
3. Implementing runtime validation with Zod
4. Creating proper type transformers between database and domain types

### Concrete Example: Canny API Type Safety

Another critical example exists in our Canny API integration:

```typescript
// Database types (generated)
type CannyPost = {
  company_id: string;  // Direct database column
  // ... other fields
}

// API Context type (manual)
type CompanyContext = {
  companyId: CompanyMember['company_id'];  // Reference to another type
  // ... other fields
}

// Component type (manual)
type CannyPostView = {
  companyId: string;  // Normalized name
  // ... other fields
}
```

This mismatch creates several issues:
1. Type errors when passing `companyId` between layers
2. Inconsistent field naming (`company_id` vs `companyId`)
3. No validation of relationships between companies, members, and posts
4. Scattered type definitions across multiple files
5. Direct usage of database types in API routes

The solution will involve:

1. Centralize Canny-related types:
```typescript
// types/domain/canny.ts
interface CannyPost {
  id: string;
  companyId: string;  // Normalized naming
  boardId: string;
  title: string;
  status: CannyPostStatus;
  // ... other fields
}

// types/api/canny.ts
interface CannyApiContext {
  companyId: string;
  apiKey: string;
}

// types/transformers/canny.ts
function transformCannyPost(dbPost: DbCannyPost): CannyPost {
  // Type-safe transformation
}
```

2. Add proper validation:
```typescript
const cannyPostSchema = z.object({
  companyId: z.string().uuid(),
  boardId: z.string(),
  // ... other validations
});
```

3. Create type-safe utility functions:
```typescript
async function getCannyContext(): Promise<CannyApiContext> {
  // Validated context retrieval
}

async function validateCannyAccess(companyId: string): Promise<void> {
  // Access validation
}
```

4. Update API routes to use domain types:
```typescript
export async function handler() {
  const context = await getCannyContext();
  const posts = await getCannyPosts(context.companyId);
  return transformCannyPosts(posts);
}
```

This refactor will:
- Ensure consistent type usage across the Canny integration
- Properly validate relationships and access
- Centralize type definitions
- Make the codebase more maintainable

### Quick Fix Examples

#### Benefits Array Type Mismatch

Current implementation has type safety issues with pledge options' benefits:

```typescript
// Database type (generated)
type DbPledgeOption = {
  benefits: string | number | true | { [key: string]: Json | undefined } | Json[] | null;  // Too permissive JSON type
  // ... other fields
}

// Domain type (manual)
interface PledgeOption {
  benefits: string[];  // Strictly typed as string array
  // ... other fields
}
```

Quick fix implemented:
```typescript
export function transformPledgeOption(dbOption: DbPledgeOption): PledgeOption {
  return {
    // ... other fields
    benefits: Array.isArray(dbOption.benefits) 
      ? dbOption.benefits.filter((b): b is string => typeof b === 'string') 
      : []
  }
}
```

While this solution works as a temporary fix by:
1. Handling type conversion safely
2. Providing fallback values
3. Preventing runtime errors

**Proper Fix Needed**: 
- Update database schema to use a proper array type with string constraints
- Add database-level validation for benefits content
- Use proper JSON schema validation in the API layer
- Generate strict TypeScript types from the schema
- Implement Zod validation for runtime type safety:
```typescript
// Future implementation with Zod
const pledgeOptionSchema = z.object({
  benefits: z.array(z.string()).min(1),
  // ... other fields
});
```

This will ensure type safety at all levels:
1. Database constraints
2. API validation
3. Generated TypeScript types
4. Runtime validation

## Current Type Organization Issues

We currently have types scattered across multiple locations:
- `/frontend/src/lib/database.types.ts`
- `/frontend/src/lib/types/user.ts`
- `/frontend/src/types/auth.ts`
- `/frontend/src/types/stripe.ts`

Issues identified:
1. Duplicate type definitions
2. Inconsistent directory structure
3. Mixed concerns between database and domain types
4. No clear separation between generated and manual types

## Type Organization Cleanup

### 1. Directory Structure

Reorganize types into a clear hierarchy:
```
frontend/src/
├── types/
│   ├── generated/           # Auto-generated types
│   │   ├── database.ts     # Supabase generated types
│   │   └── schema.ts       # API schema types
│   ├── domain/             # Business domain types
│   │   ├── user.ts
│   │   ├── project.ts
│   │   └── company.ts
│   ├── api/                # API-specific types
│   │   ├── requests.ts
│   │   └── responses.ts
│   └── external/           # Third-party integration types
│       └── stripe.ts
```

### 2. Type Migration Steps

1. Create the new directory structure:
   ```bash
   mkdir -p src/types/{generated,domain,api,external}
   ```

2. Move and consolidate existing types:
   - Move `database.types.ts` → `types/generated/database.ts`
   - Merge `lib/types/user.ts` and `types/auth.ts` → `types/domain/user.ts`
   - Move `types/stripe.ts` → `types/external/stripe.ts`

3. Update imports across the codebase

### 3. Type Definition Guidelines

1. Generated Types:
   - Never modify directly
   - Use type transformers to convert to domain types
   - Keep in `generated/` directory

2. Domain Types:
   - Represent core business entities
   - Use strict typing (no `any`)
   - Include JSDoc documentation

3. API Types:
   - Define request/response shapes
   - Use Zod schemas for validation
   - Keep aligned with API endpoints

4. External Types:
   - Isolate third-party type dependencies
   - Use adapters to convert to domain types

### 4. Implementation Steps

1. Audit Current Types:
   ```bash
   # Find all type definitions
   find src -type f -name "*.ts" -exec grep -l "type\|interface" {} \;
   ```

2. Create Migration Script:
   ```typescript
   // scripts/migrate-types.ts
   // Script to help automate type migration
   ```

3. Update Build Process:
   - Add type generation to build pipeline
   - Add type check step before commits

4. Documentation Updates:
   - Add type organization guidelines to README
   - Document type generation process
   - Add comments for complex type transformations

### 5. Maintenance Rules

1. No duplicate type definitions
2. Generated types stay in `generated/`
3. Domain types are the source of truth
4. Use type transformers for conversion
5. Document complex type relationships

## Type Migration Checklist

- [ ] Create new directory structure
- [ ] Move database types to `generated/`
- [ ] Consolidate user types
- [ ] Move Stripe types to `external/`
- [ ] Update all import paths
- [ ] Add type generation to CI/CD
- [ ] Document new type organization
- [ ] Remove old type files

## Quick Fixes to Revisit

During the SSR migration, we implemented several temporary type fixes that need to be properly addressed:

### 1. Project Status Type Assertions

**Location**: `src/components/dashboard/projects/project-form-tabs.tsx`
**Issue**: Database type `status: string | null` doesn't match component type `status: "draft" | "published" | "completed" | "cancelled"`
**Quick Fix**: Type assertion to force database type into component type
**Proper Fix Needed**: 
- Add enum in database for project status
- Generate proper TypeScript types
- Implement runtime validation
- Create type transformers

### 2. Company Settings/Branding Type Mismatch

A type mismatch exists in our company branding handling:

```typescript
// Database type (generated)
type CompanyRow = {
  settings: Json | null;  // Contains branding info
}

// Component type (manual)
interface CompanyHeaderProps {
  company: {
    branding: any;  // Expects branding directly
  }
}
```

Location: `src/app/companies/[slug]/page.tsx` and `src/components/companies/company-header.tsx`

Current quick fix:
```typescript
// Using type assertion and nullish coalescing for safety
branding: (company.settings as { branding?: any } | null)?.branding ?? {}
```

This is a temporary solution that:
1. Uses type assertion to tell TypeScript that settings might have a branding property
2. Handles null/undefined cases with the nullish coalescing operator
3. Still uses `any` type which isn't ideal for type safety

Proper fix needed:
1. Define proper interfaces for company settings and branding:
```typescript
interface CompanyBranding {
  primary_color?: string;
  text_color?: string;
  // Add other branding properties
}

interface CompanySettings {
  branding?: CompanyBranding;
  // Add other settings properties
}
```
2. Update database schema to match these types
3. Generate proper TypeScript types from the schema
4. Implement runtime validation

### 3. Project with Company Slug Type

A type extension is needed for projects when displaying them with company information:

```typescript
// Database type (generated)
type ProjectRow = Database["public"]["Tables"]["projects"]["Row"]

// Component type (manual)
type ProjectWithCompany = ProjectRow & {
  company_slug: string;  // Added field from join
}
```

Location: `src/app/companies/[slug]/page.tsx` and `src/components/dashboard/projects/projects-client.tsx`

Current quick fix:
- Manually extending the Project type with company_slug
- Type assertion after database join query

**Proper Fix Needed**:
1. Define proper join types in database schema
2. Generate TypeScript types for common joins
3. Create type utilities for handling joined data
4. Consider using Prisma or similar ORM for better type safety with joins

### Similar Patterns to Look For:
1. Type assertions using `as const` or specific type assertions
2. Manual type definitions that should come from database
3. Nullable fields in database being treated as non-null in components
4. String fields in database being treated as enums in components

## Quick Fixes Reference

### Handling Nullable Date Fields

**Problem**: Type error when passing potentially null values to Date constructor:
```typescript
// Error: Argument of type 'string | null' is not assignable to parameter of type 'string | number | Date'
{new Date(pledge.created_at).toLocaleDateString()}
```

**Quick Fix**: Add null check with ternary operator:
```typescript
{pledge.created_at ? new Date(pledge.created_at).toLocaleDateString() : 'Date not available'}
```

**Why it works**: 
- Ensures Date constructor only receives string when value exists
- Provides fallback for null case
- Satisfies TypeScript's type checking

**Long-term consideration**: Consider making created_at non-nullable in database schema if dates should always be present

## Solution Implementation

### 1. Supabase Type Generation

Set up automatic type generation from Supabase:
```bash
# Install Supabase CLI if not already installed
npm install supabase --save-dev

# Generate types
supabase gen types typescript --project-id <your-project-id> > types/supabase.ts
```

### 2. Type Safety Infrastructure

1. Create a dedicated `types` directory:
   ```
   types/
   ├── supabase.ts      # Auto-generated database types
   ├── models.ts        # Frontend model types
   └── transformers.ts  # Type transformation functions
   ```

2. Implement a type-safe API layer:
   ```
   services/
   ├── api.ts           # Base API configuration
   └── endpoints/       # Type-safe endpoint implementations
   ```

### 3. Automation

Add these steps to ensure types stay updated:

1. Add npm script to `package.json`:
   ```json
   {
     "scripts": {
       "update-types": "supabase gen types typescript --project-id <your-project-id> > types/supabase.ts"
     }
   }
   ```

2. Set up Git hooks using Husky:
   - Run type generation before commits
   - Prevent commits if type generation produces changes

3. Add CI/CD checks:
   - Verify types are up-to-date in CI pipeline
   - Block merges if types are outdated

### 4. Runtime Validation

1. Implement Zod schemas for runtime type validation:
   ```
   schemas/
   ├── project.schema.ts
   ├── company.schema.ts
   └── index.ts
   ```

2. Use these schemas in API responses and form submissions

## Best Practices

1. Never manually update types - always generate from database
2. Use Zod for runtime validation where needed
3. Create transformers for any necessary type conversions
4. Keep frontend models separate from database types
5. Document any manual type overrides with clear explanations

## Implementation Checklist

- [ ] Set up Supabase CLI
- [ ] Create initial type generation script
- [ ] Set up Husky git hooks
- [ ] Implement CI/CD checks
- [ ] Create Zod schemas
- [ ] Refactor existing components to use generated types
- [ ] Add documentation for type management

## Maintenance

Run type updates:
```bash
npm run update-types
```

Check for type drift:
```bash
git diff types/supabase.ts
```
