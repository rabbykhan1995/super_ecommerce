CREATE TABLE "accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"branch" varchar(100) DEFAULT '',
	"balance" integer DEFAULT 0 NOT NULL,
	"number" varchar(50) NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL
);
