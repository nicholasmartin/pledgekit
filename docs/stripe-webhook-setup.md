# Stripe Webhook Setup Instructions

1. **Install Stripe CLI**
   - Download from: https://stripe.com/docs/stripe-cli
   - This allows you to test webhooks locally

2. **Login to Stripe CLI**
   ```bash
   stripe login
   ```

3. **Forward Webhooks to Local Server**
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   - This command will output a webhook signing secret
   - Copy this secret and add it to your .env file as STRIPE_WEBHOOK_SECRET

4. **Configure Webhook in Stripe Dashboard**
   1. Go to Stripe Dashboard > Developers > Webhooks
   2. Click "Add endpoint"
   3. Add your production endpoint URL (e.g., https://your-domain.com/api/webhooks/stripe)
   4. Select events to listen for:
      - payment_intent.succeeded
      - payment_intent.payment_failed

5. **Test Webhook**
   ```bash
   stripe trigger payment_intent.succeeded
   ```
   - This simulates a successful payment event
   - You should see the webhook being received in your terminal
   - Check your database to confirm the pledge status updates

6. **Production Setup**
   - In Stripe Dashboard > Webhooks
   - Copy the "Signing secret" for your endpoint
   - Add this secret to your production environment variables as STRIPE_WEBHOOK_SECRET

Note: Keep the Stripe CLI running with the webhook forwarding while testing locally. The webhook signing secret from the CLI is different from your production webhook secret.