# Authentication and User Management Technical Specification

## Introduction

This document outlines the technical implementation for authentication and user management in our feature crowdfunding platform. The platform follows a Kickstarter-style single-domain architecture, where all content lives under one main domain. This approach prioritizes simplicity and maintainability while providing a clear path for future expansion.

## Architectural Decisions

Our platform uses a single-domain approach where:

The main application lives at `myapp.com`, with company profiles accessible at `myapp.com/companies/{company-slug}` and their projects at `myapp.com/projects/{project-slug}`. This architecture simplifies deployment, security, and maintenance while still providing companies with branded profile pages.

We use Supabase for authentication and database management, leveraging their built-in `auth.users` table as our single source of truth for user authentication. This provides us with robust security features and simplifies user management across different user types.

## Database Schema

Our schema design separates authentication (handled by Supabase's auth.users) from application-specific user data:

```sql
-- Companies table for organization profiles
create table public.companies (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    name text not null,
    slug text not null unique,
    description text,
    settings jsonb default '{}'::jsonb,
    -- Ensure valid slugs
    constraint valid_slug check (slug ~* '^[a-z0-9-]+$')
);

-- Company members table for employee management
create table public.company_members (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid references public.companies(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role text not null check (role in ('owner', 'admin', 'member')),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    -- Ensure unique user per company
    unique(company_id, user_id)
);

-- User profiles for public users
create table public.user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    display_name text,
    settings jsonb default '{}'::jsonb
);
```

## Authentication Implementation

### Company Registration Flow

The company registration process creates both an auth user and company record:

```typescript
// handlers/companyRegistration.ts
async function handleCompanySignup(email: string, password: string, firstName: string) {
  // First create the auth user with Supabase
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        user_type: 'company_owner'
      },
      // Redirect to dashboard after verification
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?verified=true`
    }
  })

  if (authError) throw authError

  // Then create company record and link user as owner
  const { error: companyError } = await supabase.rpc('create_company_with_owner', {
    user_id: authUser.user.id,
    company_name: `${firstName}'s Company`,
    owner_name: firstName
  })

  if (companyError) throw companyError

  return authUser
}
```

### Public User Registration

Public user registration follows a similar but simpler flow:

```typescript
// handlers/userRegistration.ts
async function handlePublicSignup(email: string, password: string, displayName: string) {
  // Create auth user
  const { data: authUser, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        user_type: 'public_user'
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/explore?verified=true`
    }
  })

  if (authError) throw authError

  // Create public user profile
  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: authUser.user.id,
      display_name: displayName
    })

  if (profileError) throw profileError

  return authUser
}
```

## Email Verification

We implement a non-blocking email verification system that allows users to explore while encouraging verification:

```typescript
// components/VerificationBanner.tsx
export function VerificationBanner() {
  const { user } = useUser()
  const [isResending, setIsResending] = useState(false)
  
  // Only show if email isn't verified
  if (user?.email_confirmed_at) return null

  async function handleResend() {
    setIsResending(true)
    await supabase.auth.resend({
      type: 'signup',
      email: user.email,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?verified=true`
      }
    })
    setIsResending(false)
  }

  return (
    <div className="bg-blue-50 p-4 rounded-md">
      <div className="flex justify-between items-center">
        <p className="text-blue-700">
          Please verify your email to unlock all features. 
          Check your inbox for the verification link.
        </p>
        <button 
          onClick={handleResend}
          disabled={isResending}
          className="text-blue-700 underline"
        >
          Resend verification email
        </button>
      </div>
    </div>
  )
}
```

## URL Structure and Routing

Our application uses a clean, hierarchical URL structure:

Main Application Routes:
- Home: `myapp.com`
- Explore: `myapp.com/explore`
- User Dashboard: `myapp.com/dashboard`

Company-Specific Routes:
- Company Profile: `myapp.com/companies/{company-slug}`
- Company Dashboard: `myapp.com/company/dashboard`
- Company Projects: `myapp.com/companies/{company-slug}/projects`

Project Routes:
- Project Page: `myapp.com/projects/{project-slug}`
- Project Pledges: `myapp.com/projects/{project-slug}/pledge`

## Security Implementation

### Row Level Security Policies

We implement Row Level Security (RLS) policies to ensure data access control:

```sql
-- Companies visibility
create policy "Companies are visible to everyone"
  on companies for select
  using (true);

-- Company members management
create policy "Company owners can manage members"
  on company_members for all
  using (
    auth.uid() in (
      select user_id 
      from company_members 
      where company_id = company_members.company_id 
      and role = 'owner'
    )
  );

-- User profiles visibility
create policy "Profiles are visible to everyone"
  on user_profiles for select
  using (true);

create policy "Users can update their own profile"
  on user_profiles for update
  using (auth.uid() = id);
```

## Future Considerations

### Private Projects Support

The system is designed to support private projects in the future:

```sql
-- Add visibility control to projects
alter table projects add column visibility text 
  check (visibility in ('public', 'private', 'invited'));

-- Create invite system
create table project_invites (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references projects(id) on delete cascade,
    email text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    -- Add constraints as needed
    constraint unique_project_invite unique (project_id, email)
);
```

### Edge Cases and Error Handling

Our implementation handles several important edge cases:

1. Authentication State Management:
   - Handle session expiry and refresh
   - Manage verification state across page refreshes
   - Handle registration rate limiting

2. Access Control:
   - Redirect unauthorized users from private routes
   - Handle invalid or expired verification links
   - Manage concurrent sessions

3. Error States:
   - Network failures during authentication
   - Database transaction failures
   - Invalid email verification attempts

## Development Notes

When implementing this system:

1. Always use TypeScript for type safety and better developer experience.
2. Implement proper error boundaries and loading states.
3. Use Supabase's built-in security features rather than building custom solutions.
4. Follow Next.js best practices for route handling and server-side rendering.
5. Implement proper client-side validation before making API calls.

## Conclusion

This implementation provides a solid foundation for user authentication and management while maintaining flexibility for future feature additions. The single-domain approach simplifies the initial implementation while still providing all necessary functionality for companies and public users.