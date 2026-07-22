CREATE TABLE "ecom_order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"product_name" varchar(255) NOT NULL,
	"variant_attrs" jsonb,
	"thumbnail" text,
	"sale_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"discount_price" numeric(12, 2),
	"quantity" numeric(10, 2) DEFAULT 1 NOT NULL,
	"line_total" numeric(12, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ecom_orders" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"sale_id" integer,
	"order_no" varchar(50) NOT NULL,
	"status" varchar(30) DEFAULT 'pending' NOT NULL,
	"subtotal" numeric(12, 2) DEFAULT 0 NOT NULL,
	"shipping_cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"discount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"payment_method" varchar(30),
	"payment_status" varchar(20) DEFAULT 'unpaid' NOT NULL,
	"stripe_session_id" varchar(255),
	"stripe_payment_intent" varchar(255),
	"paid_at" timestamp with time zone,
	"shipping_name" varchar(255) NOT NULL,
	"shipping_phone" varchar(20) NOT NULL,
	"shipping_address" text NOT NULL,
	"shipping_city" varchar(100),
	"shipping_area" varchar(100),
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "ecom_orders_order_no_unique" UNIQUE("order_no")
);
--> statement-breakpoint
ALTER TABLE "carts" ADD COLUMN "discount_price" numeric(12, 2);--> statement-breakpoint
ALTER TABLE "ecom_order_items" ADD CONSTRAINT "ecom_order_items_order_id_ecom_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."ecom_orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecom_order_items" ADD CONSTRAINT "ecom_order_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecom_order_items" ADD CONSTRAINT "ecom_order_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecom_orders" ADD CONSTRAINT "ecom_orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ecom_orders" ADD CONSTRAINT "ecom_orders_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;