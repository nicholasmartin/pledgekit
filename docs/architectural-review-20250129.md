# PledgeKit Architectural Review - 2025-01-29

## Authentication System Analysis

### Key Findings
1. **Type Safety Issue**  
   Middleware checks for legacy 'company_member' type (src/middleware.ts:14) that's not in UserType enum (types/external/supabase/auth.ts:7-10)

2. **Role Definition Gaps**
   - String-based role storage in membership.role (types/auth.ts:34)
   - Missing RBAC role hierarchy definitions
   - No centralized policy definitions

3. **Session Management**
   - User type metadata stored in auth.user_metadata limits extensibility
   - No visible session validation/refresh mechanism

### Recommendations

```ts
// Proposed RBAC structure (to be added to types/auth/)
export enum Role {
  ADMIN = 'admin',
  COMPANY_OWNER = 'company_owner',
  PROJECT_MANAGER = 'project_manager',
  CONTRIBUTOR = 'contributor'
}

// Suggested policy format
type Policy = {
  resources: string[]
  actions: ('create' | 'read' | 'update' | 'delete')[]
}

export const RolePolicies: Record<Role, Policy[]> = {
  [Role.ADMIN]: [{ resources: ['*'], actions: ['*'] }],
  // ... other role definitions
}
```

4. **Middleware Improvements**
   - Move path protection rules to RBAC policies
   - Add rate limiting integration (lib/rate-limit.ts)
   - Implement session refresh rotation

## Type System Optimization

1. **Stronger Typing**
   - Convert membership.role to Role enum
   - Add Zod validation for user metadata

2. **Documentation Strategy**
   - Generate type documentation using TypeDoc
   - Add architecture decision records for critical types

## Next Steps
1. Implement RBAC core structures
2. Migrate user type metadata to dedicated profile table
3. Add middleware integration tests