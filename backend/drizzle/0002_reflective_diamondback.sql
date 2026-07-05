CREATE TYPE "public"."ledger_type" AS ENUM('sale', 'purchase', 'payment_in', 'payment_out', 'sale_return', 'purchase_return');--> statement-breakpoint
CREATE TABLE "ledgers" (
	"id" serial PRIMARY KEY NOT NULL,
	"type" "ledger_type" NOT NULL,
	"sale_id" integer,
	"purchase_id" integer,
	"sale_return_id" integer,
	"purchase_return_id" integer,
	"transaction_id" integer,
	"contact_id" integer NOT NULL,
	"amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"discount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"paid_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"due_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"balance_before" numeric(12, 2) DEFAULT 0 NOT NULL,
	"balance_after" numeric(12, 2) DEFAULT 0 NOT NULL,
	"note" text,
	"date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expenses" (
	"id" serial PRIMARY KEY NOT NULL,
	"expense_type_id" integer NOT NULL,
	"paid" integer DEFAULT 0 NOT NULL,
	"exchange_amount" integer DEFAULT 0 NOT NULL,
	"note" varchar(1000),
	"document_image" varchar(500),
	"expense_date" timestamp with time zone DEFAULT now() NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "expense_types" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "damages" (
	"id" serial PRIMARY KEY NOT NULL,
	"batch_id" integer,
	"product_id" integer NOT NULL,
	"variant_id" integer NOT NULL,
	"purchase_id" integer,
	"serial" varchar(255),
	"expire_date" timestamp with time zone,
	"damaged_qty" integer NOT NULL,
	"damage_loss" integer DEFAULT 0 NOT NULL,
	"purchase_price" integer NOT NULL,
	"reason" varchar(20) DEFAULT 'manual' NOT NULL,
	"note" text,
	"damage_date" timestamp with time zone DEFAULT now() NOT NULL,
	"deletable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "expense_id" integer;--> statement-breakpoint
ALTER TABLE "stock_flows" ADD COLUMN "damage_id" integer;--> statement-breakpoint
ALTER TABLE "ledgers" ADD CONSTRAINT "ledgers_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledgers" ADD CONSTRAINT "ledgers_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledgers" ADD CONSTRAINT "ledgers_sale_return_id_sale_returns_id_fk" FOREIGN KEY ("sale_return_id") REFERENCES "public"."sale_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledgers" ADD CONSTRAINT "ledgers_purchase_return_id_purchase_returns_id_fk" FOREIGN KEY ("purchase_return_id") REFERENCES "public"."purchase_returns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledgers" ADD CONSTRAINT "ledgers_transaction_id_transactions_id_fk" FOREIGN KEY ("transaction_id") REFERENCES "public"."transactions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledgers" ADD CONSTRAINT "ledgers_contact_id_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."contacts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_expense_type_id_expense_types_id_fk" FOREIGN KEY ("expense_type_id") REFERENCES "public"."expense_types"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "damages" ADD CONSTRAINT "damages_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "damages" ADD CONSTRAINT "damages_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "damages" ADD CONSTRAINT "damages_variant_id_variants_id_fk" FOREIGN KEY ("variant_id") REFERENCES "public"."variants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "damages" ADD CONSTRAINT "damages_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ledgers_contact_date_idx" ON "ledgers" USING btree ("contact_id","date");--> statement-breakpoint
CREATE INDEX "ledgers_sale_id_idx" ON "ledgers" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "ledgers_purchase_id_idx" ON "ledgers" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "ledgers_transaction_id_idx" ON "ledgers" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "damage_product_idx" ON "damages" USING btree ("product_id");--> statement-breakpoint
CREATE INDEX "damage_batch_idx" ON "damages" USING btree ("batch_id");--> statement-breakpoint
CREATE INDEX "damage_purchase_idx" ON "damages" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "damage_date_idx" ON "damages" USING btree ("damage_date");--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_expense_id_expenses_id_fk" FOREIGN KEY ("expense_id") REFERENCES "public"."expenses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "stock_flows" ADD CONSTRAINT "stock_flows_damage_id_damages_id_fk" FOREIGN KEY ("damage_id") REFERENCES "public"."damages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_expense_id_idx" ON "transactions" USING btree ("expense_id");--> statement-breakpoint
CREATE INDEX "stock_flows_damage_idx" ON "stock_flows" USING btree ("damage_id");