-- Add new cart position option: below_price
-- This will display the button inside the card, below the price

-- Drop the old constraint
ALTER TABLE public.catalog_display_settings 
DROP CONSTRAINT IF EXISTS catalog_display_settings_cart_position_check;

-- Add new constraint with below_price option
ALTER TABLE public.catalog_display_settings 
ADD CONSTRAINT catalog_display_settings_cart_position_check 
CHECK (cart_position IN ('on_card', 'below_card', 'below_price'));