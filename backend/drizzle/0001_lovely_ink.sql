CREATE TYPE "public"."tx_source" AS ENUM('purchase', 'purchase_return', 'sale', 'sale_return', 'expense', 'warranty', 'balance_transfer', 'deposit', 'withdraw');--> statement-breakpoint
CREATE TYPE "public"."tx_type" AS ENUM('credit', 'debit');--> statement-breakpoint
CREATE TABLE "transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tx_no" varchar(100) NOT NULL,
	"account_id" integer NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
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
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_account_id_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_purchase_id_purchases_id_fk" FOREIGN KEY ("purchase_id") REFERENCES "public"."purchases"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_purchase_return_id_purchase_returns_id_fk" FOREIGN KEY ("purchase_return_id") REFERENCES "public"."purchase_returns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_sale_return_id_sale_returns_id_fk" FOREIGN KEY ("sale_return_id") REFERENCES "public"."sale_returns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_balance_transfer_id_balance_transfer_id_fk" FOREIGN KEY ("balance_transfer_id") REFERENCES "public"."balance_transfer"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_warranty_id_warranties_id_fk" FOREIGN KEY ("warranty_id") REFERENCES "public"."warranties"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_account_idx" ON "transactions" USING btree ("account_id");--> statement-breakpoint
CREATE INDEX "transactions_purchase_id_idx" ON "transactions" USING btree ("purchase_id");--> statement-breakpoint
CREATE INDEX "transactions_purchase_return_id_idx" ON "transactions" USING btree ("purchase_return_id");--> statement-breakpoint
CREATE INDEX "transactions_sale_id_idx" ON "transactions" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "transactions_sale_return_id_idx" ON "transactions" USING btree ("sale_return_id");--> statement-breakpoint
CREATE INDEX "transactions_warranty_id_idx" ON "transactions" USING btree ("warranty_id");