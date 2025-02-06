# Pledge System Implementation Update

## Objective
Implement a robust pledge system that records successful pledges in the "Pledges" table, ensuring all necessary data is captured and handled appropriately.

## Files to Modify

1. **Checkout API Route (`frontend/src/app/api/checkout/route.ts`):**
   - Add a new endpoint to handle successful Stripe webhook notifications.
   - Insert pledge data into the "Pledges" table upon successful payment confirmation.

2. **PledgeOptions Component (`frontend/src/components/projects/project-details/pledge-options.tsx`):**
   - Enhance error handling and user feedback.
   - Ensure proper redirect handling after checkout.

3. **Utility Function (`frontend/src/lib/supabase/server/pledge.ts`):**
   - Create a function to create a new pledge record in the "Pledges" table.

4. **Stripe Webhook Handling:**
   - Implement a new API route to listen for Stripe webhook events.
   - Verify the webhook signature.
   - Update the pledge status in the database based on the webhook event.

5. **Project Page (`frontend/src/app/(public)/companies/[slug]/projects/[id]/page.tsx`):**
   - Display a confirmation message after a successful pledge.
   - Show a list of recent pledges.

6. **TypeScript Types (`frontend/src/types/generated/database.ts`):**
   - Ensure the "Pledges" table schema is correctly defined.

## Implementation Steps

1. **Update the Checkout API Route:**
   - Add error handling for pledge registration.
   - Insert pledge data into the "Pledges" table upon successful checkout.

2. **Modify the PledgeOptions Component:**
   - Improve error messages for better user experience.
   - Ensure redirects work correctly after checkout.

3. **Create Utility Function:**
   - Write a function to handle pledge creation in Supabase.

4. **Implement Webhook Handling:**
   - Set up a new API endpoint for Stripe webhooks.
   - Verify webhook signatures.
   - Update pledge status based on webhook events.

5. **Update Project Page:**
   - Add UI elements to show pledge confirmation and recent pledges.

6. **Review TypeScript Types:**
   - Ensure all fields in the "Pledges" table are correctly typed.

## Next Steps
Would you like me to proceed with implementing these changes? I can start with the first file and get your feedback before moving to the next.