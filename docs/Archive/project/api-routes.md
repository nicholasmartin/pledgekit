# PledgeKit API Routes Documentation

## Overview
This document outlines the API routes available in PledgeKit, including authentication requirements, rate limits, and response formats.

## Authentication
All protected routes require a valid session token. Authentication is handled via Supabase auth middleware.

### Error Responses
Common error response format:
```json
{
  "error": "Error message describing what went wrong"
}
```

HTTP Status Codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting
Rate limits are enforced on all API routes:
- Auth operations: 5 requests per hour
- Protected routes: 30 requests per minute
- Payment operations: 5 requests per 5 minutes

When rate limited, responses include a `Retry-After` header indicating seconds until next allowed request.

## API Routes

### User Routes

#### GET /api/user
Fetches current user's details.

**Authentication Required**: Yes  
**Rate Limit**: 30 requests per minute

**Response (200)**:
```json
{
  "id": "user_id",
  "email": "user@example.com",
  "user_metadata": {
    "user_type": "company|user"
  }
  // ... other user fields
}
```

#### PATCH /api/user
Updates current user's details.

**Authentication Required**: Yes  
**Rate Limit**: 10 requests per minute

**Request Body**:
```json
{
  "field_to_update": "new_value"
}
```

**Response (200)**:
```json
{
  "id": "user_id",
  // ... updated user fields
}
```

### Payment Routes

#### POST /api/checkout
Creates a new checkout session for pledges.

**Authentication Required**: Yes  
**Rate Limit**: 5 requests per 5 minutes

**Request Body**:
```json
{
  "featureId": "feature_id",
  "amount": 1000 // Amount in cents
}
```

**Response (200)**:
```json
{
  "sessionId": "stripe_session_id"
}
```

### Auth Routes

#### GET /auth/confirm
Handles email confirmation and password reset confirmations.

**Authentication Required**: No  
**Rate Limit**: 5 requests per hour

**Query Parameters**:
- `token_hash`: Verification token
- `type`: "signup" | "recovery"

**Success**: Redirects to appropriate page
- Signup: `/login?emailVerified=true`
- Recovery: `/reset-password`

**Error**: Redirects to `/auth/auth-error` with error message

## Error Handling

### Common Error Scenarios

1. **Authentication Errors**
```json
{
  "error": "Unauthorized"
}
```

2. **Rate Limiting**
```json
{
  "error": "Too many requests"
}
```
Headers:
```
Retry-After: 3600
```

3. **Validation Errors**
```json
{
  "error": "Missing required fields"
}
```

### Best Practices
1. Always check HTTP status codes
2. Handle rate limiting by respecting Retry-After header
3. Implement exponential backoff for retries
4. Log error responses for debugging

## Changes from Previous Version

### New Features
1. Unified error response format
2. Rate limiting on all routes
3. Improved type safety
4. Better session validation

### Breaking Changes
1. Error response format standardized
2. Rate limits enforced
3. Some endpoints require authentication that didn't before
4. Stricter input validation

## Migration Guide

### For Frontend Developers
1. Update error handling to use new format
2. Implement rate limit handling
3. Add authentication headers to all protected routes
4. Update types to match new response formats

### For Backend Developers
1. Use `createRouteHandlerClient` for new routes
2. Implement rate limiting
3. Follow standardized error format
4. Add proper session validation
