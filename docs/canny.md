# Canny Integration Documentation

## Overview
This document outlines the implementation of Canny.io integration with PledgeKit. The integration enables companies to synchronize and manage their Canny feature requests within PledgeKit.

## Database Structure

### Core Tables

```sql
-- Stores synced Canny feature requests
CREATE TABLE canny_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  canny_post_id TEXT NOT NULL,
  title TEXT NOT NULL,
  details TEXT,
  status TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  comment_count INTEGER NOT NULL DEFAULT 0,
  author_name TEXT,
  url TEXT,
  board_id TEXT,
  board_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  UNIQUE(company_id, canny_post_id)
);

-- Tracks Canny boards and their metadata
CREATE TABLE canny_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  canny_board_id TEXT NOT NULL,
  name TEXT NOT NULL,
  post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(company_id, canny_board_id)
);

-- Tracks synchronization operations
CREATE TABLE canny_sync_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  error_message TEXT,
  records_synced INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### Performance Indexes
```sql
-- Canny Posts indexes
CREATE INDEX idx_canny_posts_company_id ON canny_posts(company_id);
CREATE INDEX idx_canny_posts_project_id ON canny_posts(project_id);
CREATE INDEX idx_canny_posts_status ON canny_posts(status);
CREATE INDEX idx_canny_posts_score ON canny_posts(score);
CREATE INDEX idx_canny_posts_board_id ON canny_posts(board_id);

-- Canny Boards indexes
CREATE INDEX idx_canny_boards_company_id ON canny_boards(company_id);

-- Sync Logs indexes
CREATE INDEX idx_canny_sync_logs_company_id ON canny_sync_logs(company_id);
CREATE INDEX idx_canny_sync_logs_created_at ON canny_sync_logs(created_at);
```

### Row Level Security (RLS)
All tables have RLS enabled with the following policies:

#### Canny Posts
- View: Company members can view their company's posts
- Insert/Update/Delete: Limited to company admins and owners

#### Canny Boards
- View: Company members can view their company's boards
- Insert/Update/Delete: Limited to company admins and owners

#### Sync Logs
- View: Company members can view their company's sync logs
- Insert/Update/Delete: Limited to company admins and owners

## Post Synchronization

### Manual Sync Process
1. Company admin triggers sync via UI button
2. System checks rate limit (100 requests/minute global limit)
3. Creates sync log entry with "in_progress" status
4. Fetches and syncs boards first
5. Fetches all posts using pagination (100 posts per request)
6. Updates sync log with progress
7. Upserts posts to local database
8. Updates sync log with final status

### Rate Limiting
- Global limit: 100 requests per minute
- Implemented using `limiter` package
- Applies to all companies collectively
- Returns 429 status when limit exceeded

## Feature Requests Page

### Data Fetching Strategy
- Uses SWR for data fetching and caching
- Different cache intervals:
  - Boards: 60 seconds
  - Posts: 30 seconds
- Cache-Control headers:
  - 5 minutes max age
  - 1 hour stale-while-revalidate

### Board Filters
- Shows all boards for company
- Displays total post count per board
- Post counts are static and don't change with filters
- Multiple board selection supported

### Status Filters
- Available statuses: open, under review, planned, in progress, complete, closed
- Post counts:
  - Update only when Board selections change
  - Remain visible when Status is deselected
  - Don't change based on Status filter selections
- Multiple status selection supported

### Sorting
- Available sort fields: score, commentCount, created
- Sort directions: ascending, descending
- Default: score descending
