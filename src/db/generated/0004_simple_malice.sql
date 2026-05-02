ALTER TABLE "refresh_tokens" RENAME COLUMN "body" TO "token";--> statement-breakpoint
ALTER TABLE "refresh_tokens" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "refresh_tokens" ADD COLUMN "expires_at" timestamp NOT NULL;