# Authentication Modernization

## Current Implementation
Currently using:
- React Context (`auth-context.tsx`)
- Client-side auth state
- Component-level auth checks

## Target Implementation
Moving to:
- Protected Layout Pattern
- Enhanced Middleware
- Server-side auth management

## Migration Steps

### 1. Implement New Auth Pattern
```typescript
// app/protected/layout.tsx
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  return children
}
```

### 2. Enhanced Middleware
```typescript
// middleware.ts
export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const supabase = createServerClient(/*...*/)
  await supabase.auth.getSession()
  return response
}
```

### 3. Gradual Component Migration
1. Identify protected routes
2. Create protected layouts
3. Remove component-level auth checks
4. Update components to use new pattern

### 4. Testing Strategy
1. Auth Flows
   - Login/Logout
   - Session management
   - Token refresh
   - Protected routes

2. Performance Testing
   - Server response times
   - Client-side performance
   - Bundle size impact

### 5. Cleanup
After successful migration:
- Remove `auth-context.tsx`
- Clean up unused imports
- Update documentation

## Benefits
1. Better Performance
   - Reduced client-side state
   - Fewer API calls
   - Smaller bundle size

2. Enhanced Security
   - Server-side validation
   - Consistent auth checks
   - Proper session management

3. Improved Developer Experience
   - Less boilerplate
   - Clearer auth patterns
   - Better maintainability

## Secure User Type Verification
Currently, user type checks in middleware rely on session data from cookies, which triggers security warnings:
```typescript
// Current pattern (insecure)
const { data: { session } } = await supabase.auth.getSession()
const userType = session?.user?.user_metadata?.user_type
```

New pattern will use protected layouts for secure user verification:
```typescript
// Protected company layout example
export default async function CompanyLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }
  
  // Secure user type verification
  const userType = user.user_metadata?.user_type
  const isCompanyUser = userType === UserType.COMPANY
  
  if (!isCompanyUser) {
    redirect('/dashboard')
  }

  return children
}
```

This approach:
1. Uses `getUser()` for secure verification
2. Performs type checks at the layout level
3. Keeps middleware lightweight with basic session checks
4. Reduces API calls by verifying once per layout mount

## Rollback Plan
1. Keep old implementation during migration
2. Test thoroughly in staging
3. Monitor production deployment
4. Quick revert process if needed
