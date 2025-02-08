# Pledge System Improvements

## Current Issues
1. Users can make multiple pledges for the same project/pledge option combination
2. Payment Intent ID handling in webhook is unreliable
3. UI doesn't reflect user's existing pledges
4. No database constraints preventing duplicate pledges

## Required Changes

### 1. Database Updates
- Add unique constraint to pledges table:
  ```sql
  ALTER TABLE public.pledges
  ADD CONSTRAINT unique_user_project_pledge
  UNIQUE (user_id, project_id, pledge_option_id);
  ```
- This prevents multiple pledges from the same user for the same project/pledge option

### 2. Stripe Integration
- Remove payment_intent_id from initial pledge creation
- Update webhook handler to use Stripe metadata for pledge lookup:
  ```typescript
  // Use metadata from payment intent
  const { projectId, pledgeOptionId, userId } = paymentIntent.metadata;
  const pledge = await getPledgeByMetadata(userId, projectId, pledgeOptionId);
  ```
- Add error handling for duplicate pledge attempts
- Add proper error messages for failed pledge creations

### 3. UI/UX Updates
- Update project page to show different states:
  - "Pledge Now" button for new pledges
  - "Your Current Pledge: $X (Status: Y)" for existing pledges
  - Disable pledge options where user already has a pledge
- Add loading states during pledge creation
- Show proper error messages for failed pledges
- Add success/confirmation messages for completed pledges

### 4. Backend API Changes
- Create new function to get user's existing pledges for a project:
  ```typescript
  async function getUserProjectPledges(userId: string, projectId: string) {
    // Return all pledges for this user/project combination
  }
  ```
- Add pledge status check before allowing new pledges
- Handle concurrent pledge attempts gracefully
- Add proper error responses for duplicate pledge attempts

### 5. Frontend Components
- Create or edit PledgeStatus components to show current pledge status
- Update PledgeOption component to handle disabled state
- Add proper loading and error states
- Show confirmation messages after successful pledges

### 6. Testing Requirements
- Test duplicate pledge prevention
- Test concurrent pledge attempts
- Test webhook handling with various Stripe events
- Test UI states for different pledge statuses
- Test error handling and user feedback

## Implementation Steps

1. Database Migration
   - Create migration for unique constraint
   - Update RLS policies if needed
   - Test constraint with existing data

2. Backend Updates
   - Update pledge creation logic
   - Modify webhook handler
   - Add new API endpoints for pledge status
   - Add proper error handling

3. Frontend Updates
   - Update project page layout
   - Add new components for pledge status
   - Implement proper loading states
   - Add error handling and user feedback

4. Testing
   - Test all new functionality
   - Verify constraint enforcement
   - Test UI for all possible states
   - Verify webhook handling

## Security Considerations
- Ensure RLS policies properly restrict access
- Validate all user input
- Handle concurrent requests safely
- Protect against race conditions
- Properly handle sensitive payment data

## Future Improvements
- Add pledge history view
- Implement pledge modification functionality
- Add pledge cancellation feature
- Improve error reporting and monitoring
- Add analytics for pledge patterns