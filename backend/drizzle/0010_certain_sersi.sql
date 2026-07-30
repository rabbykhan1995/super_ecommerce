CREATE TYPE "public"."order_status" AS ENUM('pending', 'confirm', 'parcel', 'shipped', 'delivered', 'returned', 'cancelled', 'hold');--> statement-breakpoint
ALTER TABLE "parcels" ALTER COLUMN "status" SET DATA TYPE "public"."parcel_status";--> statement-breakpoint
ALTER TABLE "parcels" ALTER COLUMN "status" SET DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "ecom_orders" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."order_status";--> statement-breakpoint
ALTER TABLE "ecom_orders" ALTER COLUMN "status" SET DATA TYPE "public"."order_status" USING "status"::"public"."order_status";