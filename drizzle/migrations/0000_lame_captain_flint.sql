CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`sku` text NOT NULL,
	`description` text,
	`category` text NOT NULL,
	`images` text DEFAULT '[]' NOT NULL,
	`price_regular` real NOT NULL,
	`price_bulk` real,
	`price_cost` real,
	`stock` integer DEFAULT 0 NOT NULL,
	`unit` text DEFAULT 'unit' NOT NULL,
	`low_stock_threshold` integer DEFAULT 0 NOT NULL,
	`supplier` text,
	`expiry_date` text,
	`nutritional_info` text,
	`cooking_instructions` text,
	`active` integer DEFAULT true NOT NULL,
	`featured` integer DEFAULT false NOT NULL,
	`storage_locations` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);