CREATE TYPE "public"."tx_source" AS ENUM('purchase', 'purchase_return', 'sale', 'sale_return', 'expense', 'warranty', 'balance_transfer', 'deposit', 'withdraw');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('credit', 'debit');--> statement-breakpoint
CREATE TYPE "public"."contact_type" AS ENUM('customer', 'supplier', 'both');--> statement-breakpoint
CREATE TYPE "public"."stock_flow_reference_type" AS ENUM('purchase', 'purchase_return', 'sale', 'sale_return', 'damage', 'adjustment', 'opening_stock', 'stock_transfer');--> statement-breakpoint
CREATE TYPE "public"."stock_flow_type" AS ENUM('in', 'out');--> statement-breakpoint
CREATE TYPE "public"."supplier_action" AS ENUM('repaired', 'replaced', 'rejected', 'refunded');--> statement-breakpoint
CREATE TYPE "public"."warranty_status" AS ENUM('sold', 'claimed', 'sent_to_supplier', 'received_from_supplier', 'repaired', 'replaced', 'rejected', 'returned_to_customer', 'refunded');--> statement-breakpoint
CREATE SEQUENCE "public"."sale_invoice_no_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 100001 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."variant_barcode_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 100001 CACHE 1;--> statement-breakpoint
CREATE SEQUENCE "public"."purchase_invoice_no_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 100001 CACHE 1;--> statement-breakpoint
CREATE TABLE "brands" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "brands_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "categories_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "units" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "units_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tx_no" varchar(36) NOT NULL,
	"account_id" integer NOT NULL,
	"amount" integer DEFAULT 0,
	"source" "tx_source" NOT NULL,
	"type" "tx_type" DEFAULT 'credit' NOT NULL,
	"purchase_id" integer,
	"sale_id" integer,
	"purchase_return_id" integer,
	"sale_return_id" integer,
	"balance_transfer_id" integer,
	"warranty_id" integer,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "transactions_tx_no_unique" UNIQUE("tx_no")
);
--> statement-breakpoint
CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"branch" varchar(100) DEFAULT '',
	"balance" integer DEFAULT 0 NOT NULL,
	"number" varchar(50) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "balance_transfer" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_account_id" integer NOT NULL,
	"to_account_id" integer NOT NULL,
	"amount" integer DEFAULT 0,
	"date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sales" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_date" timestamp with time zone DEFAULT now() NOT NULL,
	"invoice_no" integer DEFAULT nextval('sale_invoice_no_seq') NOT NULL,
	"customer_id" integer,
	"note" text,
	"cost_name" varchar(255),
	"deletable" boolean DEFAULT true NOT NULL,
	"total_product_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"other_cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"discount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"paid" numeric(12, 2) DEFAULT 0 NOT NULL,
	"exchange_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"balance_before" numeric(12, 2) DEFAULT 0 NOT NULL,
	"balance_after" numeric(12, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sales_invoice_no_unique" UNIQUE("invoice_no")
);
--> statement-breakpoint
CREATE TABLE "sale_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"sold_qty" numeric(10, 2) DEFAULT 0 NOT NULL,
	"sale_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"warranty" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contacts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"email" varchar(150),
	"mobile" varchar(20) NOT NULL,
	"balance" numeric(12, 2) DEFAULT 0 NOT NULL,
	"address" text,
	"type" "contact_type" DEFAULT 'customer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(150) NOT NULL,
	"slug" varchar(300) NOT NULL,
	"description" text,
	"short_description" text,
	"meta_title" varchar(300),
	"meta_description" text,
	"keywords" text[] DEFAULT '{}',
	"brand_id" integer,
	"unit_id" integer NOT NULL,
	"category_id" integer,
	"manage_stock" boolean DEFAULT true NOT NULL,
	"manage_warranty" boolean DEFAULT false NOT NULL,
	"thumbnail" text,
	"video" text,
	"stock" numeric(12, 3) DEFAULT 0 NOT NULL,
	"total_sold" numeric DEFAULT '0' NOT NULL,
	"alert_qty" numeric(18, 3) DEFAULT 0 NOT NULL,
	"decimal" boolean DEFAULT false NOT NULL,
	"purchase_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"sale_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"in_pos_list" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"sku" varchar(100),
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"show_stock" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"average_rating" numeric DEFAULT '0' NOT NULL,
	"total_reviews" integer DEFAULT 0 NOT NULL,
	CONSTRAINT "products_slug_unique" UNIQUE("slug"),
	CONSTRAINT "products_sku_unique" UNIQUE("sku")
);
--> statement-breakpoint
CREATE TABLE "variants" (
	"id" serial PRIMARY KEY NOT NULL,
	"product_id" integer NOT NULL,
	"sale_price" numeric(12, 2) DEFAULT 0,
	"stock" numeric(12, 2) DEFAULT 0,
	"barcode" varchar(50) DEFAULT 'VAR-' || nextval('variant_barcode_seq') NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"weight" numeric(12, 4) DEFAULT 0,
	"attributes" jsonb DEFAULT '[{"name":"base","value":"none"}]'::jsonb NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "variants_barcode_unique" UNIQUE("barcode")
);
--> statement-breakpoint
CREATE TABLE "batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"serial" varchar,
	"product_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"purchase_id" integer,
	"cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"purchased_qty" numeric(12, 2) DEFAULT 0 NOT NULL,
	"remaining_qty" numeric(12, 2) DEFAULT 0 NOT NULL,
	"purchase_date" timestamp with time zone DEFAULT now() NOT NULL,
	"expire_date" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "batches_serial_unique" UNIQUE("serial")
);
--> statement-breakpoint
CREATE TABLE "stock_flows" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer,
	"type" "stock_flow_type" NOT NULL,
	"reference_type" "stock_flow_reference_type" NOT NULL,
	"sale_id" integer,
	"purchase_id" integer,
	"sale_return_id" integer,
	"purchase_return_id" integer,
	"qty" numeric(12, 2) DEFAULT 0 NOT NULL,
	"before_qty" numeric(12, 2) DEFAULT 0 NOT NULL,
	"after_qty" numeric(12, 2) DEFAULT 0 NOT NULL,
	"remarks" varchar(255),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_return_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_return_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"purchase_returned_qty" numeric(10, 2) DEFAULT 0 NOT NULL,
	"purchase_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "purchase_returns" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_id" integer NOT NULL,
	"supplier_id" integer NOT NULL,
	"note" text,
	"total_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"paid" numeric(12, 2) DEFAULT 0 NOT NULL,
	"exchange_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"discount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"balance_before" numeric(12, 2) DEFAULT 0 NOT NULL,
	"balance_after" numeric(12, 2) DEFAULT 0 NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"purchase_date" timestamp with time zone DEFAULT now() NOT NULL,
	"invoice_no" integer DEFAULT nextval('purchase_invoice_no_seq') NOT NULL,
	"supplier_id" integer NOT NULL,
	"note" text,
	"cost_name" varchar(255),
	"deletable" boolean DEFAULT true NOT NULL,
	"total_product_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"other_cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"discount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"total_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"paid" numeric(12, 2) DEFAULT 0 NOT NULL,
	"exchange_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"balance_before" numeric(12, 2) DEFAULT 0 NOT NULL,
	"balance_after" numeric(12, 2) DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "purchases_invoice_no_unique" UNIQUE("invoice_no")
);
--> statement-breakpoint
CREATE TABLE "sale_return_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_return_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"product_id" integer NOT NULL,
	"sale_returned_qty" numeric(10, 2) DEFAULT '0' NOT NULL,
	"sale_price" numeric(12, 2) DEFAULT '0' NOT NULL,
	"reason" text
);
--> statement-breakpoint
CREATE TABLE "sale_returns" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"customer_id" integer,
	"note" text,
	"total_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"paid" numeric(12, 2) DEFAULT '0' NOT NULL,
	"discount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"balance_before" numeric(12, 2) DEFAULT '0' NOT NULL,
	"balance_after" numeric(12, 2) DEFAULT '0' NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warranties" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"customer_id" integer,
	"product_id" integer NOT NULL,
	"batch_id" integer NOT NULL,
	"serial" varchar(100),
	"sale_price" numeric(12, 2) DEFAULT 0 NOT NULL,
	"warranty_months" integer DEFAULT 0 NOT NULL,
	"sale_date" timestamp with time zone NOT NULL,
	"expire_date" timestamp with time zone,
	"status" "warranty_status" DEFAULT 'sold' NOT NULL,
	"supplier_action" "supplier_action",
	"claim_date" timestamp with time zone,
	"issue_description" text,
	"supplier_id" integer,
	"sent_date" timestamp with time zone,
	"received_date" timestamp with time zone,
	"supplier_note" text,
	"replaced_serial" varchar(100),
	"replaced_batch_id" integer,
	"refund_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"other_cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"warranty" numeric(4, 2) DEFAULT 0 NOT NULL,
	"resolved_date" timestamp with time zone,
	"note" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_purchase_return_id_purchase_returns_id_fk" FOREIGN KEY ("purchase_return_id") REFERENCES "public"."purchase_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sale_return_id_sale_returns_id_fk" FOREIGN KEY ("sale_return_id") REFERENCES "public"."sale_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_balance_transfer_id_balance_transfer_id_fk" FOREIGN KEY ("balance_transfer_id") REFERENCES "public"."balance_transfer"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_warranty_id_warranties_id_fk" FOREIGN KEY ("warranty_id") REFERENCES "public"."warranties"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfer" ADD CONSTRAINT "balance_transfer_from_account_id_accounts_id_fk" FOREIGN KEY ("from_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfer" ADD CONSTRAINT "balance_transfer_to_account_id_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "variants" ADD CONSTRAINT "variants_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_flows" ADD CONSTRAINT "stock_flows_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_flows" ADD CONSTRAINT "stock_flows_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_flows" ADD CONSTRAINT "stock_flows_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_flows" ADD CONSTRAINT "stock_flows_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_flows" ADD CONSTRAINT "stock_flows_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_flows" ADD CONSTRAINT "stock_flows_sale_return_id_sale_returns_id_fk" FOREIGN KEY ("sale_return_id") REFERENCES "public"."sale_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_flows" ADD CONSTRAINT "stock_flows_purchase_return_id_purchase_returns_id_fk" FOREIGN KEY ("purchase_return_id") REFERENCES "public"."purchase_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_purchase_return_id_purchase_returns_id_fk" FOREIGN KEY ("purchase_return_id") REFERENCES "public"."purchase_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_return_items" ADD CONSTRAINT "purchase_return_items_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_supplier_id_contacts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_contacts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_sale_return_id_sale_returns_id_fk" FOREIGN KEY ("sale_return_id") REFERENCES "public"."sale_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_return_items" ADD CONSTRAINT "sale_return_items_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sale_returns" ADD CONSTRAINT "sale_returns_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_supplier_id_contacts_id_fk" FOREIGN KEY ("supplier_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_replaced_batch_id_batches_id_fk" FOREIGN KEY ("replaced_batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_account_idx" ON "transactions" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "transactions_purchase_id_idx" ON "transactions" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "transactions_purchase_return_id_idx" ON "transactions" USING btree ("purchase_return_id");--> statement-breakpoint
CREATE INDEX "transactions_sale_id_idx" ON "transactions" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "transactions_sale_return_id_idx" ON "transactions" USING btree ("sale_return_id");--> statement-breakpoint
CREATE INDEX "transactions_warranty_id_idx" ON "transactions" USING btree ("warranty_id");--> statement-breakpoint
CREATE INDEX "balance_transfer_from_account_idx" ON "balance_transfer" USING btree ("from_account_id");--> statement-breakpoint
CREATE INDEX "balance_transfer_to_account_idx" ON "balance_transfer" USING btree ("to_account_id");--> statement-breakpoint
CREATE INDEX "sales_customer_id_idx" ON "sales" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "sales_invoice_no_idx" ON "sales" USING btree ("invoice_no");--> statement-breakpoint
CREATE INDEX "sale_items_sale_id_idx" ON "sale_items" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sale_items_product_id_idx" ON "sale_items" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "sale_items_batch_id_idx" ON "sale_items" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "contacts_name_idx" ON "contacts" USING btree ("name");--> statement-breakpoint
CREATE INDEX "contacts_type_name_idx" ON "contacts" USING btree ("type","name");--> statement-breakpoint
CREATE INDEX "variants_product_id_idx" ON "variants" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "batches_product_idx" ON "batches" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "batches_variant_idx" ON "batches" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "batches_purchase_idx" ON "batches" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "stock_flows_batch_idx" ON "stock_flows" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "stock_flows_product_idx" ON "stock_flows" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "stock_flows_variant_idx" ON "stock_flows" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "stock_flows_sale_idx" ON "stock_flows" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "stock_flows_purchase_idx" ON "stock_flows" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "stock_flows_sale_return_idx" ON "stock_flows" USING btree ("sale_return_id");--> statement-breakpoint
CREATE INDEX "stock_flows_purchase_return_idx" ON "stock_flows" USING btree ("purchase_return_id");--> statement-breakpoint
CREATE INDEX "pr_items_return_id_idx" ON "purchase_return_items" USING btree ("purchase_return_id");--> statement-breakpoint
CREATE INDEX "pr_items_batch_id_idx" ON "purchase_return_items" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "pr_items_variant_id_idx" ON "purchase_return_items" USING btree ("variant_id");--> statement-breakpoint
CREATE INDEX "purchase_returns_purchase_id_idx" ON "purchase_returns" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "purchase_returns_supplier_date_idx" ON "purchase_returns" USING btree ("supplier_id","date");--> statement-breakpoint
CREATE INDEX "purchases_supplier_id_idx" ON "purchases" USING btree ("supplier_id");--> statement-breakpoint
CREATE INDEX "purchases_invoice_no_idx" ON "purchases" USING btree ("invoice_no");--> statement-breakpoint
CREATE INDEX "sr_items_return_id_idx" ON "sale_return_items" USING btree ("sale_return_id");--> statement-breakpoint
CREATE INDEX "sr_items_batch_id_idx" ON "sale_return_items" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "sale_returns_sale_id_idx" ON "sale_returns" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "sale_returns_customer_date_idx" ON "sale_returns" USING btree ("customer_id","date");--> statement-breakpoint
CREATE INDEX "warranties_sale_id_idx" ON "warranties" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "warranties_customer_id_idx" ON "warranties" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "warranties_serial_idx" ON "warranties" USING btree ("serial");--> statement-breakpoint
CREATE INDEX "warranties_status_idx" ON "warranties" USING btree ("status");--> statement-breakpoint
CREATE INDEX "warranties_expire_date_idx" ON "warranties" USING btree ("expire_date");