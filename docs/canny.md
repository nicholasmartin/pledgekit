# Canny Integration Guide (Simplified)

## Overview
This guide outlines a streamlined approach for integrating Canny.io with PledgeKit. The integration allows companies to view and manage their Canny feature requests within PledgeKit.

## Database Structure
We use the existing tables:

```sql
-- company_settings table (existing)
-- Stores Canny API credentials
company_settings {
  id: uuid
  company_id: uuid
  canny_api_key: text
  created_at: timestamp
  updated_at: timestamp
}

-- canny_posts table (existing)
-- Stores synced Canny feature requests
canny_posts {
  id: uuid
  company_id: uuid
  canny_post_id: text
  title: text
  details: text
  status: text
  score: integer
  comment_count: integer
  author_name: text
  url: text
  created_at: timestamp
  last_synced_at: timestamp
  board_id: text
}
```

## Implementation Steps

### 1. API Integration (Backend)
- [ ] Create API endpoints
  ```typescript
  // List Posts with pagination
  GET /api/canny/posts?page=1&limit=25
  
  // Sync posts manually
  POST /api/canny/sync
  
  // Get boards
  GET /api/canny/boards
  ```
- [ ] Implement error handling and rate limiting
- [ ] Add request validation

### 2. Post Synchronization
- [ ] Implement manual sync endpoint
  - Fetch all posts from Canny API
  - Update local database
  - Update last_synced_at timestamp
- [ ] Add sync status indicators
- [ ] Implement proper error handling

### 3. Feature Requests UI
- [ ] Create feature requests list page
  - Display posts in a table view
  - Add pagination controls
  - Show sync status and last sync time
- [ ] Implement filtering
  - Filter by board
  - Filter by status
  - Sort by score/comments/date
- [ ] Add manual sync button
- [ ] Show loading states and error messages

### 4. Performance Optimizations
- [ ] Implement client-side caching using SWR
  ```typescript
  // Example SWR configuration
  const { data, error } = useSWR(
    `/api/canny/posts?page=${page}&limit=25`,
    fetcher,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 60000,
    }
  )
  ```
- [ ] Add proper loading states
- [ ] Implement optimistic updates

## API Implementation Details

### Post List Endpoint
```typescript
// /api/canny/posts route
export async function GET(request: Request) {
  const { page = 1, limit = 25, boards = [], statuses = [] } = request.query
  const offset = (page - 1) * limit

  // Build query
  let query = supabase
    .from('canny_posts')
    .select('*')
    
  // Apply board filters if specified
  if (boards.length > 0) {
    query = query.in('board_id', boards)
  }
  
  // Apply status filters if specified
  if (statuses.length > 0) {
    query = query.in('status', statuses)
  }

  // Apply pagination
  const { data: posts, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return NextResponse.json({ posts, error })
}
```

### Manual Sync Endpoint
```typescript
// /api/canny/sync route
export async function POST(request: Request) {
  // Get company's Canny API key
  const { data: settings } = await supabase
    .from('company_settings')
    .select('canny_api_key')
    .single()

  // Fetch posts from Canny
  const cannyPosts = await fetchCannyPosts(settings.canny_api_key)

  // Update local database
  const { error } = await supabase
    .from('canny_posts')
    .upsert(cannyPosts, { onConflict: 'canny_post_id' })

  return NextResponse.json({ success: !error, error })
}
```

## Frontend Implementation

### Feature Requests Page
```typescript
// Key components needed
interface FeatureRequestsPage {
  // Pagination state
  const [page, setPage] = useState(1)
  
  // Filter state
  const [selectedBoards, setSelectedBoards] = useState<string[]>([])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([])
  
  // Get boards for filter UI
  const { data: boards } = useSWR('/api/canny/boards', fetcher)
  
  // Get posts with filters
  const { data, error, mutate } = useSWR(
    `/api/canny/posts?page=${page}&limit=25&boards=${selectedBoards.join(',')}&statuses=${selectedStatuses.join(',')}`,
    fetcher
  )

  // Calculate post counts for boards
  const getPostCountForBoard = (boardId: string) => {
    return data?.posts.filter(post => post.board.id === boardId).length ?? 0
  }

  // Calculate post counts for statuses (from selected boards)
  const getPostCountForStatus = (status: string) => {
    let filteredPosts = data?.posts ?? []
    if (selectedBoards.length > 0) {
      filteredPosts = filteredPosts.filter(post => selectedBoards.includes(post.board.id))
    }
    return filteredPosts.filter(post => post.status.toLowerCase() === status.toLowerCase()).length
  }

  // Manual sync function
  const syncPosts = async () => {
    await fetch('/api/canny/sync', { method: 'POST' })
    mutate()
  }

  return (
    <div>
      {/* Filters UI */}
      <div>
        {/* Board filters with post counts */}
        {boards?.map(board => (
          <div key={board.id}>
            <Checkbox
              checked={selectedBoards.includes(board.id)}
              onChange={() => toggleBoard(board.id)}
            />
            <span>{board.name}</span>
            <span>{getPostCountForBoard(board.id)}</span>
          </div>
        ))}

        {/* Status filters with post counts */}
        {CANNY_STATUSES.map(status => (
          <div key={status.value}>
            <Checkbox
              checked={selectedStatuses.includes(status.value)}
              onChange={() => toggleStatus(status.value)}
            />
            <span>{status.label}</span>
            <span>{getPostCountForStatus(status.value)}</span>
          </div>
        ))}
      </div>

      {/* Posts table */}
      <Table>
        {/* ... table implementation ... */}
      </Table>
    </div>
  )
}
```

## Error Handling
1. Handle common errors:
   - Invalid/expired API key
   - Network timeouts
   - Rate limiting
2. Show appropriate error messages to users
3. Implement retry logic where appropriate

## Best Practices
1. Always use pagination for post lists
2. Cache responses on the client side
3. Show loading states during sync
4. Validate API key before saving
5. Handle errors gracefully with user feedback
6. Maintain accurate post counts for filters
7. Update filter counts when posts are synced

## Security Considerations
1. Store API keys securely
2. Validate user permissions
3. Rate limit API requests
4. Sanitize all data

## Next Steps
After implementing these basic features, consider:
1. Adding automatic periodic sync
2. Implementing real-time updates
3. Adding more detailed post views
4. Enhancing search capabilities
