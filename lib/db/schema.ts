import { sql } from 'drizzle-orm'
import { integer, primaryKey, sqliteTable, text, real } from 'drizzle-orm/sqlite-core'

import type { AdapterAccountType } from 'next-auth/adapters'

export const users = sqliteTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: integer('emailVerified', { mode: 'timestamp_ms' }),
  image: text('image')
})

export const accounts = sqliteTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state')
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    })
  })
)

export const sessions = sqliteTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
})

export const verificationTokens = sqliteTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: integer('expires', { mode: 'timestamp_ms' }).notNull()
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token]
    })
  })
)

export const authenticators = sqliteTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: integer('credentialBackedUp', {
      mode: 'boolean'
    }).notNull(),
    transports: text('transports')
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID]
    })
  })
)

export const userUsage = sqliteTable('userUsage', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  usedTokens: integer('usedTokens').notNull().default(0),
  totalTokens: integer('totalTokens').notNull().default(0)
})

export const posts = sqliteTable('posts', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull().unique(),
  title: text('title').notNull(),
  coverImageUrl: text('cover_image_url'),
  excerpt: text('excerpt').notNull(),
  content: text('content').notNull(),
  publishedAt: integer('published_at', { mode: 'timestamp_ms' }),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull()
})

export const postTranslations = sqliteTable('postTranslations', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  postId: text('postId')
    .notNull()
    .references(() => posts.id, { onDelete: 'cascade' }),
  slug: text('slug').notNull(),
  title: text('title').notNull(),
  excerpt: text('excerpt').notNull(),
  coverImageUrl: text('cover_image_url'),
  locale: text('locale').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull()
})

export type ProductType = 'one_time' | 'subscription'
export type SubscriptionInterval = 'day' | 'week' | 'month' | 'year'
export type OrderStatus = 'pending' | 'completed' | 'failed' | 'refunded'
export type PaymentMethod = 'credit_card' | 'paypal' | 'upgrade.chat' | 'other'
export type TransactionType = 'purchase' | 'usage' | 'refund' | 'subscription_renewal' | 'gift' | 'promotion'
export type Currency = 'USD' | 'CNY' | 'EUR' | 'JPY' | 'GBP'

// 产品表 - 存储可购买的产品或订阅计划
export const products = sqliteTable('products', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  type: text('type').$type<ProductType>().notNull(),
  price: real('price').notNull(),
  currency: text('currency').$type<Currency>().notNull().default('USD'),
  interval: text('interval').$type<SubscriptionInterval>(), // 仅用于订阅
  tokenAmount: integer('tokenAmount'), // 如果产品提供tokens
  active: integer('active', { mode: 'boolean' }).notNull().default(true),
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// 订单表 - 记录所有交易
export const orders = sqliteTable('orders', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  productId: text('productId')
    .notNull()
    .references(() => products.id),
  amount: real('amount').notNull(),
  currency: text('currency').$type<Currency>().notNull(),
  status: text('status').$type<OrderStatus>().notNull().default('pending'),
  paymentMethod: text('paymentMethod').$type<PaymentMethod>(),
  paymentIntentId: text('paymentIntentId'), // 支付网关的交易ID
  metadata: text('metadata'), // 存储JSON格式的额外信息
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// 订阅表 - 记录用户的活跃订阅
export const subscriptions = sqliteTable('subscriptions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  productId: text('productId')
    .notNull()
    .references(() => products.id),
  orderId: text('orderId').references(() => orders.id),
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp_ms' }).notNull(),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp_ms' }).notNull(),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
  subscriptionId: text('subscriptionId'), // 支付网关的订阅ID
  metadata: text('metadata'), // 存储JSON格式的额外信息
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// 交易历史表 - 记录所有token的变动
export const transactions = sqliteTable('transactions', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id),
  orderId: text('orderId').references(() => orders.id),
  type: text('type').$type<TransactionType>().notNull(),
  amount: integer('amount').notNull(), // token数量，可以是正数(增加)或负数(消费)
  createdAt: integer('created_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// 路由器状态类型
export type RouterStatus = 'online' | 'offline'

// 路由器表 - 存储路由器信息
export const routers = sqliteTable('routers', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  url: text('url').notNull(),
  status: text('status').$type<RouterStatus>().notNull().default('offline'),
  responseTime: integer('responseTime').notNull().default(0), // 响应时间(ms)
  lastCheck: integer('last_check', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull(),
  inviteLink: text('invite_link'), // 可选的邀请链接
  isVerified: integer('is_verified', { mode: 'boolean' }).notNull().default(false), // 是否认证
  likes: integer('likes').notNull().default(0), // 点赞数
  createdBy: text('created_by').references(() => users.id), // 创建人
  updatedBy: text('updated_by').references(() => users.id), // 修改人
createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// 路由器点赞记录表 - 记录用户点赞行为
export const routerLikes = sqliteTable(
  'router_likes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    routerId: text('router_id')
      .notNull()
      .references(() => routers.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(unixepoch())`)
      .notNull()
  },
)
