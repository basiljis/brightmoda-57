-- Add settings for show more button size and type
ALTER TABLE home_page_blocks 
ADD COLUMN show_more_button_size text DEFAULT 'medium',
ADD COLUMN show_more_button_type text DEFAULT 'text';