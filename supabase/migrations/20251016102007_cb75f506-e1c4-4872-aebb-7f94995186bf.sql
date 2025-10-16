-- Add 'collection_card' as a new block type option
-- The block_type column already exists, we just need to document that 'collection_card' is now a valid value
-- Add a new column to store collection card display style if needed in the future
ALTER TABLE home_page_blocks 
ADD COLUMN IF NOT EXISTS collection_card_style text DEFAULT 'default';

COMMENT ON COLUMN home_page_blocks.block_type IS 'Block type: catalog, catalog_filtered, text, or collection_card';
COMMENT ON COLUMN home_page_blocks.collection_card_style IS 'Display style for collection card blocks';