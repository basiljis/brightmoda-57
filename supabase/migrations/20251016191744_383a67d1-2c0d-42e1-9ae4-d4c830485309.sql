-- Add collection_ids column to home_page_blocks table (for multiple collections in collection_card block)
ALTER TABLE home_page_blocks 
ADD COLUMN IF NOT EXISTS collection_ids TEXT[];

-- Add spacer_size column to home_page_blocks table (for spacer block height)
ALTER TABLE home_page_blocks 
ADD COLUMN IF NOT EXISTS spacer_size INTEGER;