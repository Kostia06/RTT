CREATE TABLE `order_items` (
	`id` text PRIMARY KEY NOT NULL,
	`order_id` text NOT NULL,
	`product_name` text NOT NULL,
	`quantity` integer NOT NULL,
	`price` real NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_number` text NOT NULL,
	`customer_name` text,
	`customer_email` text NOT NULL,
	`customer_phone` text,
	`items` text,
	`subtotal` real,
	`tax` real,
	`total` real NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`payment_method` text,
	`payment_status` text,
	`payment_id` text,
	`delivery_type` text,
	`delivery_method` text,
	`delivery_time_slot` text,
	`delivery_address` text,
	`delivery_city` text,
	`delivery_postal_code` text,
	`delivery_instructions` text,
	`pickup_date` text,
	`pickup_time` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `fridge_inventory` (
	`id` text PRIMARY KEY NOT NULL,
	`fridge_id` text NOT NULL,
	`production_item_id` text NOT NULL,
	`cases` integer DEFAULT 0 NOT NULL,
	`loose_portions` integer DEFAULT 0 NOT NULL,
	`batch_date` text,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `fridge_temperature_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`fridge_id` text NOT NULL,
	`employee_id` text NOT NULL,
	`shift_id` text,
	`temperature` real NOT NULL,
	`notes` text,
	`logged_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `fridges` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`qr_code` text NOT NULL,
	`location` text,
	`max_capacity_cases` integer,
	`max_capacity_portions` integer,
	`temperature_log_required` integer DEFAULT true NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `fridges_qr_code_unique` ON `fridges` (`qr_code`);--> statement-breakpoint
CREATE TABLE `production_items` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`sku` text,
	`category` text,
	`case_size` integer DEFAULT 50 NOT NULL,
	`low_stock_threshold` integer DEFAULT 20 NOT NULL,
	`active` integer DEFAULT true NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `production_logs` (
	`id` text PRIMARY KEY NOT NULL,
	`shift_id` text NOT NULL,
	`employee_id` text NOT NULL,
	`production_item_id` text NOT NULL,
	`cases_made` integer DEFAULT 0 NOT NULL,
	`loose_portions` integer DEFAULT 0 NOT NULL,
	`notes` text,
	`logged_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `shift_production_assignments` (
	`id` text PRIMARY KEY NOT NULL,
	`shift_id` text NOT NULL,
	`production_item_id` text NOT NULL,
	`bins_required` integer,
	`target_portions` integer,
	`status` text DEFAULT 'pending' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `shifts` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text NOT NULL,
	`employee_name` text NOT NULL,
	`start_time` text NOT NULL,
	`end_time` text NOT NULL,
	`position` text NOT NULL,
	`status` text DEFAULT 'scheduled' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `time_entries` (
	`id` text PRIMARY KEY NOT NULL,
	`employee_id` text NOT NULL,
	`employee_name` text NOT NULL,
	`clock_in` text NOT NULL,
	`clock_out` text,
	`total_hours` real,
	`notes` text,
	`is_manual` integer DEFAULT false NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `contact_messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`subject` text,
	`message` text NOT NULL,
	`status` text DEFAULT 'new' NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `newsletter_subscribers` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`source` text DEFAULT 'website' NOT NULL,
	`is_active` integer DEFAULT true NOT NULL,
	`subscribed_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `newsletter_subscribers_email_unique` ON `newsletter_subscribers` (`email`);--> statement-breakpoint
CREATE TABLE `restock_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`supplier_id` text NOT NULL,
	`supplier_name` text NOT NULL,
	`items` text,
	`total_cost` real DEFAULT 0 NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`ordered_by` text,
	`ordered_at` text NOT NULL,
	`expected_delivery` text,
	`received_at` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `suppliers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact_person` text,
	`email` text,
	`phone` text,
	`address` text,
	`products` text,
	`rating` real DEFAULT 0 NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`key` text PRIMARY KEY NOT NULL,
	`value` text
);
--> statement-breakpoint
CREATE TABLE `related_products` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`related_product_id` text NOT NULL,
	`relationship_type` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
ALTER TABLE `user` ADD `payRate` real;--> statement-breakpoint
ALTER TABLE `user` ADD `phone` text;