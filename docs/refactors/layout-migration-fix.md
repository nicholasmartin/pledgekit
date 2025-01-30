# Protected Layout Migration Fix

## Error Context
```ts
// Error in frontend/src/app/dashboard/layout.tsx:1
import { ProtectedLayout } from '@/components/layouts/protected-layout'
// Error: Cannot find module
```

## Root Cause
The protected layout implementation has moved to the new auth pattern:
```text
OLD: components/layouts/protected-layout.tsx
NEW: (protected)/layout.tsx (parent layout)
     + AuthProvider from components/providers/auth-provider.tsx
```

## Fix Implementation

1. Update imports in `dashboard/layout.tsx`:
```diff
- import { ProtectedLayout } from '@/components/layouts/protected-layout'
+ import { useAuth } from '@/components/providers/auth-provider'
+ import { DashboardShell } from '@/components/dashboard/shell'
```

2. Update layout component:
```ts
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { userType } = useAuth()
  
  return (
    <DashboardShell userType={userType}>
      {children}
    </DashboardShell>
  )
}
```

3. Remove legacy props:
```diff
- <ProtectedLayout requiredUserType={UserType.USER}>
-   {/* ... */}
- </ProtectedLayout>
```

## Verification Steps
1. Check middleware configuration handles `/dashboard/*` routes
2. Ensure `components/providers/auth-provider` is properly initialized
3. Confirm type safety for userType prop