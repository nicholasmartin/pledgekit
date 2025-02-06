# Stripe Webhook Setup Guide

## Local Development Setup

1. Install the Stripe CLI:
   - Download from https://stripe.com/docs/stripe-cli
   - Follow installation instructions for your OS

2. Login to Stripe CLI:
   ```bash
   stripe login
   ```

3. Start webhook forwarding:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   This will output a webhook signing secret - it should match the one in your .env file:
   ```
   STRIPE_WEBHOOK_SECRET=whsec_90ca8bff1c2e805d4915d79cdf84d64cb2c001b9e41bf6ca31a6d5a3b3f0b638
   ```

4. Test the webhook:
   ```bash
   # In a new terminal window
   stripe trigger payment_intent.succeeded
   ```

## Production Setup

1. Go to Stripe Dashboard > Developers > Webhooks
2. Click "Add endpoint"
3. Add your production endpoint URL:
   - Format: `https://your-domain.com/api/webhooks/stripe`
4. Select events to listen for:
   - payment_intent.succeeded
   - payment_intent.payment_failed

## Troubleshooting

1. Verify webhook is receiving events:
   - Check Stripe Dashboard > Developers > Webhooks > Select your endpoint
   - Look at "Recent events" section
   - Check "Status" column for any failed deliveries

2. Common issues:
   - Webhook secret mismatch: Ensure STRIPE_WEBHOOK_SECRET in .env matches the secret in Stripe Dashboard
   - Wrong endpoint URL: Double-check the URL format and path
   - Missing events: Ensure you've selected all required events in webhook settings

3. Testing webhooks:
   - Use Stripe CLI for local testing
   - Use Stripe Dashboard's "Send test webhook" feature for production
   - Check your application logs for any errors

## Required Environment Variables

Make sure these are set in your .env file:
```
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Webhook Event Flow

1. Customer completes payment on Stripe Checkout page
2. Stripe sends webhook event to your endpoint
3. Your endpoint verifies the signature using STRIPE_WEBHOOK_SECRET
4. If signature is valid, updates pledge status in database
5. Sends 200 response to Stripe to acknowledge receipt

Remember to keep the Stripe CLI running with webhook forwarding while testing locally!