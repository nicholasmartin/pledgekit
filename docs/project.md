# Feature Pledger - Complete Technical Specification

## 1. Project Overview

### Core Purpose
A B2B SaaS platform enabling software companies to crowdfund feature development through user pledges. Built on top of Canny's feature request system, we provide a seamless way for companies to monetize and prioritize their product roadmap through user financial commitments.

### Target Users
- Primary: B2B SaaS companies using Canny for feature requests
- Secondary: End users of these companies (pledge makers)

### Core Technical Foundations
This project is built on several fundamental technical decisions that form the backbone of our architecture:

- **Supabase**: Our foundational platform for both authentication and database management. This is a core architectural decision that will not change.
- **Canny Integration**: Primary source for feature requests, deeply integrated into our platform's core functionality.
- **Next.js with App Router**: Modern React framework for our frontend implementation
- **Express.js**: Backend framework for API development
- **Stripe**: Payment processing integration

### Key Requirements
- Seamless integration with existing Canny boards for feature request management
- Allow companies to create funding campaigns for Canny feature requests
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
│   ├── Canny Sync Service
│   └── Payment Integration
└── Database (Supabase PostgreSQL)
    ├── User Management
    ├── Project Data
    ├── Canny Integration
    └── Transaction Records
```

### Core Technologies
- Frontend: Next.js (App Router)
- Authentication & Database: Supabase
- Feature Management: Canny
- Payment Processing: Stripe
- Error Tracking: Sentry

### External Integrations
- Canny API for feature request sync
- Stripe API for payment processing
- Supabase Auth
- Sentry for error tracking

## 3. Core Features and Modules

### Must-Have Features
- Canny Integration Module (Complexity: High)
  - Automatic sync with company's Canny board
  - Feature request import and status tracking
  - Bi-directional updates between Canny and pledges
  - Analytics integration

- Company Management Module (Complexity: Medium)
  - Company registration with Supabase Auth
  - Yearly subscription management
  - User role management through company_members table
  - Canny board configuration
  - Branding customization

- Project Management Module (Complexity: High)
  - Project creation from Canny feature requests
  - Draft and preview functionality
  - 30-day maximum duration
  - View tracking (total/unique)
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
    canny_api_key text,
    canny_board_id text,
    constraint valid_slug check (slug ~* '^[a-z0-9-]+$')
);

-- Canny posts table for feature request sync
create table public.canny_posts (
    id uuid primary key default uuid_generate_v4(),
    company_id uuid references public.companies(id) on delete cascade,
    canny_post_id text not null,
    title text not null,
    details text,
    status text not null,
    score integer not null default 0,
    comment_count integer not null default 0,
    author_name text,
    url text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    last_synced_at timestamp with time zone default timezone('utc'::text, now()) not null,
    project_id uuid references projects(id) on delete set null,
    unique(company_id, canny_post_id)
);

## 5. Development Guidelines

### Core Technical Principles
1. **Supabase First**: All authentication and database operations must use Supabase
   - Authentication flows must use Supabase Auth
   - Database operations must utilize Supabase PostgreSQL
   - Row Level Security (RLS) policies must be implemented for all tables

2. **Canny Integration**: All feature management flows through Canny
   - Features must be sourced from Canny boards
   - Maintain bi-directional sync with Canny
   - Respect Canny rate limits and API guidelines

3. **Modern Frontend Development**
   - Use Next.js App Router for routing
   - Implement proper loading and error states
   - Follow React best practices

### Development Setup
1. Required accounts:
   - Supabase account (for auth and database)
   - Canny account (for feature management)
   - Stripe account (for payments)
   - Sentry account (for error tracking)

2. Environment setup:
   ```
   # Required environment variables
   NEXT_PUBLIC_SUPABASE_URL=
   NEXT_PUBLIC_SUPABASE_ANON_KEY=
   SUPABASE_SERVICE_ROLE_KEY=
   CANNY_API_KEY=
   STRIPE_SECRET_KEY=
   SENTRY_DSN=
   ```

3. Development workflow:
   - Use TypeScript for all new code
   - Follow existing patterns for Supabase and Canny integration
   - Implement proper error handling
   - Write tests for critical paths

### Deployment
- Frontend: Vercel (recommended for Next.js)
- Backend: Any Node.js hosting platform
- Database: Supabase (managed PostgreSQL)
- Feature Management: Canny (managed service)

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
