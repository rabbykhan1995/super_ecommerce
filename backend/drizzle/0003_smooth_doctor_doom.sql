CREATE TABLE "balance_transfer" (
	"id" serial PRIMARY KEY NOT NULL,
	"from_account_id" integer NOT NULL,
	"to_account_id" integer NOT NULL,
	"amount" numeric(20, 2) NOT NULL,
	"date" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "balance_transfer" ADD CONSTRAINT "balance_transfer_from_account_id_accounts_id_fk" FOREIGN KEY ("from_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "balance_transfer" ADD CONSTRAINT "balance_transfer_to_account_id_accounts_id_fk" FOREIGN KEY ("to_account_id") REFERENCES "public"."accounts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "balance_transfer_from_account_idx" ON "balance_transfer" USING btree ("from_account_id");--> statement-breakpoint
CREATE INDEX "balance_transfer_to_account_idx" ON "balance_transfer" USING btree ("to_account_id");