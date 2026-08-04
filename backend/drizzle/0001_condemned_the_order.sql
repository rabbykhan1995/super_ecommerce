DROP INDEX "contacts_user_id_idx";--> statement-breakpoint
ALTER TABLE "contacts" ADD CONSTRAINT "contacts_user_id_unique" UNIQUE("user_id");