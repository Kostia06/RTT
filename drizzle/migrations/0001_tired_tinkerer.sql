CREATE TABLE `recipes` (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`slug` text NOT NULL,
	`description` text,
	`difficulty` text NOT NULL,
	`servings` integer DEFAULT 1 NOT NULL,
	`ingredients` text DEFAULT '[]' NOT NULL,
	`instructions` text DEFAULT '[]' NOT NULL,
	`nutritional_info` text,
	`images` text DEFAULT '[]' NOT NULL,
	`tips` text,
	`active` integer DEFAULT true NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `recipes_slug_unique` ON `recipes` (`slug`);--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`sku` text NOT NULL,
	`name` text NOT NULL,
	`price` real NOT NULL,
	`stock` integer DEFAULT 0,
	`options` text
);
