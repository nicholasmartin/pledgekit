# PledgeKit Type Safety Refactor

## Introduction

This document serves two critical purposes:
1. Provide clear instructions for AI models to understand and execute the type refactoring
2. Serve as an implementation plan with trackable progress for human operators

## Type Safety Best Practices (Next.js + Supabase)

### Core Principles
1. **Single Source of Truth**: Database schema drives type definitions
2. **Type Generation**: Never manually update database types
3. **Runtime Validation**: Use Zod for API boundaries and form submissions
4. **Type Transformation**: Clear separation between database and domain types
5. **No Type Assertions**: Avoid `as` and type casting

### Architecture Guidelines
1. **Generated Types**: 
   - Use Supabase CLI for database type generation
   - Keep generated types isolated in dedicated directory
   - Never modify generated types directly

2. **Domain Types**:
   - Define business logic types separately from database types
   - Use strict typing (no `any`)
   - Document complex type relationships

3. **API Layer**:
   - Type-safe endpoint implementations
   - Validate requests and responses with Zod
   - Transform between database and domain types

4. **Component Types**:
   - Use domain types, not database types
   - Validate props with proper TypeScript types
   - Handle nullable fields explicitly

## Current Type Safety Issues (By Risk Level)

### High Risk (Runtime Errors)

1. **Canny API Integration**
   - Location: `frontend/src/app/api/canny/`
   - Issue: Type mismatch between database and API types
   - Impact: Potential runtime errors in API calls
   - Current State: Using unsafe type assertions

2. **Project Status Handling**
   - Location: `src/components/dashboard/projects/project-form-tabs.tsx`
   - Issue: Database `string | null` vs component enum type
   - Impact: Invalid status values at runtime
   - Current State: Using type assertions

3. **Nullable Date Fields**
   - Location: Multiple components
   - Issue: Passing null dates to Date constructor
   - Impact: Runtime crashes
   - Current State: Quick fixes with ternary operators

### Medium Risk (Type Inconsistencies)

1. **Company Settings/Branding**
   - Location: `src/app/companies/[slug]/page.tsx`
   - Issue: JSON type vs specific branding interface
   - Impact: Type safety gaps in settings handling
   - Current State: Using `any` type

2. **Benefits Array Type**
   - Location: Pledge options handling
   - Issue: JSON type vs string array
   - Impact: Inconsistent benefit formats
   - Current State: Runtime type checking

### Low Risk (Technical Debt)

1. **Project with Company Slug**
   - Location: Project listing components
   - Issue: Manual type extension for joins
   - Impact: Maintenance overhead
   - Current State: Manual type extensions

## Type Organization Structure

### Directory Layout
```
frontend/src/
├── types/
│   ├── generated/           # Auto-generated types
│   │   ├── database.ts     # Supabase generated types
│   │   └── schema.ts       # API schema types
│   ├── domain/             # Business domain types
│   │   ├── canny/
│   │   │   ├── types.ts    # Canny domain types
│   │   │   └── schema.ts   # Canny validation schemas
│   │   ├── project/
│   │   │   ├── types.ts    # Project domain types
│   │   │   └── schema.ts   # Project validation schemas
│   │   └── pledge/
│   │       ├── types.ts    # Pledge domain types
│   │       └── schema.ts   # Pledge validation schemas
│   ├── api/                # API-specific types
│   │   ├── requests.ts     # Request type definitions
│   │   ├── responses.ts    # Response type definitions
│   │   └── handlers.ts     # Route handler types
│   ├── helpers/            # Type utility helpers
│   │   ├── database.ts     # Database type helpers
│   │   └── nullable.ts     # Nullable field utilities
│   └── external/           # Third-party integration types
│       ├── stripe.ts       # Stripe API types
│       └── canny.ts        # Canny API types
```

### Type Definition Guidelines

#### 1. Generated Types
- Never modify directly
- Use type transformers to convert to domain types
- Keep in `generated/` directory
- Example:
  ```typescript
  // ❌ Don't modify generated types
  interface DbProject extends Database['public']['Tables']['projects']['Row'] {
    additional_field: string;  // Don't add fields here
  }

  // ✅ Create transformers instead
  function transformProject(dbProject: Database['public']['Tables']['projects']['Row']): Project {
    // Transform here
  }
  ```

#### 2. Domain Types
- Represent core business entities
- Use strict typing (no `any`)
- Include JSDoc documentation
- Example:
  ```typescript
  /**
   * Represents a project in our system
   * @property status - Current state of the project
   * @property settings - Project configuration
   */
  interface Project {
    id: string;
    status: ProjectStatus;
    settings: ProjectSettings;
  }
  ```

#### 3. API Types
- Define request/response shapes
- Use Zod schemas for validation
- Keep aligned with API endpoints
- Example:
  ```typescript
  const projectCreateSchema = z.object({
    title: z.string().min(1),
    status: z.enum(['draft', 'published'])
  });

  type CreateProjectRequest = z.infer<typeof projectCreateSchema>;
  ```

#### 4. External Types
- Isolate third-party type dependencies
- Use adapters to convert to domain types
- Example:
  ```typescript
  // types/external/stripe.ts
  export interface StripeCustomer {
    // Stripe-specific types
  }

  // types/domain/customer.ts
  export interface Customer {
    // Our domain types
  }

  // types/transformers/stripe.ts
  export function transformStripeCustomer(stripeCustomer: StripeCustomer): Customer {
    // Transform external to domain type
  }
  ```

### Type Helpers and Utilities

#### Database Type Helpers
```typescript
// types/helpers/database.ts
import { Database } from '../generated/database'

export type Tables<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Row']

export type Enums<T extends keyof Database['public']['Enums']> = 
  Database['public']['Enums'][T]

// Type-safe table operations
export type InsertType<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Insert']

export type UpdateType<T extends keyof Database['public']['Tables']> = 
  Database['public']['Tables'][T]['Update']
```

#### Nullable Field Utilities
```typescript
// types/helpers/nullable.ts
export type NonNullableFields<T> = {
  [P in keyof T]: NonNullable<T[P]>
}

export type NullableToOptional<T> = {
  [P in keyof T]: T[P] extends null ? never : T[P]
}

// Utility for safely accessing nullable fields
export function assertNonNull<T>(value: T | null | undefined, message?: string): T {
  if (value == null) {
    throw new Error(message ?? 'Value must not be null')
  }
  return value
}
```

### JSON Column Handling
When working with JSON columns (like settings and branding), use these patterns:

```typescript
// Example for company settings
import { z } from 'zod'

// Define schema for JSON content
export const companySettingsSchema = z.object({
  featureFlags: z.object({
    enableBeta: z.boolean().default(false),
    customTheme: z.boolean().default(false)
  }),
  preferences: z.object({
    emailNotifications: z.boolean().default(true),
    slackIntegration: z.boolean().optional()
  })
})

// Generate type from schema
export type CompanySettings = z.infer<typeof companySettingsSchema>

// Extend generated database types
declare module '../generated/database' {
  interface Database {
    public: {
      Tables: {
        companies: {
          Row: {
            settings: CompanySettings | null
          }
          Insert: {
            settings?: CompanySettings | null
          }
          Update: {
            settings?: CompanySettings | null
          }
        }
      }
    }
  }
}
```

### Route Handler Type Safety
For Next.js App Router route handlers:

```typescript
// types/api/handlers.ts
import { z } from 'zod'

// Define request/response schemas
export const createProjectSchema = z.object({
  title: z.string().min(1),
  cannyPostId: z.string(),
  settings: projectSettingsSchema.optional()
})

export type CreateProjectRequest = z.infer<typeof createProjectSchema>
export type CreateProjectResponse = {
  project: Tables<'projects'>
  status: 'success' | 'error'
}

// Example route handler
export async function POST(request: Request) {
  try {
    const data = createProjectSchema.parse(await request.json())
    // Type-safe handler implementation
    return Response.json<CreateProjectResponse>({
      project: newProject,
      status: 'success'
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ status: 'error', errors: error.errors }, { status: 400 })
    }
    throw error
  }
}
```

### Auth Context Types
```typescript
// types/domain/auth.ts
export type AuthUser = {
  id: string
  email: string
  role: 'user' | 'admin'
  companyId: string | null
}

// RLS policy types
export type RLSPolicies = {
  companies: {
    select: {
      user_is_member: AuthUser
    }
    insert: {
      user_is_admin: AuthUser
    }
    update: {
      user_is_admin: AuthUser
    }
  }
  projects: {
    select: {
      visible_to_user: AuthUser
    }
    update: {
      user_can_edit: AuthUser
    }
  }
}

// Type-safe policy checks
export function assertPolicy<
  T extends keyof RLSPolicies,
  A extends keyof RLSPolicies[T]
>(
  table: T,
  action: A,
  policy: keyof RLSPolicies[T][A],
  user: AuthUser
): void {
  // Implementation
}
```

### Type Testing
```typescript
// types/helpers/testing.ts
import { expectType, expectError } from 'tsd'
import { Database } from '../generated/database'

// Example type tests
expectType<Tables<'projects'>>({
  id: 1,
  title: 'Project',
  settings: null
})

// Should error on invalid types
expectError<Tables<'projects'>>({
  id: 'invalid', // Type 'string' is not assignable to type 'number'
  title: 'Project'
})
```

## Implementation Plan

### Phase 1: Foundation (Dependencies: None)
- [ ] Create new type directory structure
- [ ] Set up Supabase type generation
- [ ] Implement base type transformers
- Success Criteria:
  - Types automatically generate from database
  - Clear separation between generated and domain types
  - CI/CD validates type generation

### Phase 2: Type Infrastructure (Dependencies: Phase 1)
- [ ] Type Helpers Implementation
  - [ ] Create database type helpers
  - [ ] Add nullable field utilities
  - [ ] Set up type testing framework
- [ ] JSON Column Types
  - [ ] Define schemas for settings and branding
  - [ ] Implement type extensions
- [ ] Auth Context Types
  - [ ] Define auth user types
  - [ ] Implement RLS policy types
- Success Criteria:
  - Type helper functions in place
  - JSON column validation working
  - Auth context types integrated

### Phase 3: API Type Safety (Dependencies: Phase 1, 2)
- [ ] Route Handler Types
  - [ ] Create request/response schemas
  - [ ] Implement type-safe handlers
  - [ ] Add error handling types
- [ ] Integration Testing
  - [ ] Set up type tests
  - [ ] Validate API responses
- Success Criteria:
  - All API routes type-safe
  - Request/response validation working
  - Type tests passing

### Phase 4: High Risk Fixes (Dependencies: Phase 1, 2)
- [ ] Canny API Integration
  - [ ] Create domain types for Canny entities
  - [ ] Implement type-safe context handling
  - [ ] Add runtime validation
- [ ] Project Status
  - [ ] Define proper status enums
  - [ ] Add database constraints
  - [ ] Update component types
- [ ] Date Handling
  - [ ] Create date utility functions
  - [ ] Update components to use safe date handling
- Success Criteria:
  - No type assertions in Canny API
  - Type-safe status handling
  - Safe date operations throughout

### Phase 5: Type Organization (Dependencies: Phase 1, 2, 3, 4)
- [ ] Company Settings
  - [ ] Define proper settings interfaces
  - [ ] Implement Zod validation
  - [ ] Update components
- [ ] Benefits Array
  - [ ] Update database schema
  - [ ] Add proper validation
- Success Criteria:
  - Type-safe settings access
  - Consistent benefit format handling

### Phase 6: Cleanup and Documentation (Dependencies: All Previous)
- [ ] Project-Company Relations
  - [ ] Define proper join types
  - [ ] Update queries and components
- [ ] Remove old type files
- [ ] Update documentation
- Success Criteria:
  - No manual type extensions
  - Clean type organization
  - Updated developer documentation

## Automation & Maintenance

### Type Generation
```bash
npm run update-types  # Generate types from Supabase
npm run type-check    # Validate all types
```

### CI/CD Integration

Add this GitHub Action workflow for automatic type updates:

```yaml
# .github/workflows/update-types.yml
name: Update Types
on:
  push:
    branches: [main]
    paths:
      - 'supabase/**'
      - 'schema.sql'
  workflow_dispatch:

jobs:
  update-types:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install Dependencies
        run: npm ci
        
      - name: Generate Types
        run: |
          npx supabase gen types typescript \
            --project-id ${{ secrets.SUPABASE_PROJECT_ID }} \
            --schema public \
            > src/types/generated/database.ts
            
      - name: Run Type Tests
        run: npm run type-test
        
      - name: Create Pull Request
        uses: peter-evans/create-pull-request@v5
        with:
          title: 'chore: update generated types'
          commit-message: 'chore: update generated types'
          branch: update-types
          delete-branch: true
```

Add pre-commit hook for local development:

```bash
#!/bin/sh
# .husky/pre-commit

npm run generate-types
npm run type-test

# Check if types have changed
git diff --exit-code src/types/generated/database.ts
```

## Progress Tracking

### Checkpoints
1. ✅ Initial setup complete
2. ⬜ High risk issues addressed
3. ⬜ Type organization complete
4. ⬜ Cleanup and documentation

### Dependencies Graph
```
Phase 1 (Foundation)
    ↓
Phase 2 (Type Infrastructure) → Phase 3 (API Type Safety)
    ↓                               ↓
Phase 4 (High Risk) → Phase 5 (Organization)
    ↓                      ↓
                Phase 6 (Cleanup)
```

## Next Steps

1. Begin with Phase 1 setup
2. Validate type generation process
3. Address high-risk Canny API issues first
4. Progress through remaining phases
