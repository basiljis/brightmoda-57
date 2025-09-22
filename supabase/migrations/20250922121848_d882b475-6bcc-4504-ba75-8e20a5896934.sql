-- Add is_active field to products table for hiding products
ALTER TABLE public.products ADD COLUMN is_active boolean NOT NULL DEFAULT true;