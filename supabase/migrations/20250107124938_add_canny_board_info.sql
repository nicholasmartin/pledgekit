-- Add board information to canny_posts table
ALTER TABLE canny_posts
ADD COLUMN board_id TEXT,
ADD COLUMN board_name TEXT;

-- Add index for board_id for better query performance
CREATE INDEX idx_canny_posts_board_id ON canny_posts(board_id);

-- Add canny_boards table to track all boards
CREATE TABLE IF NOT EXISTS canny_boards (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  canny_board_id TEXT NOT NULL,
  name TEXT NOT NULL,
  post_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_synced_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  UNIQUE(company_id, canny_board_id)
);

-- Add indexes for canny_boards
CREATE INDEX idx_canny_boards_company_id ON canny_boards(company_id);
