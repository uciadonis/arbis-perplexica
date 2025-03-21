CREATE TABLE "chats" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"createdAt" text NOT NULL,
	"focusMode" text NOT NULL,
	"files" jsonb DEFAULT '[]'
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" integer PRIMARY KEY NOT NULL,
	"content" text NOT NULL,
	"chatId" text NOT NULL,
	"messageId" text NOT NULL,
	"type" text,
	"metadata" jsonb
);
