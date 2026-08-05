ALTER TYPE "public"."tx_source" ADD VALUE 'payment';--> statement-breakpoint
ALTER TABLE "ledgers" RENAME COLUMN "transaction_id" TO "payment_id";--> statement-breakpoint
ALTER TABLE "ledgers" DROP CONSTRAINT "ledgers_transaction_id_transactions_id_fk";
--> statement-breakpoint
DROP INDEX "ledgers_transaction_id_idx";--> statement-breakpoint
ALTER TABLE "transactions" ADD COLUMN "payment_id" integer;--> statement-breakpoint
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ledgers" ADD CONSTRAINT "ledgers_payment_id_payments_id_fk" FOREIGN KEY ("payment_id") REFERENCES "public"."payments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "transactions_payment_id_idx" ON "transactions" USING btree ("payment_id");--> statement-breakpoint
CREATE INDEX "ledgers_payment_id_idx" ON "ledgers" USING btree ("payment_id");