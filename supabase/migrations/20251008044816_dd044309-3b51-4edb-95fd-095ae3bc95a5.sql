-- Remove the CHECK constraint that limits position to only 1 or 2
-- This allows adding more than 2 header collections for carousel functionality

ALTER TABLE public.header_collections 
DROP CONSTRAINT IF EXISTS header_collections_position_check;

-- Add a more flexible constraint that only ensures position is positive
ALTER TABLE public.header_collections 
ADD CONSTRAINT header_collections_position_positive CHECK (position > 0);