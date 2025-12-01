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
  publishedAt: integer('published_at', { mode: 'timestamp' }),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
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
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
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
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
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
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
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
  currentPeriodStart: integer('current_period_start', { mode: 'timestamp' }).notNull(),
  currentPeriodEnd: integer('current_period_end', { mode: 'timestamp' }).notNull(),
  cancelAtPeriodEnd: integer('cancel_at_period_end', { mode: 'boolean' }).default(false),
  subscriptionId: text('subscriptionId'), // 支付网关的订阅ID
  metadata: text('metadata'), // 存储JSON格式的额外信息
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
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
  createdAt: integer('created_at', { mode: 'timestamp' })
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
  lastCheck: integer('last_check', { mode: 'timestamp' })
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
  updatedAt: integer('updated_at', { mode: 'timestamp' })
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
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull()
  },
)

// VPN 配置表 - 存储免费 VPN 配置信息
export const vpns = sqliteTable('vpns', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  url: text('url').notNull(), // VPN 详情页面 URL
  subscriptionUrl: text('subscription_url').notNull(), // 订阅地址
  inviteLink: text('invite_link'), // 邀请链接
  description: text('description'), // VPN 描述
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true), // 是否激活
  sortOrder: integer('sort_order').notNull().default(0), // 排序顺序
  createdBy: text('created_by').references(() => users.id), // 创建人
  updatedBy: text('updated_by').references(() => users.id), // 修改人
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// 代理/中转站表 - 存储 SEO 优化的代理中转站信息
export const proxys = sqliteTable('proxys', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(), // 中转站名称
  url: text('url').notNull(), // 中转站 URL
  slug: text('slug').unique().notNull(), // SEO 友好的 URL 标识符 (例: proxy/megallm)
  seoTitle: text('seo_title').notNull(), // SEO 页面标题
  seoDescription: text('seo_description').notNull(), // SEO 页面描述
  content: text('content'), // Markdown 格式的页面内容
  models: text('models'), // 支持的模型 (JSON 数组字符串，例: ["GPT-4","Claude"])
  inviteLink: text('invite_link'), // 邀请链接
  status: text('status').$type<'active' | 'inactive'>().notNull().default('active'), // 状态
  sortOrder: integer('sort_order').notNull().default(0), // 排序顺序
  views: integer('views').notNull().default(0), // 浏览次数
  likes: integer('likes').notNull().default(0), // 点赞数
  createdBy: text('created_by').references(() => users.id), // 创建人
  updatedBy: text('updated_by').references(() => users.id), // 修改人
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// 免费密钥类型
export type FreeKeyType = 'claude' | 'llm'
export type FreeKeyStatus = 'active' | 'inactive' | 'exhausted'

// 免费密钥表 - 存储免费API密钥
export const freeKeys = sqliteTable('free_keys', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  keyValues: text('key_values').notNull(),
  keyType: text('key_type').$type<FreeKeyType>().notNull(),
  status: text('status').$type<FreeKeyStatus>().notNull().default('active'), // 状态
  createdBy: text('created_by').references(() => users.id), // 创建人
  updatedBy: text('updated_by').references(() => users.id), // 修改人
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// 文档表 - 存储 doc 文件夹中的 MD 文件内容
export const docs = sqliteTable('docs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull(),
  locale: text('locale').notNull(),
  coverImageUrl: text('cover_image_url'),
  title: text('title').notNull(),
  content: text('content').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// 代理评论表 - 存储用户对代理的评论
export const proxyComments = sqliteTable('proxy_comments', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  proxyId: text('proxy_id')
    .notNull()
    .references(() => proxys.id, { onDelete: 'cascade' }),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  content: text('content').notNull(), // Markdown 格式的评论内容
  likes: integer('likes').notNull().default(0), // 点赞数
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// 评论点赞记录表 - 记录用户对评论的点赞行为
export const commentLikes = sqliteTable(
  'comment_likes',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    commentId: text('comment_id')
      .notNull()
      .references(() => proxyComments.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: integer('created_at', { mode: 'timestamp' })
      .default(sql`(unixepoch())`)
      .notNull()
  }
)

// 大语言模型状态类型
export type ModelStatus = 'active' | 'inactive' | 'beta' | 'deprecated'
export type ModelProvider = 'openai' | 'anthropic' | 'google' | 'meta' | 'mistral' | 'alibaba' | 'baidu' | 'other'

// AI 模型配置表 - 存储 API 转发配置
export const modelConfigs = sqliteTable('model_configs', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull().unique(), // 配置名称 (唯一标识，如 'cjack', 'gmi')
  provider: text('provider').notNull(), // 提供商显示名称 (如 'CJack API')
  apiUrl: text('api_url').notNull(), // API 转发地址
  apiKey: text('api_key').notNull(), // API Key (应考虑加密存储)
  models: text('models').notNull(), // 支持的模型列表 (JSON 数组字符串)
  defaultModel: text('default_model'), // 默认模型
  isActive: integer('is_active', { mode: 'boolean' }).notNull().default(true), // 是否启用
  priority: integer('priority').notNull().default(0), // 优先级 (数字越大优先级越高)
  description: text('description'), // 配置描述
  metadata: text('metadata'), // 其他元数据 (JSON 格式)
  createdBy: text('created_by').references(() => users.id), // 创建人
  updatedBy: text('updated_by').references(() => users.id), // 修改人
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
})

// 大语言模型表 - 存储 AI 大语言模型信息
export const models = sqliteTable('models', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  slug: text('slug').notNull(), // URL 友好的标识符，如 gpt-4, claude-3-opus
  locale: text('locale').notNull(), // 语言，如 zh-CN, en-US
  name: text('name').notNull(), // 模型名称，如 GPT-4, Claude 3 Opus
  provider: text('provider').$type<ModelProvider>().notNull(), // 模型提供商
  coverImageUrl: text('cover_image_url'), // 封面图片 URL
  title: text('title').notNull(), // SEO 标题
  description: text('description'), // 简短描述
  content: text('content').notNull(), // Markdown 格式的详细介绍
  status: text('status').$type<ModelStatus>().notNull().default('active'), // 模型状态
  contextWindow: integer('context_window'), // 上下文窗口大小（tokens）
  maxOutputTokens: integer('max_output_tokens'), // 最大输出 tokens
  officialUrl: text('official_url'), // 官方网站链接
  apiDocUrl: text('api_doc_url'), // API 文档链接
  pricing: text('pricing'), // 定价信息（JSON 格式）
  capabilities: text('capabilities'), // 能力标签（JSON 数组，如 ["text", "vision", "function-calling"]）
  releaseDate: integer('release_date', { mode: 'timestamp' }), // 发布日期
  sortOrder: integer('sort_order').notNull().default(0), // 排序顺序
  views: integer('views').notNull().default(0), // 浏览次数
  likes: integer('likes').notNull().default(0), // 点赞数
  createdBy: text('created_by').references(() => users.id), // 创建人
  updatedBy: text('updated_by').references(() => users.id), // 修改人
  createdAt: integer('created_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' })
    .default(sql`(unixepoch())`)
    .notNull()
})
