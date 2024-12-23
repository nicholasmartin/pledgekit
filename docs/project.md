# Feature Pledger - Complete Technical Specification

## 1. Project Overview

### Core Purpose
A B2B SaaS platform enabling companies to crowdfund feature development through user pledges, similar to Kickstarter but specifically for product feature requests and roadmap items.

### Target Users
- Primary: B2B SaaS companies (platform clients)
- Secondary: End users of these companies (pledge makers)

### Key Requirements
- Allow companies to create and manage feature funding projects
- Enable end users to pledge money towards desired features
- Process payments and manage rewards/benefits
- Provide dashboard for companies to track projects and pledges
- Support public project listings and user engagement

## 2. Technical Architecture

### System Architecture
```
├── Frontend (Next.js)
│   ├── Public Pages (featurepledger.com)
│   │   ├── Landing Page
│   │   ├── Company Registration
│   │   └── Company Login
│   ├── Company Pages (/companies/{company-slug})
│   │   ├── Public Project Listings
│   │   ├── Project Details
│   │   └── User Authentication
│   ├── Admin Dashboard (/admin/*)
│   │   ├── Analytics
│   │   ├── User Management
│   │   └── Project Management
│   └── User Dashboard (/dashboard)
│       ├── Profile
│       ├── Pledges
│       └── Comments
├── Backend Services
│   ├── Authentication (Supabase)
│   ├── Project Management
│   ├── Pledge Processing
│   └── Payment Integration
└── Database (Supabase PostgreSQL)
    ├── User Management
    ├── Project Data
    └── Transaction Records
```

### Core Technologies
- Frontend: Next.js 14 (App Router)
- Authentication: Supabase Auth
- Database: Supabase PostgreSQL
- Payment Processing: Stripe
- AI Integration: For header image generation
- Error Tracking: Sentry

### External Integrations
- Stripe API for payment processing
- Supabase Auth with Google OAuth
- AI service for image generation
- Gravatar for user avatars
- Sentry for error tracking

## 3. Core Features and Modules

### Must-Have Features
- Company Management Module (Complexity: Medium)
  - Company registration with Supabase Auth
  - Yearly subscription management
  - User role management through company_members table
  - Project management
  - Branding customization

- Project Management Module (Complexity: High)
  - Project CRUD operations with RLS policies
  - Draft and preview functionality
  - 30-day maximum duration
  - View tracking (total/unique)
  - AI-generated header graphics
  - Pledge options management
  - Comments system

- Pledge Management Module (Complexity: High)
  - Pledge creation and processing
  - Benefits tracking
  - Payment integration
  - User pledge history
  - Total pledge tracking

- User Management Module (Complexity: Medium)
  - Unified Supabase authentication
  - Profile management with user_profiles table
  - Pledge history
  - Comment management

### Subscription Tiers (Yearly Only)
- Starter: $90/year
- Growth: $290/year
- Enterprise: $990/year

## 4. Database Schema

### Core Tables

```sql
-- Companies table for organization profiles
create table public.companies (
    id uuid primary key default uuid_generate_v4(),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    name text not null,
    slug text not null unique,
    settings jsonb default '{}'::jsonb,
    branding jsonb default '{}'::jsonb,
    subscription_tier text check (subscription_tier in ('starter', 'growth', 'enterprise')),
    stripe_customer_id text,
    stripe_account_id text,
    constraint valid_slug check (slug ~* '^[a-z0-9-]+$')
);

-- Company members table for employee management
create table public.company_members (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid references public.companies(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    role text not null check (role in ('owner', 'admin', 'member')),
    created_at timestamp with time zone default timezone('utc'::text, now()),
    unique(company_id, user_id)
);

-- User profiles for public users
create table public.user_profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    display_name text,
    avatar_url text,
    total_pledged numeric default 0,
    settings jsonb default '{}'::jsonb
);

-- Projects table
create table public.projects (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid references public.companies(id) on delete cascade,
    title text not null,
    description text,
    goal numeric not null,
    amount_pledged numeric default 0,
    end_date timestamp with time zone not null,
    header_image_url text,
    status text check (status in ('draft', 'published', 'completed', 'cancelled')),
    total_views integer default 0,
    unique_views integer default 0,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    constraint valid_duration check (
        end_date <= created_at + interval '30 days'
    )
);

-- Pledge options table
create table public.pledge_options (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references public.projects(id) on delete cascade,
    title text not null,
    amount numeric not null,
    benefits jsonb default '[]'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Pledges table
create table public.pledges (
    id uuid primary key default uuid_generate_v4(),
    user_id uuid references auth.users(id) on delete cascade,
    project_id uuid references public.projects(id) on delete cascade,
    pledge_option_id uuid references public.pledge_options(id) on delete cascade,
    status text check (status in ('pending', 'completed', 'failed', 'refunded')),
    stripe_payment_id text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Comments table
create table public.comments (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references public.projects(id) on delete cascade,
    user_id uuid references auth.users(id) on delete cascade,
    quoted_comment_id uuid references public.comments(id),
    content text not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Project views table
create table public.project_views (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid references public.projects(id) on delete cascade,
    viewer_ip text,
    viewer_user_agent text,
    created_at timestamp with time zone default timezone('utc'::text, now())
);
```

## 5. Development Guidelines

### Frontend (Next.js)
- Use shadcn/ui for component library
- Implement route-based access control
- Use React Query for data fetching
- Implement proper loading states
- No additional state management required
- Implement breadcrumb navigation

### Authentication Strategy
- Unified Supabase authentication system
- Single-domain architecture with route-based access
- Email verification required for all users
- Support email/password and Google OAuth
- Role-based access through company_members table
- Session-based authentication with Supabase

### Error Handling & Monitoring
- Implement Sentry for error tracking
- Configure admin notifications
- Email alerts for Stripe webhook failures
- Implement retry mechanism for critical operations
- Handle session expiry and refresh

### Onboarding Flow
1. Company Registration
   - Basic company information
   - Employee size range selection
   - Company slug selection and validation
2. Account Setup
   - Branding configuration
   - Timezone selection
3. Stripe Integration
   - Subscription selection
   - Payment setup
   - Stripe account connection

### Notification System
- Company notifications
  - Stripe webhook failures (admin only)
  - Project funding goals reached
  - New pledges received
- User notifications
  - Pledge confirmations
  - Project updates
  - Comment responses
  - Getting started guide completion

## 6. Development Phases

### Phase 1: Foundation (Weeks 1-2)
Objective: Set up basic project infrastructure and authentication

1. Project Setup
   - Initialize Next.js project with shadcn/ui
   - Configure routing and middleware
   - Configure Supabase connection
   - Set up Sentry integration
   Success Criteria: Project runs locally with route-based access

2. Authentication Implementation
   - Configure Supabase Auth
   - Implement Google OAuth
   - Set up email verification system
   - Create separate admin and user auth flows
   - Implement Gravatar integration
   Success Criteria: Both companies and users can register/login with email verification

3. Company Onboarding
   - Implement step-by-step registration flow
   - Add company size collection
   - Create slug validation and setup
   - Build getting started guide
   Success Criteria: Companies can complete full onboarding process

### Phase 2: Core Company Features (Weeks 3-4)
Objective: Enable companies to manage their account and projects

1. Company Dashboard
   - Implement yearly subscription management
   - Create statistics dashboard
   - Add company branding customization
   - Add timezone configuration
   - Implement favicon management
   Success Criteria: Companies can manage their subscription and branding

2. Project Management
   - Implement project CRUD with required fields
   - Add 30-day duration limit enforcement
   - Add pledge option management
   - Create project listing view with sorting
   - Implement project modification notifications
   Success Criteria: Companies can create and manage time-bound projects

3. Project Enhancement
   - Implement draft/preview functionality
   - Add project view tracking
   - Create view analytics storage
   Success Criteria: Companies can manage draft projects and track views

### Phase 3: Pledge System (Weeks 5-6)
Objective: Implement complete pledge functionality

1. Payment Integration
   - Set up platform Stripe integration
   - Implement company Stripe account connection
   - Create yearly subscription payment flow
   - Implement pledge payment flow
   Success Criteria: Both subscription and pledge payments work

2. Pledge Management
   - Create pledge creation flow
   - Implement pledge tracking
   - Add user total pledge tracking
   - Add pledge history and benefit tracking
   - Create CSV export for completed projects
   Success Criteria: Companies can track pledges and export data

### Phase 4: User Experience (Weeks 7-8)
Objective: Polish user interactions and add engagement features

1. User Interface
   - Implement public project views with sorting
   - Create user dashboard
   - Add project status handling
   Success Criteria: Users can view and interact with projects

2. Comments System
   - Implement plain text comments
   - Add edit/delete functionality
   - Create comment quoting system
   Success Criteria: Users can comment and quote responses

3. Navigation & Notifications
   - Implement breadcrumb navigation
   - Create email notification system
   - Add notification preferences
   Success Criteria: Users can easily navigate and receive relevant updates

## 7. Assumptions and Constraints

### Technical Assumptions
- Users have modern web browsers
- Stable internet connection
- Stripe availability in target markets

### Business Constraints
- Projects limited to 30-day duration
- Yearly subscriptions only
- USD currency only
- Email verification required
- Companies must connect Stripe account

### Areas Requiring Clarification
- AI service selection for header images
- Email service provider selection
- Future verification methods (SMS/WhatsApp)
- Specific feature limits per subscription tier
