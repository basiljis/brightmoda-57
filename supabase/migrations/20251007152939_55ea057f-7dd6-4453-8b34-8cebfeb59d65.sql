-- Add carousel settings to header_collections table
ALTER TABLE header_collections
ADD COLUMN IF NOT EXISTS desktop_display_mode text DEFAULT 'two' CHECK (desktop_display_mode IN ('one', 'two')),
ADD COLUMN IF NOT EXISTS autoplay_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS autoplay_speed text DEFAULT 'medium' CHECK (autoplay_speed IN ('slow', 'medium', 'fast'));

-- Add comment for clarity
COMMENT ON COLUMN header_collections.desktop_display_mode IS 'Display mode for desktop: one or two images';
COMMENT ON COLUMN header_collections.autoplay_enabled IS 'Enable automatic carousel rotation when more than 2 images';
COMMENT ON COLUMN header_collections.autoplay_speed IS 'Speed of automatic rotation: slow (8s), medium (5s), fast (3s)';