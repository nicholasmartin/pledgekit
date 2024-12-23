# Feature Pledger

A B2B SaaS platform enabling companies to crowdfund feature development through user pledges.

## Project Structure

```
├── frontend/          # Next.js frontend application
├── backend/           # Node.js/Express backend application
└── README.md         # Project documentation
```

## Tech Stack

- Frontend: Next.js 14 (App Router)
- Backend: Node.js/Express
- Database: Supabase PostgreSQL
- Authentication: Supabase Auth with Google OAuth
- UI Components: shadcn/ui
- Payment Processing: Stripe
- Error Tracking: Sentry

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Supabase account
- Stripe account
- Sentry account

### Environment Variables

#### Frontend (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_SENTRY_DSN=
```

#### Backend (.env)
```
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
SENTRY_DSN=
```

## Development

1. Clone the repository
2. Install dependencies:
   ```bash
   # Frontend
   cd frontend
   npm install

   # Backend
   cd backend
   npm install
   ```
3. Set up environment variables
4. Run development servers:
   ```bash
   # Frontend
   npm run dev

   # Backend
   npm run dev
   ```

## Features

- Company Management
- Project Management
- Pledge Management
- User Management
- Subscription Management (Yearly tiers)
  - Starter: $90/year
  - Growth: $290/year
  - Enterprise: $990/year
