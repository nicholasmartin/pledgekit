# Stripe Integration Implementation Plan

## Project Overview
This document outlines the incremental implementation plan for integrating Stripe payments into PledgeKit. The goal is to enable users to view pledge options and complete payments using Stripe Checkout in a secure and user-friendly manner.

## Key Implementation Notes from Stripe Example

1. Client-Side Setup
   - Initialize Stripe outside component render to avoid recreating Stripe object:
   ```javascript
   const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
   ```
   - Handle redirect status using URLSearchParams after checkout completion
   - Use simple form submission for checkout instead of complex client-side logic

2. Server-Side Setup
   - Use 'payment' mode for one-time payments
   - No need to create Stripe products - use direct price specification
   - Handle HTTP methods properly (POST only)
   - Use proper status codes (303 for redirect, 405 for method not allowed)
   - Include proper error handling with status codes

## Implementation Phases

### Phase 1: Display Pledge Options

1.1. Fetch Pledge Options
- Add API endpoint to fetch pledge options for a project
- Use `pledge_options` table from Supabase

1.2. Update Project Details Page
- Modify `ProjectDetails` component to display pledge options
- Replace current pledge button with list of options
- Add loading states for data fetching

1.3. Styling & Layout
- Ensure pledge options are visually appealing
- Add hover effects and interactive elements
- Maintain responsive design

### Phase 2: Stripe Checkout Implementation

2.1. Initialize Stripe Client
- Add Stripe publishable key to environment variables
- Create stripe.ts utility with loadStripe initialization:
```javascript
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
export const getStripe = () => stripePromise;
```

2.2. Create Checkout Session API
- Create/edit `frontend/src/app/api/checkout` route handler:
```javascript
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const { pledgeOptionId, projectId } = req.body;
    const session = await stripe.checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: {
            name: pledgeOption.title,
            description: pledgeOption.description
          },
          unit_amount: pledgeOption.amount * 100, // convert to cents
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${req.headers.origin}/projects/${projectId}?success=true`,
      cancel_url: `${req.headers.origin}/projects/${projectId}?canceled=true`,
      metadata: {
        projectId,
        pledgeOptionId,
        userId: user.id
      }
    });

    res.redirect(303, session.url);
  } catch (err) {
    res.status(err.statusCode || 500).json(err.message);
  }
}
```

2.3. Update PledgeButton Component
- Modify to handle form submission:
```javascript
export function PledgeButton({ pledgeOption, projectId }) {
  useEffect(() => {
    // Check redirect status
    const query = new URLSearchParams(window.location.search);
    if (query.get('success')) {
      toast.success('Payment successful!');
    }
    if (query.get('canceled')) {
      toast.error('Payment canceled.');
    }
  }, []);

  return (
    <form action="frontend/src/app/api/checkout" method="POST">
      <input type="hidden" name="pledgeOptionId" value={pledgeOption.id} />
      <input type="hidden" name="projectId" value={projectId} />
      <Button type="submit" disabled={isExpired}>
        {isExpired ? 'Project Ended' : `Pledge $${pledgeOption.amount}`}
      </Button>
    </form>
  );
}
```

2.4. Handle Payment Status
- Add success/failure message handling in component
- Update database records based on payment status
- Show appropriate UI feedback

### Phase 3: Error Handling & Security

3.1. Implement Error Handling
- Add error boundaries for API calls
- Show user-friendly error messages
- Log errors for debugging

3.2. Add Security Measures
- Validate user permissions
- Sanitize input data
- Implement rate limiting
- Verify Stripe webhook signatures

3.3. Testing
- Test with Stripe test cards:
  * Success: 4242 4242 4242 4242
  * Failure: 4000 0000 0000 9995
  * Authentication Required: 4000 0025 0000 3155

## Environment Setup

1. Required Environment Variables
```
STRIPE_SECRET_KEY=sk_test_...      # Server-side
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...  # Client-side
```

2. Dependencies
```json
{
  "dependencies": {
    "@stripe/stripe-js": "^1.54.0",
    "stripe": "^12.9.0"
  }
}
```

## Testing & Deployment

1. Development Testing
- Use Stripe test keys
- Test all payment scenarios
- Verify error handling

2. Production Deployment
- Switch to live Stripe keys
- Monitor payment processing
- Handle errors appropriately

## Conclusion

This implementation plan provides a clear, incremental approach to integrating Stripe payments into PledgeKit, incorporating best practices from the Stripe example code. The plan emphasizes simplicity and reliability, using form submission for checkout rather than complex client-side logic, and proper error handling throughout the process.