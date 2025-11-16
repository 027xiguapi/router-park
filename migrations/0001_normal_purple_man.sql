PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`productId` text NOT NULL,
	`amount` real NOT NULL,
	`currency` text NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`paymentMethod` text,
	`paymentIntentId` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_orders`("id", "userId", "productId", "amount", "currency", "status", "paymentMethod", "paymentIntentId", "metadata", "created_at", "updated_at") SELECT "id", "userId", "productId", "amount", "currency", "status", "paymentMethod", "paymentIntentId", "metadata", "created_at", "updated_at" FROM `orders`;--> statement-breakpoint
DROP TABLE `orders`;--> statement-breakpoint
ALTER TABLE `__new_orders` RENAME TO `orders`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_postTranslations` (
	`id` text PRIMARY KEY NOT NULL,
	`postId` text NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`excerpt` text NOT NULL,
	`cover_image_url` text,
	`locale` text NOT NULL,
	`content` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`postId`) REFERENCES `posts`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_postTranslations`("id", "postId", "slug", "title", "excerpt", "cover_image_url", "locale", "content", "created_at", "updated_at") SELECT "id", "postId", "slug", "title", "excerpt", "cover_image_url", "locale", "content", "created_at", "updated_at" FROM `postTranslations`;--> statement-breakpoint
DROP TABLE `postTranslations`;--> statement-breakpoint
ALTER TABLE `__new_postTranslations` RENAME TO `postTranslations`;--> statement-breakpoint
CREATE TABLE `__new_posts` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`title` text NOT NULL,
	`cover_image_url` text,
	`excerpt` text NOT NULL,
	`content` text NOT NULL,
	`published_at` integer,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_posts`("id", "slug", "title", "cover_image_url", "excerpt", "content", "published_at", "created_at", "updated_at") SELECT "id", "slug", "title", "cover_image_url", "excerpt", "content", "published_at", "created_at", "updated_at" FROM `posts`;--> statement-breakpoint
DROP TABLE `posts`;--> statement-breakpoint
ALTER TABLE `__new_posts` RENAME TO `posts`;--> statement-breakpoint
CREATE UNIQUE INDEX `posts_slug_unique` ON `posts` (`slug`);--> statement-breakpoint
CREATE TABLE `__new_products` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`price` real NOT NULL,
	`currency` text DEFAULT 'USD' NOT NULL,
	`interval` text,
	`tokenAmount` integer,
	`active` integer DEFAULT true NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
INSERT INTO `__new_products`("id", "name", "type", "price", "currency", "interval", "tokenAmount", "active", "created_at", "updated_at") SELECT "id", "name", "type", "price", "currency", "interval", "tokenAmount", "active", "created_at", "updated_at" FROM `products`;--> statement-breakpoint
DROP TABLE `products`;--> statement-breakpoint
ALTER TABLE `__new_products` RENAME TO `products`;--> statement-breakpoint
CREATE TABLE `__new_router_likes` (
	`id` text PRIMARY KEY NOT NULL,
	`router_id` text NOT NULL,
	`user_id` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`router_id`) REFERENCES `routers`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_router_likes`("id", "router_id", "user_id", "created_at") SELECT "id", "router_id", "user_id", "created_at" FROM `router_likes`;--> statement-breakpoint
DROP TABLE `router_likes`;--> statement-breakpoint
ALTER TABLE `__new_router_likes` RENAME TO `router_likes`;--> statement-breakpoint
CREATE TABLE `__new_routers` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`url` text NOT NULL,
	`status` text DEFAULT 'offline' NOT NULL,
	`responseTime` integer DEFAULT 0 NOT NULL,
	`last_check` integer DEFAULT (unixepoch()) NOT NULL,
	`invite_link` text,
	`is_verified` integer DEFAULT false NOT NULL,
	`likes` integer DEFAULT 0 NOT NULL,
	`created_by` text,
	`updated_by` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`created_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`updated_by`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_routers`("id", "name", "url", "status", "responseTime", "last_check", "invite_link", "is_verified", "likes", "created_by", "updated_by", "created_at", "updated_at") SELECT "id", "name", "url", "status", "responseTime", "last_check", "invite_link", "is_verified", "likes", "created_by", "updated_by", "created_at", "updated_at" FROM `routers`;--> statement-breakpoint
DROP TABLE `routers`;--> statement-breakpoint
ALTER TABLE `__new_routers` RENAME TO `routers`;--> statement-breakpoint
CREATE TABLE `__new_subscriptions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`productId` text NOT NULL,
	`orderId` text,
	`current_period_start` integer NOT NULL,
	`current_period_end` integer NOT NULL,
	`cancel_at_period_end` integer DEFAULT false,
	`subscriptionId` text,
	`metadata` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`productId`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_subscriptions`("id", "userId", "productId", "orderId", "current_period_start", "current_period_end", "cancel_at_period_end", "subscriptionId", "metadata", "created_at", "updated_at") SELECT "id", "userId", "productId", "orderId", "current_period_start", "current_period_end", "cancel_at_period_end", "subscriptionId", "metadata", "created_at", "updated_at" FROM `subscriptions`;--> statement-breakpoint
DROP TABLE `subscriptions`;--> statement-breakpoint
ALTER TABLE `__new_subscriptions` RENAME TO `subscriptions`;--> statement-breakpoint
CREATE TABLE `__new_transactions` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` text NOT NULL,
	`orderId` text,
	`type` text NOT NULL,
	`amount` integer NOT NULL,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`orderId`) REFERENCES `orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_transactions`("id", "userId", "orderId", "type", "amount", "created_at") SELECT "id", "userId", "orderId", "type", "amount", "created_at" FROM `transactions`;--> statement-breakpoint
DROP TABLE `transactions`;--> statement-breakpoint
ALTER TABLE `__new_transactions` RENAME TO `transactions`;