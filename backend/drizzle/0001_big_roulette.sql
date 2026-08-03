CREATE TYPE "public"."order_from" AS ENUM('Ecommerce', 'Manual');--> statement-breakpoint
ALTER TYPE "public"."order_status" ADD VALUE 'Delivered';--> statement-breakpoint
ALTER TABLE "ecom_orders" ADD COLUMN "order_from" "order_from" DEFAULT 'Ecommerce' NOT NULL;--> statement-breakpoint
ALTER TABLE "ecom_orders" ADD COLUMN "ordered_by" varchar;