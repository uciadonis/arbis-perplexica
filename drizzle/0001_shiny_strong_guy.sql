CREATE TABLE `feedbacks` (
	`id` integer PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`messageId` text NOT NULL,
	`feedback` text NOT NULL,
	`createdAt` text NOT NULL,
	`comment` text
);
