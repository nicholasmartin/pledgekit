# User Management & Private Projects Implementation Guide

## Overview
This document outlines the implementation of two key features:
1. **Private Projects** - Allows company users to restrict project visibility
2. **User Whitelisting** - Enables companies to manage approved users who can access private projects

### User Stories
- As a company admin, I want to mark projects as private
- As a company admin, I want to approve specific users to view private projects
- As a regular user, I want to see private projects from companies that have approved me

---

## Database Schema Updates

### Purpose
Create necessary data structures to support private projects and user invitations.

### 1. User Invitations Table (`user_invites`)
```sql
-- Stores invitations sent to potential users
-- Relationships:
--   company_id → companies.id (CASCADE delete)
--   email must be unique per company
CREATE TABLE user_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID REFERENCES companies(id) ON DELETE CASCADE NOT NULL,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  invited_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  UNIQUE(company_id, email)
);
```

### 2. Project Visibility Flag (`projects.is_private`)
```sql
-- Adds privacy toggle to projects
-- Defaults to public visibility
ALTER TABLE projects
ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT FALSE;
```

---

## File Structure Updates

### Key Components
| Path | Purpose |
|------|---------|
| `frontend/src/app/(protected)/dashboard/company/users/page.tsx` | Main user management interface |
| `frontend/src/config/navigation.ts` | Navigation menu configuration |
| `frontend/src/app/(public)/auth/register/page.tsx` | Enhanced registration form |
| `frontend/src/emails/InviteEmail.tsx` | Email template for invitations |

---

## Implementation Details

### 1. Navigation Updates
```typescript
// Add "Users" entry to company dashboard navigation
// Location: frontend/src/config/navigation.ts
export const companyDashboardConfig = {
  mainNav: [
    // ... existing navigation items
    {
      title: "Users",
      href: "/dashboard/company/users",  // Links to user management
      icon: "users",  // Uses Lucide React users icon
      description: "Manage approved users"
    },
  ],
};
```

### 2. User Management Interface
```tsx
// Uses existing Shell layout structure
// Location: frontend/src/app/(protected)/dashboard/company/users/page.tsx
import { Shell } from "@/components/dashboard/shell"
import { 
  PageHeader, 
  PageHeaderDescription, 
  PageHeaderHeading 
} from "@/components/page-header"
import { UserInviteForm } from "@/components/forms/user-invite-form"
import { UserTable } from "@/components/tables/user-table"

export default function UserManagementPage() {
  return (
    <Shell variant="sidebar">
      <PageHeader separated>
        <div className="flex space-x-4">
          <PageHeaderHeading size="sm">User Management</PageHeaderHeading>
          <PageHeaderDescription size="sm">
            Manage approved users and pending invitations
          </PageHeaderDescription>
        </div>
        <UserInviteForm className="w-full md:w-[300px]" />
      </PageHeader>
      
      <section className="grid gap-4">
        <div className="overflow-hidden rounded-lg border">
          <UserTable 
            type="pending"
            title="Pending Invitations"
            description="Users who haven't accepted their invitations yet"
          />
        </div>
        
        <div className="overflow-hidden rounded-lg border">
          <UserTable
            type="approved"
            title="Approved Users"
            description="Users with access to private projects"
          />
        </div>
      </section>
    </Shell>
  );
}
```

### 3. Registration Flow Enhancement
```tsx
// Prefills registration form from invitation parameters
// Location: frontend/src/app/(public)/auth/register/page.tsx
export default function RegisterPage() {
  const searchParams = useSearchParams();
  
  // Extract invitation details from URL params
  const invitationData = {
    email: searchParams.get('email'),
    firstName: searchParams.get('firstName'),
    lastName: searchParams.get('lastName')
  };

  return (
    <Card className="mx-auto max-w-sm">
      <CardHeader>
        <CardTitle className="text-2xl">
          {invitationData.email ? "Complete Registration" : "Create Account"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <UserAuthForm 
          defaultValues={invitationData}  // Prefill form fields
          invitationData={invitationData}
        />
      </CardContent>
    </Card>
  );
}
```

---

## System Workflows

### Invitation Process
1. **Admin Action**: Company admin submits invitation form
2. **Validation**:
   - Existing user → Add to approved list
   - New user → Create `user_invites` record
3. **Email**: Send invitation with prefilled registration link
4. **Registration**: User completes signup → Mark invitation as accepted

### Project Visibility Logic
```typescript
// Filter projects based on user's approval status
// Location: frontend/src/app/(protected)/dashboard/company/projects/page.tsx
const { data: projects } = await supabase
  .from('projects')
  .select()
  .or(`is_private.eq.false,company_id.in.(${approvedCompanyIds})`);
```

---

## Security Implementation

### 1. Row-Level Security (RLS)
```sql
-- Restrict user_invites access to company admins
CREATE POLICY "Company admins manage invites" ON user_invites
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM company_members 
    WHERE company_id = user_invites.company_id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  )
);
```

### 2. Performance Optimization
```sql
-- Speed up email-based lookups
CREATE INDEX idx_user_invites_email ON user_invites(email);
```

---

## Next Steps

### Implementation Roadmap
1. **Database Migration**
   - Create `user_invites` table
   - Add `is_private` column to projects

2. **Core Functionality**
   - User management UI
   - Registration form updates

3. **Security**
   - Implement RLS policies
   - Add invitation email validation

4. **Testing**
   - Verify project visibility rules
   - Test invitation flow end-to-end

### Future Improvements
- Bulk CSV import functionality
- Granular project-level permissions
- Invitation expiration system
