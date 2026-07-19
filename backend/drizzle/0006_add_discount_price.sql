-- Add discount_price column to variants table
ALTER TABLE "variants"
ADD COLUMN "discount_price" numeric(12,2);

-- Add discount_price column to products table
ALTER TABLE "products"
ADD COLUMN "discount_price" numeric(12,2);
