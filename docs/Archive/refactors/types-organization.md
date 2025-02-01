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
- [x] Create `types/external/supabase` directory
- [x] Move database types
- [x] Move auth types (`UserType` and `UserDetails` from lib/supabase)
- [x] Create type exports (in types/external/supabase/index.ts)

### 2. Update Type Imports
- [x] Update all Supabase-related type imports
- [x] Ensure proper type paths
- [x] Verify type coverage

### 3. Type Safety Improvements
- [x] Add strict type checking
- [x] Implement proper type guards (added isUserType)
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

## Completed Changes
1. Moved `UserType` and `UserDetails` to `types/external/supabase/auth.ts`
2. Added type guard `isUserType` for runtime type checking
3. Created central type exports in `types/external/supabase/index.ts`
4. Updated all imports in Supabase library files
5. Removed duplicate type definitions from lib/supabase
