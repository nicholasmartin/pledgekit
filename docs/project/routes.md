# PledgeKit Route Structure

## Overview
The application uses Next.js App Router with route groups to organize public and protected routes.

## Route Groups

### (public)
Public routes accessible without authentication.

```
/app/(public)/
├── auth/           # Authentication callbacks and verification
├── companies/      # Public company profiles
├── explore/        # Public project exploration
├── how-it-works/   # Product information
├── login/          # User login
├── register/       # User registration
├── layout.tsx      # Public layout with minimal providers
└── page.tsx        # Landing page
```

### (protected)
Routes requiring authentication. Protected by middleware.

```
/app/(protected)/
├── dashboard/
│   ├── company/   # Company-specific dashboard
│   └── user/      # User-specific dashboard
└── layout.tsx     # Protected layout with auth providers
```

## Layout Structure

### Root Layout (`app/layout.tsx`)
- Base HTML structure
- Global styles
- Base providers (theme, query client)
- No auth-specific logic

### Public Layout (`app/(public)/layout.tsx`)
- Used for unauthenticated routes
- Includes navigation and footer
- Uses BaseProviders
- No auth checks

### Protected Layout (`app/(protected)/layout.tsx`)
- Server-side auth verification
- Full auth providers
- User context
- Role-based access control

## Auth Flow
1. Middleware checks protected routes
2. Unauthenticated users redirected to login
3. Login preserves original URL for redirect
4. User type determines dashboard access
5. Role-specific redirects prevent unauthorized access

## Provider Structure
- `BaseProviders`: Essential providers (theme, query client)
- `AuthProvider`: Auth-specific context and state
- Clear separation between public and authenticated contexts
