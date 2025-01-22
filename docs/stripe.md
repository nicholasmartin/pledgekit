# Stripe Integration Documentation

## Overview

This document outlines the implementation of Stripe payments in PledgeKit. The integration enables users to make one-time payments towards project pledge options using Stripe Checkout.

### Core Features
- One-time payments for project pledges
- Stripe Checkout for secure payment processing
- USD currency support
- Direct payments to MagLoft (single merchant setup)
- Confirmation page before checkout

### Product Handling
PledgeKit uses Stripe's dynamic pricing feature instead of creating permanent Stripe Products. This means:
- Pledge amounts are passed directly to Stripe during checkout
- No need to pre-create or manage products in Stripe
- Amounts and details come directly from our `pledge_options` table
- Simpler maintenance and cleaner Stripe dashboard

This approach is ideal for one-time payments with variable amounts, which matches our pledge-based funding model.

## Implementation

### 1. Initial Setup

#### Environment Variables
Add the following to your `.env.local`:
```bash
STRIPE_SECRET_KEY=sk_test_...  # Test mode key for development
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Public key for client-side
```

#### Install Dependencies
```bash
npm install stripe @stripe/stripe-js
```

#### TypeScript Types
Create `types/stripe.ts`:
```typescript
export interface CreateCheckoutSessionData {
  pledgeOptionId: string;
  projectId: string;
  userId: string;
}

export interface CheckoutSession {
  id: string;
  url: string;
}
```

### 2. Backend Implementation

#### Create API Route
Create `app/api/checkout/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies });
    const { pledgeOptionId, projectId } = await request.json();

    // Verify user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get pledge option details
    const { data: pledgeOption, error: pledgeError } = await supabase
      .from('pledge_options')
      .select('*, projects(company_id, title)')
      .eq('id', pledgeOptionId)
      .single();

    if (pledgeError || !pledgeOption) {
      return NextResponse.json(
        { error: 'Pledge option not found' },
        { status: 404 }
      );
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: pledgeOption.title,
              description: pledgeOption.description || undefined,
            },
            unit_amount: Math.round(pledgeOption.amount * 100), // Convert to cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/projects/${projectId}`,
      client_reference_id: `${projectId}:${pledgeOptionId}:${user.id}`,
      customer_email: user.email,
      metadata: {
        projectId,
        pledgeOptionId,
        userId: user.id,
      },
    });

    return NextResponse.json({ id: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe session creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
```

### 3. Frontend Implementation

#### Confirmation Dialog Component
Create `components/pledge/confirmation-dialog.tsx`:
```typescript
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pledgeOption: {
    id: string;
    title: string;
    description: string | null;
    amount: number;
  };
  projectId: string;
}

export function ConfirmationDialog({
  open,
  onOpenChange,
  pledgeOption,
  projectId,
}: ConfirmationDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    try {
      setIsLoading(true);

      // Create checkout session
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pledgeOptionId: pledgeOption.id,
          projectId,
        }),
      });

      const { url } = await response.json();
      if (!url) throw new Error('No checkout URL received');

      // Redirect to Stripe Checkout
      window.location.href = url;
    } catch (error) {
      console.error('Payment initiation error:', error);
      // Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <div className="p-6">
        <h3 className="text-lg font-semibold mb-4">
          Confirm Your Pledge
        </h3>
        <div className="space-y-4">
          <div>
            <h4 className="font-medium">{pledgeOption.title}</h4>
            <p className="text-sm text-muted-foreground">
              {pledgeOption.description}
            </p>
          </div>
          <div className="text-lg font-semibold">
            ${pledgeOption.amount}
          </div>
          <div className="flex justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Proceed to Payment'}
            </Button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
```

### 4. Usage

In your project page or component where you display pledge options:

```typescript
import { ConfirmationDialog } from "@/components/pledge/confirmation-dialog";

export function PledgeOption({ option, projectId }) {
  const [showConfirmation, setShowConfirmation] = useState(false);

  return (
    <>
      <Button onClick={() => setShowConfirmation(true)}>
        Pledge ${option.amount}
      </Button>

      <ConfirmationDialog
        open={showConfirmation}
        onOpenChange={setShowConfirmation}
        pledgeOption={option}
        projectId={projectId}
      />
    </>
  );
}
```

## Security Considerations

1. **Environment Variables**
   - Never expose the `STRIPE_SECRET_KEY` in client-side code
   - Only use the public key (`NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`) in the browser

2. **Payment Data**
   - Never handle raw credit card data
   - Use Stripe Checkout to ensure PCI compliance
   - Always validate pledge options server-side before creating checkout sessions

3. **User Authentication**
   - Ensure users are authenticated before initiating checkout
   - Validate user permissions for accessing pledge options

## Future Enhancements

1. **Payment Status Tracking**
   - Implement webhook handling for payment status updates
   - Store payment/pledge status in the database
   - Send email notifications for successful/failed payments

2. **Subscription Support**
   - Add support for recurring pledges
   - Implement subscription management

3. **Multi-Currency Support**
   - Add support for multiple currencies
   - Implement currency conversion

4. **Platform Fee Implementation**
   - Add platform fee calculation
   - Implement fee splitting using Stripe Connect

## Development and Testing

### Test Mode Setup

1. **Stripe Test Keys**
   ```bash
   # Development (.env.local)
   STRIPE_SECRET_KEY=sk_test_...      # Test Secret Key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Test Publishable Key
   
   # Production (.env.production)
   STRIPE_SECRET_KEY=sk_live_...      # Live Secret Key
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...  # Live Publishable Key
   ```

2. **Test Card Numbers**
   ```plaintext
   # Always Successful
   Card: 4242 4242 4242 4242
   Exp: Any future date
   CVC: Any 3 digits

   # Always Declined
   Card: 4000 0000 0000 0002
   
   # Requires Authentication (3D Secure)
   Card: 4000 0000 0000 3220
   ```

### Local Development Workflow

1. **Install Stripe CLI**
   ```bash
   # Install Stripe CLI for webhook testing
   brew install stripe/stripe-cli/stripe

   # Login to Stripe
   stripe login

   # Forward webhooks to localhost
   stripe listen --forward-to localhost:3000/api/webhooks
   ```

2. **Testing Scenarios**
   - Test successful payments with `4242 4242 4242 4242`
   - Test failed payments with `4000 0000 0000 0002`
   - Test 3D Secure with `4000 0000 0000 3220`
   - Test webhook handling using Stripe CLI
   - Test error handling and UI states

3. **Development Dashboard**
   - Use [Stripe Dashboard](https://dashboard.stripe.com/test/dashboard) in test mode
   - Monitor test webhooks
   - View test payments and logs
   - Test refund process

## Production Deployment

### Pre-deployment Checklist

1. **Stripe Account Setup**
   - Complete business verification
   - Add bank account for payouts
   - Configure payout schedule
   - Set up tax reporting information

2. **Environment Configuration**
   ```bash
   # Vercel Environment Variables
   STRIPE_SECRET_KEY=sk_live_...           # Live mode
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...         # Live webhook signing secret
   ```

3. **Domain Configuration**
   - Verify domain ownership in Stripe
   - Update webhook endpoints
   - Configure allowed domains for Checkout
   - Enable HTTPS (required for Stripe)

4. **Testing in Production**
   - Use test mode API keys in staging environment
   - Perform test transactions before going live
   - Verify webhook reception
   - Test error scenarios

### Moving to Production

1. **API Keys Rotation**
   - Generate new live mode API keys
   - Update environment variables
   - Keep test mode keys for staging/development

2. **Webhook Configuration**
   - Set up production webhook endpoints
   - Configure webhook signing secret
   - Test webhook delivery
   - Set up webhook monitoring

3. **SSL/HTTPS Setup**
   - Ensure valid SSL certificate
   - Force HTTPS on all payment pages
   - Verify secure connection in production

### Monitoring and Debugging

1. **Stripe Dashboard**
   - Monitor live transactions
   - Track payment success rates
   - View detailed error logs
   - Monitor webhook delivery

2. **Error Tracking**
   - Log payment failures
   - Monitor API errors
   - Track webhook processing
   - Set up alerts for critical failures

3. **Common Issues**
   - Invalid API keys
   - Webhook signing failures
   - 3D Secure authentication errors
   - Network/timeout issues

### Best Practices

1. **Security**
   - Never log full card details
   - Rotate API keys periodically
   - Monitor for suspicious activity
   - Keep Stripe SDK updated

2. **Testing**
   - Maintain separate test environment
   - Use test mode for development
   - Test all error scenarios
   - Verify webhook handling

3. **Deployment**
   - Use staging environment
   - Deploy during low-traffic periods
   - Monitor initial transactions
   - Have rollback plan ready

4. **Documentation**
   - Document API key locations
   - Maintain testing guidelines
   - Record deployment procedures
   - Keep troubleshooting guides updated
