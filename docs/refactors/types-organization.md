# Supabase Types Organization

## Current Structure
Types are currently scattered across:
- Individual files
- `lib` directory
- `types` directory

## New Structure
```
frontend/src/types/
├── external/
│   └── supabase/        # Supabase-specific types
│       ├── auth.ts      # Auth-related types
│       ├── database.ts  # Database schema types
│       └── index.ts     # Type exports
├── domain/             # Domain-specific types
│   └── user/
│       └── index.ts
└── transformers/
    └── supabase.ts    # Supabase type transformers
```

## Migration Steps

### 1. Create Type Structure
- [ ] Create `types/external/supabase` directory
- [ ] Move database types
- [ ] Move auth types
- [ ] Create type exports

### 2. Update Type Imports
- [ ] Update all Supabase-related type imports
- [ ] Ensure proper type paths
- [ ] Verify type coverage

### 3. Type Safety Improvements
- [ ] Add strict type checking
- [ ] Implement proper type guards
- [ ] Add type transformers

### 4. Testing
- [ ] TypeScript compilation
- [ ] Type inference checks
- [ ] Integration testing

## Benefits
1. Consistent type organization
2. Better type discovery
3. Improved maintainability
4. Clear separation of concerns
