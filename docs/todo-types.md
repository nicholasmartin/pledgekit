# Type Safety Implementation Plan

## Current Challenge

We're experiencing type mismatches between our database schema and frontend TypeScript types. This leads to:
- Manual type assertions and transformations in components
- Potential runtime errors when database schema changes
- Inconsistent type definitions across the application
- Technical debt as manual types drift from actual database schema

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
