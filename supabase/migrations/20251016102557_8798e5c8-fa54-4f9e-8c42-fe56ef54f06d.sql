-- Remove old check constraint and add new one with 'collection_card' type
ALTER TABLE home_page_blocks 
DROP CONSTRAINT IF EXISTS home_page_blocks_block_type_check;

ALTER TABLE home_page_blocks 
ADD CONSTRAINT home_page_blocks_block_type_check 
CHECK (block_type IN ('catalog', 'catalog_filtered', 'text', 'collection_card'));