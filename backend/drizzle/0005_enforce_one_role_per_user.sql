DELETE FROM "user_role" a USING "user_role" b
WHERE a."id" <> b."id" AND a."user_id" = b."user_id"
AND (a."created_at" < b."created_at" OR (a."created_at" = b."created_at" AND a."id" < b."id"));--> statement-breakpoint
DROP INDEX "unique_user_role";--> statement-breakpoint
CREATE UNIQUE INDEX "unique_user_role" ON "user_role" USING btree ("user_id");
