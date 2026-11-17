CREATE TYPE "public"."coupon_customer_limit" AS ENUM('once', 'first_order', 'unlimited');--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "max_discount_cents" integer;--> statement-breakpoint
ALTER TABLE "coupons" ADD COLUMN "customer_limit" "coupon_customer_limit" DEFAULT 'once' NOT NULL;