# User Access Control Implementation Plan

## Overview
This document outlines the step-by-step implementation of user type separation and access control for the platform. The focus is on separating company users from public users and providing appropriate dashboard experiences for each.

## Current State
- Basic authentication with Supabase
- Existing company dashboard at `/dashboard`
- Basic user dashboard at `/dashboard/user`
- RBAC tables and policies in Supabase

## Implementation Tasks

### 1. User Type Management (Task ID: USER-01)
**Purpose**: Implement clear user type distinction in auth metadata

#### Database Updates
```sql
-- Add user_type to user metadata during registration
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS raw_user_metadata jsonb;
CREATE POLICY "Users can read own user metadata" ON auth.users
    FOR SELECT
    USING (auth.uid() = id);
```

#### Migration for Existing Users (Task ID: USER-01-MIGRATE)
```sql
-- Migration to set user types for existing users
CREATE OR REPLACE FUNCTION set_user_types()
RETURNS void AS $$
BEGIN
  -- Set company members first
  UPDATE auth.users SET raw_user_metadata = 
    COALESCE(raw_user_metadata, '{}'::jsonb) || 
    '{"user_type": "company_member"}'::jsonb
  WHERE id IN (
    SELECT DISTINCT user_id 
    FROM public.company_members
  );

  -- Set remaining users as public users
  UPDATE auth.users SET raw_user_metadata = 
    COALESCE(raw_user_metadata, '{}'::jsonb) || 
    '{"user_type": "public_user"}'::jsonb
  WHERE raw_user_metadata->>'user_type' IS NULL;

  -- Verify no users are left without a type
  IF EXISTS (
    SELECT 1 FROM auth.users 
    WHERE raw_user_metadata->>'user_type' IS NULL
  ) THEN
    RAISE EXCEPTION 'Some users do not have a type assigned';
  END IF;
END;
$$ LANGUAGE plpgsql;

-- Rollback function if needed
CREATE OR REPLACE FUNCTION rollback_user_types()
RETURNS void AS $$
BEGIN
  UPDATE auth.users SET raw_user_metadata = 
    raw_user_metadata - 'user_type';
END;
$$ LANGUAGE plpgsql;
```

#### Migration Verification Steps
1. Count users before migration
2. Run migration function
3. Verify all users have a type
4. Check type distribution
5. Validate specific test cases

```sql
-- Verification queries
SELECT COUNT(*) FROM auth.users; -- Total users
SELECT raw_user_metadata->>'user_type' as user_type, COUNT(*) 
FROM auth.users 
GROUP BY user_type; -- Type distribution
```

#### Implementation Steps:
1. Create migration for user type metadata
2. Run migration for existing users
3. Update registration handlers to set user type
4. Add user type helper functions
5. Add type definitions for user types

```typescript
// Types to implement
enum UserType {
  COMPANY_MEMBER = 'company_member',
  PUBLIC_USER = 'public_user'
}

interface UserMetadata {
  user_type: UserType;
}
```

### 2. Authentication Flow Update (Task ID: AUTH-01)
**Purpose**: Implement type-aware authentication and routing

#### Components to build:
1. Update middleware for user type checking
2. Create type-specific redirects
3. Implement central auth hook

```typescript
// Updated middleware structure
export async function middleware(req: NextRequest) {
  // Check user type
  // Redirect based on user type
  // Handle protected routes
}

// Auth hook structure
export function useAuth() {
  // Get user session
  // Get user type
  // Provide type-specific permissions
}
```

### 3. Dashboard Separation (Task ID: DASH-01)
**Purpose**: Implement separate dashboard experiences

#### Route Structure:
```
/dashboard
  ├── /company     # Company dashboard (existing)
  │   ├── /projects
  │   └── /settings
  └── /user        # Public user dashboard
      ├── /pledges
      └── /profile
```

#### Implementation Steps:
1. Move existing dashboard to `/dashboard/company`
2. Update user dashboard at `/dashboard/user`
3. Create dashboard redirect logic
4. Update navigation links

### 4. Protected Layout Enhancement (Task ID: LAYOUT-01)
**Purpose**: Add user type awareness to protected layouts

#### Components to build:
1. Update ProtectedLayout component
2. Create UserLayout component
3. Create CompanyLayout component
4. Implement layout switching logic

```typescript
// Enhanced ProtectedLayout
interface ProtectedLayoutProps {
  children: React.ReactNode;
  requiredUserType?: UserType;
  fallbackPath?: string;
}
```

### 5. Navigation Components (Task ID: NAV-01)
**Purpose**: Create type-specific navigation components

#### Components to build:
1. Create navigation configurations
2. Update Sidebar component
3. Implement type-specific menu items

```typescript
// Navigation config structure
interface NavigationConfig {
  mainItems: NavItem[];
  bottomItems: NavItem[];
}

const companyNavigation: NavigationConfig = {
  mainItems: [
    { label: 'Dashboard', href: '/dashboard/company' },
    { label: 'Projects', href: '/dashboard/company/projects' }
  ]
};

const userNavigation: NavigationConfig = {
  mainItems: [
    { label: 'Dashboard', href: '/dashboard/user' },
    { label: 'My Pledges', href: '/dashboard/user/pledges' }
  ]
};
```

### 6. Access Control Hook (Task ID: HOOK-01)
**Purpose**: Create central access control hook

#### Features to implement:
1. User type checking
2. Permission validation
3. Navigation helpers
4. Loading states

```typescript
// Hook structure
export function useUserAccess() {
  // Get user session and type
  // Check permissions
  // Provide navigation config
  // Handle loading states
}
```

## Development Sequence

1. Start with USER-01 to establish user type foundation
2. Implement AUTH-01 to ensure proper routing
3. Complete LAYOUT-01 for structural changes
4. Implement DASH-01 for dashboard separation
5. Add NAV-01 for navigation components
6. Finally, implement HOOK-01 for central access control

## Testing Checklist

For each task:
- [ ] Unit tests for new components
- [ ] Integration tests for routing
- [ ] Access control validation
- [ ] Loading state verification
- [ ] Error handling validation

## Implementation Guidelines

1. Use existing Supabase auth setup
2. Maintain TypeScript types throughout
3. Follow existing component patterns
4. Use shadcn/ui components
5. Keep error handling consistent
6. Document all new functions and components

## Security Considerations

1. Always validate user type server-side
2. Implement proper route protection
3. Use RLS policies for data access
4. Maintain audit logs for type changes
5. Handle edge cases (e.g., type switching)
