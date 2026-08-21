CREATE SEQUENCE "public"."employe_code_seq" INCREMENT BY 1 MINVALUE 1 MAXVALUE 9223372036854775807 START WITH 100001 CACHE 1;--> statement-breakpoint
ALTER TABLE "user_roles" RENAME TO "user_role";--> statement-breakpoint
ALTER TABLE "user_role" DROP CONSTRAINT "user_roles_user_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "user_role" DROP CONSTRAINT "user_roles_role_id_roles_id_fk";
--> statement-breakpoint
ALTER TABLE "staff_profiles" ALTER COLUMN "employee_code" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "staff_profiles" ALTER COLUMN "employee_code" SET DEFAULT nextval('employe_code_seq');--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_role" ADD CONSTRAINT "user_role_role_id_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."roles"("id") ON DELETE cascade ON UPDATE no action;