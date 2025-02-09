# Company Dashboard - Pledges Page Implementation

## Overview
Simple implementation plan for adding a Pledges page to the company dashboard that displays all pledges received by the company.

## Implementation Steps

### 1. Navigation Update
Location: `frontend/src/config/navigation.ts`
- Add "Pledges" menu item under company dashboard navigation
- Position below "Projects" menu item

### 2. Page Creation
Location: `frontend/src/app/(protected)/dashboard/company/pledges/page.tsx`
- Create simple page component using existing patterns
- Access user/company data via useAuth hook
- Display basic data table showing pledges

### 3. Data Table Implementation
Columns to include:
- Pledge Date
- Amount
- Status
- Project Title
- User Name
- User Email

### 4. Database Query
```sql
SELECT 
  p.*,
  proj.title as project_title,
  up.full_name as user_full_name,
  au.email as user_email
FROM pledges p
JOIN projects proj ON p.project_id = proj.id
JOIN user_profiles up ON p.user_id = up.user_id
JOIN auth.users au ON p.user_id = au.id
WHERE proj.company_id = ?
ORDER BY p.created_at DESC
```

## Implementation Guide

1. **Add Navigation Item**
   ```typescript
   {
     title: "Pledges",
     href: "/dashboard/company/pledges",
     icon: BanknotesIcon,
   }
   ```

2. **Create Page Component**
   - Create directory: `frontend/src/app/(protected)/dashboard/company/pledges`
   - Create `page.tsx` with basic table implementation
   - Use existing table component from UI library
   - Fetch data using Supabase server client

Note: We'll use existing types and components where possible to keep the implementation simple. No need for new type definitions or complex features initially.
