CREATE TABLE "order_emails" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" integer NOT NULL,
	"kind" text NOT NULL,
	"status" text DEFAULT 'en_cours' NOT NULL,
	"recipient" text NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"provider_id" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "order_emails_order_kind_unique" UNIQUE("order_id","kind")
);
--> statement-breakpoint
ALTER TABLE "orders" ADD COLUMN "tracking_url" text;--> statement-breakpoint
ALTER TABLE "order_emails" ADD CONSTRAINT "order_emails_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "order_emails_status_idx" ON "order_emails" USING btree ("status");