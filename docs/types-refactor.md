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
│   │   ├── user.ts
│   │   ├── project.ts
│   │   └── company.ts
│   ├── api/                # API-specific types
│   │   ├── requests.ts
│   │   └── responses.ts
│   └── external/           # Third-party integration types
│       └── stripe.ts
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

### Migration Process

#### 1. Initial Setup
```bash
# Create directory structure
mkdir -p src/types/{generated,domain,api,external}

# Audit current types
find src -type f -name "*.ts" -exec grep -l "type\|interface" {} \;
```

#### 2. File Migration
1. Move existing files:
   - `database.types.ts` → `types/generated/database.ts`
   - `lib/types/user.ts` + `types/auth.ts` → `types/domain/user.ts`
   - `types/stripe.ts` → `types/external/stripe.ts`

2. Create new type files:
   ```typescript
   // types/domain/index.ts
   export * from './user';
   export * from './project';
   export * from './company';
   ```

#### 3. Build Process Integration
1. Add type generation script:
   ```json
   {
     "scripts": {
       "generate-types": "supabase gen types typescript --project-id <id> > src/types/generated/database.ts",
       "type-check": "tsc --noEmit"
     }
   }
   ```

2. Add pre-commit hooks:
   ```bash
   npx husky add .husky/pre-commit "npm run generate-types && git diff --exit-code src/types/generated/database.ts"
   ```

#### 4. Documentation
1. Add README section:
   ```markdown
   ## Type Organization
   - Generated types: Never modify directly
   - Domain types: Business logic types
   - API types: Request/response shapes
   - External types: Third-party integrations
   ```

2. Add JSDoc comments to all type files
3. Document type transformation patterns

## Implementation Plan

### Phase 1: Foundation (Dependencies: None)
- [ ] Create new type directory structure
- [ ] Set up Supabase type generation
- [ ] Implement base type transformers
- Success Criteria:
  - Types automatically generate from database
  - Clear separation between generated and domain types
  - CI/CD validates type generation

### Phase 2: High Risk Fixes (Dependencies: Phase 1)
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

### Phase 3: Type Organization (Dependencies: Phase 1, 2)
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

### Phase 4: Cleanup (Dependencies: Phase 1, 2, 3)
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
- Pre-commit: Type generation and validation
- CI Pipeline: Type consistency checks
- Merge Checks: Block if types are outdated

### Documentation
- Type organization guidelines
- Type generation process
- Common type patterns and solutions

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
Phase 2 (High Risk) → Phase 3 (Organization)
    ↓                      ↓
                    Phase 4 (Cleanup)
```

## Next Steps

1. Begin with Phase 1 setup
2. Validate type generation process
3. Address high-risk Canny API issues first
4. Progress through remaining phases
