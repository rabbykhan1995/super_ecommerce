ALTER TABLE "products" ADD COLUMN "thumbnail_file_id" text;--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "image_file_ids" jsonb DEFAULT '[]'::jsonb;