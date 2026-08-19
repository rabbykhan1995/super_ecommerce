CREATE TABLE "sale_quotation_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"quotation_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"batch_id" integer,
	"sold_qty" numeric(12, 2) DEFAULT 0 NOT NULL,
	"sale_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"warranty" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sale_quotations" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_date" timestamp with time zone DEFAULT now() NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"customer_id" integer,
	"note" varchar(1000),
	"cost_name" varchar(255),
	"total_product_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"other_cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"discount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"balance_before" numeric(12, 2) DEFAULT 0 NOT NULL,
	"balance_after" numeric(12, 2) DEFAULT 0 NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"is_deleted" boolean DEFAULT false NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "sale_quotation_items" ADD CONSTRAINT "sale_quotation_items_quotation_id_sale_quotations_id_fk" FOREIGN KEY ("quotation_id") REFERENCES "public"."sale_quotations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_quotation_items" ADD CONSTRAINT "sale_quotation_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_quotation_items" ADD CONSTRAINT "sale_quotation_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_quotation_items" ADD CONSTRAINT "sale_quotation_items_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_quotations" ADD CONSTRAINT "sale_quotations_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;