DROP TABLE `users_table`;--> statement-breakpoint
ALTER TABLE `transactions_table` ADD `created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL;--> statement-breakpoint
ALTER TABLE `transactions_table` DROP COLUMN `userId`;