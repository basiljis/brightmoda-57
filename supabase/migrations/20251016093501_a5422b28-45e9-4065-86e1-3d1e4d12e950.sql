-- Add "Show More" button settings to home_page_blocks
ALTER TABLE public.home_page_blocks 
ADD COLUMN show_more_button boolean DEFAULT false,
ADD COLUMN show_more_text text DEFAULT 'Показать еще',
ADD COLUMN show_more_link text;