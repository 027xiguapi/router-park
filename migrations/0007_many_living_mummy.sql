CREATE TABLE `api_keys` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`name` text NOT NULL,
	`user_id` text,
	`group` text,
	`status` text DEFAULT 'active' NOT NULL,
	`expires_at` integer,
	`quota` integer DEFAULT 0 NOT NULL,
	`used_quota` integer DEFAULT 0 NOT NULL,
	`unlimited_quota` integer DEFAULT false NOT NULL,
	`request_count` integer DEFAULT 0 NOT NULL,
	`allowed_models` text,
	`ip_whitelist` text,
	`rate_limit` integer,
	`is_public` integer DEFAULT false NOT NULL,
	`description` text,
	`last_used_at` integer,
	`created_by` text,
	`updated_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `api_keys_key_unique` ON `api_keys` (`key`);--> statement-breakpoint
CREATE TABLE `model_configs` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`provider` text NOT NULL,
	`api_url` text NOT NULL,
	`api_key` text NOT NULL,
	`models` text NOT NULL,
	`default_model` text,
	`is_active` integer DEFAULT true NOT NULL,
	`priority` integer DEFAULT 0 NOT NULL,
	`description` text,
	`metadata` text,
	`created_by` text,
	`updated_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `model_configs_name_unique` ON `model_configs` (`name`);