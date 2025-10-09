-- Add parent_id column to page_content for menu hierarchy
ALTER TABLE page_content
ADD COLUMN parent_id UUID REFERENCES page_content(id) ON DELETE CASCADE;