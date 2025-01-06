# Canny Integration Implementation Guide

## Overview
This document outlines the implementation strategy for integrating Canny.io with PledgeKit. The integration allows companies to import their feature requests from Canny and convert them into crowdfunding projects. This enables companies to validate and fund their most requested features through PledgeKit's platform.

## Database Schema

### Existing Tables Used
```sql
-- company_members table (existing)
-- Used for authentication and company relationship
company_members {
  id: uuid
  company_id: uuid
  user_id: uuid
  role: text (owner, admin, member)
}

-- company_settings table (existing)
-- Stores Canny API credentials
company_settings {
  id: uuid
  company_id: uuid
  canny_api_key: text
  created_at: timestamp
  updated_at: timestamp
}

-- projects table (existing)
-- Where Canny feature requests can be converted to projects
projects {
  id: uuid
  company_id: uuid
  title: text
  description: text
  goal: numeric
  status: text
  // ... other existing fields
}
```

### New Tables Required
```sql
-- canny_posts table (new)
-- Stores synced Canny feature requests
CREATE TABLE canny_posts (
  id: uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id: uuid REFERENCES companies(id),
  canny_post_id: text UNIQUE,
  title: text,
  details: text,
  status: text,
  score: integer,
  comment_count: integer,
  author_name: text,
  created_at: timestamp,
  last_synced_at: timestamp,
  project_id: uuid REFERENCES projects(id) NULL
);

-- canny_sync_logs table (new)
-- Tracks sync history and errors
CREATE TABLE canny_sync_logs (
  id: uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id: uuid REFERENCES companies(id),
  status: text,
  error_message: text NULL,
  records_synced: integer,
  created_at: timestamp DEFAULT NOW()
);
```

## Implementation Steps

### 1. Settings Integration
- [x] Add Canny API key field to company settings
- [x] Create settings UI for managing Canny integration
- [x] Implement secure API key storage
- [x] Add validation for API key format

### 2. Database Setup
- [ ] Create canny_posts table migration
- [ ] Create canny_sync_logs table migration
- [ ] Add necessary indexes for performance
- [ ] Set up RLS policies for security

### 3. API Integration Layer
- [x] Create API route for proxying Canny requests
- [ ] Implement error handling and rate limiting
- [ ] Add request caching for performance
- [ ] Set up periodic background sync

### 4. Feature Request UI
- [x] Create feature requests list page
- [ ] Add filtering and sorting capabilities
- [ ] Implement search functionality
- [ ] Add pagination support

### 5. Project Conversion
- [ ] Add "Convert to Project" functionality
- [ ] Create project conversion form
- [ ] Implement bulk conversion for multiple posts
- [ ] Add bidirectional sync for updates

### 6. Sync Management
- [ ] Create sync status dashboard
- [ ] Implement manual sync trigger
- [ ] Add sync error reporting
- [ ] Create sync history view

## API Integration Details

### Canny API Endpoints Used
```typescript
// List Posts
POST https://canny.io/api/v1/posts/list
{
  apiKey: string
}

// Get Post Details
POST https://canny.io/api/v1/posts/retrieve
{
  apiKey: string,
  id: string
}
```

### Implementation Guidelines
1. All Canny API calls should be made server-side
2. Implement proper error handling and retry logic
3. Cache responses to minimize API usage
4. Use background jobs for syncing
5. Maintain audit logs for all operations

## Security Considerations
1. Store API keys securely in company_settings
2. Implement RLS policies for all new tables
3. Validate user permissions for all operations
4. Sanitize and validate all imported data
5. Rate limit API requests

## Error Handling
1. Invalid API key errors
2. Network timeout handling
3. Rate limit exceeded handling
4. Data validation errors
5. Sync conflict resolution

## Testing Strategy
1. Unit tests for API integration
2. Integration tests for sync process
3. UI component testing
4. Error scenario testing
5. Performance testing

## Monitoring and Maintenance
1. Sync status monitoring
2. Error rate tracking
3. API usage monitoring
4. Performance metrics
5. Data consistency checks

## Future Enhancements
1. Real-time updates via webhooks
2. Advanced filtering options
3. Custom field mapping
4. Automated project suggestions
5. Analytics integration

## Development Phases

### Phase 1: Core Integration
- Basic API integration
- Essential UI components
- Initial database setup

### Phase 2: Enhanced Features
- Advanced filtering
- Bulk operations
- Improved sync process

### Phase 3: Optimization
- Performance improvements
- Advanced analytics
- Extended customization options
