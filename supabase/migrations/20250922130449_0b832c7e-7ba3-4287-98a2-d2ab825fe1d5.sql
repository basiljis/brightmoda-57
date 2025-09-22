-- Add additional product info fields
ALTER TABLE products 
ADD COLUMN size_fit_info text,
ADD COLUMN composition_care_info text, 
ADD COLUMN responsibility_info text,
ADD COLUMN delivery_return_info text;

-- Add size chart field to categories
ALTER TABLE categories
ADD COLUMN size_chart_image_url text;