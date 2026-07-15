ALTER TABLE "products" ALTER COLUMN "average_rating" SET DATA TYPE numeric(12, 2);--> statement-breakpoint
ALTER TABLE "batches" ALTER COLUMN "warranty" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "variants" ADD COLUMN "images" jsonb DEFAULT '[]'::jsonb;