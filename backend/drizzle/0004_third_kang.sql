CREATE TABLE "parcels" (
	"id" serial PRIMARY KEY NOT NULL,
	"sale_id" integer NOT NULL,
	"customer_id" integer,
	"parcel_type" varchar(20) DEFAULT 'local' NOT NULL,
	"address" text NOT NULL,
	"courier_name" varchar(100),
	"third_party_tracking_no" varchar(255),
	"local_parcel_no" varchar(255),
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"note" text,
	"shipping_cost" numeric(12, 2) DEFAULT 0 NOT NULL,
	"cod_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"due_amount" numeric(12, 2) DEFAULT 0 NOT NULL,
	"parcel_date" timestamp with time zone DEFAULT now() NOT NULL,
	"deletable" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_sale_id_sales_id_fk" FOREIGN KEY ("sale_id") REFERENCES "public"."sales"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "parcels" ADD CONSTRAINT "parcels_customer_id_contacts_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."contacts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "parcels_sale_id_idx" ON "parcels" USING btree ("sale_id");--> statement-breakpoint
CREATE INDEX "parcels_customer_id_idx" ON "parcels" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "parcels_status_idx" ON "parcels" USING btree ("status");--> statement-breakpoint
CREATE INDEX "parcels_tracking_no_idx" ON "parcels" USING btree ("third_party_tracking_no");