
# PledgeKit Role-Based Access Control (RBAC) Strategy

## User Role Hierarchy

### User Roles
1. **Company Owner**
   - Full access to company dashboard
   - Can create and manage projects
   - Can set project visibility
   - Can manage user access

2. **Company Member**
   - Limited access to company dashboard
   - Can view and potentially edit projects based on permissions

3. **Public User**
   - Can view public projects
   - Limited dashboard access
   - No project creation rights

4. **Public User with Private Access**
   - Can view public projects
   - Can view specific private projects granted by companies
   - Automatically upgraded from Public User

## Access Control Mechanism

### Project Visibility
- **Public Projects**
  - Visible to all users
  - No additional access required

- **Private Projects**
  - Visible only to:
    - Company owners and members
    - Specifically granted public users

### Access Granting Process
1. **Automatic Email Whitelisting**
   - Companies can upload customer email lists
   - Existing users matching whitelisted emails get instant private access
   - New users registering with whitelisted emails get automatic access

2. **Manual Access Request**
   - Public users can request access to private projects
   - Company manually reviews and approves/rejects requests

### Database Schema

#### User Private Access Table
```sql
CREATE TABLE user_private_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
  company_id UUID REFERENCES companies(id),
  access_type TEXT, -- 'customer_list', 'manual_request'
  status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE
)
```

#### Projects Table Modification
```sql
ALTER TABLE projects ADD COLUMN visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private'))
```

### Access Checking Logic

#### Key Functions
```typescript
enum UserRole {
  COMPANY_OWNER = 'company_owner',
  COMPANY_MEMBER = 'company_member',
  PUBLIC_USER = 'public_user',
  PUBLIC_USER_PRIVATE_ACCESS = 'public_user_private_access'
}

async function canAccessProject(
  userId: string,
  projectId: string
): Promise<boolean> {
  // Check project visibility and user's access rights
  // Returns true if user can view the project
}

async function getAccessibleProjects(userId: string) {
  // Retrieve projects user is allowed to view
  // Combines public and privately accessible projects
}
```

### Implementation Considerations
* Soft delete for access revocation
* Exact email match for whitelisting
* Automatic and manual access granting
* Performance-optimized access checks

### Future Enhancements
* Granular permission levels
* Access request workflow
* Audit logging
* Bulk email invitation system

### Security Principles
* Principle of least privilege
* Clear separation of access rights
* Transparent access management
* Easy to extend and modify



# PledgeKit User Access Control: Incremental Development Roadmap

## Phase 1: Foundation and Database Preparation

### 1.1 Database Schema Updates
- [ ] Create `user_private_access` table in Supabase
- [ ] Modify `projects` table to add `visibility` column
- [ ] Create database functions for managing access

### 1.2 User Role Refinement
- [ ] Update user registration to support expanded role model
- [ ] Modify existing authentication flow to accommodate new roles
- [ ] Create enum for user roles

## Phase 2: Access Management Infrastructure

### 2.1 Backend Access Control
- [ ] Implement `canAccessProject()` function
- [ ] Create RPC functions for:
  - Checking user project access
  - Listing accessible projects
- [ ] Add server-side middleware for route protection

### 2.2 User Access Utilities
- [ ] Develop utility functions for:
  - Checking user access status
  - Retrieving user's accessible projects
- [ ] Create helper methods for role-based access

## Phase 3: Company User Management

### 3.1 Whitelist Management
- [ ] Create UI for companies to upload customer emails
- [ ] Implement batch email whitelist processing
- [ ] Add validation and error handling for email lists

### 3.2 Automatic Access Granting
- [ ] Develop background job for matching whitelisted emails
- [ ] Create system to automatically update user access
- [ ] Implement notification mechanism for access changes

## Phase 4: User Experience Enhancements

### 4.1 Project Visibility Controls
- [ ] Add project visibility toggle in project creation/edit
- [ ] Create UI indicators for project access status
- [ ] Implement project listing with access filtering

### 4.2 User Dashboard Updates
- [ ] Modify user dashboard to reflect access levels
- [ ] Add sections for:
  - Public projects
  - Privately accessible projects
- [ ] Create visual distinctions for project access

## Phase 5: Advanced Access Management

### 5.1 Manual Access Requests
- [ ] Design request submission UI
- [ ] Create company approval workflow
- [ ] Implement notification system for access requests

### 5.2 Access Revocation
- [ ] Develop soft delete mechanism for user access
- [ ] Create audit logging for access changes
- [ ] Implement access status tracking

## Phase 6: Testing and Refinement

### 6.1 Comprehensive Testing
- [ ] Unit tests for access control functions
- [ ] Integration tests for user access workflows
- [ ] Edge case scenario testing

### 6.2 Performance Optimization
- [ ] Implement caching for access rights
- [ ] Optimize database queries
- [ ] Add performance monitoring

## Recommended Development Approach

1. Complete each phase incrementally
2. Implement thorough testing after each phase
3. Conduct user acceptance testing
4. Iterate based on feedback

## Potential Challenges and Mitigations

- **Complex access logic**
  - *Mitigation*: Keep access rules simple and transparent

- **Performance overhead**
  - *Mitigation*: Use efficient database queries

- **User experience complexity**
  - *Mitigation*: Provide clear UI/UX for access management

## Technology Stack

- Supabase for backend
- Next.js for frontend
- TypeScript for type safety
- React for UI components

## Documentation Requirements

- Detailed API documentation
- User guides for access management
- Developer documentation for future extensions

## Estimated Timeline

- **Phase 1-2**: 2-3 weeks
- **Phase 3-4**: 3-4 weeks
- **Phase 5-6**: 2-3 weeks

**Total Estimated Development Time**: 7-10 weeks

### Next Immediate Steps

1. Review and validate roadmap
2. Prioritize phases
3. Begin implementation of Phase 1