import { db } from '@/lib/db'
import { routers, freeKeys } from '@/lib/db/schema'
import { gte, sql, desc, eq } from 'drizzle-orm'
import { parseKeyValues } from '@/lib/db/freeKeys'

// 简化的类型定义，匹配数据库返回的原始数据
interface RouterData {
  id: string
  name: string
  url: string
  status: 'online' | 'offline'
  responseTime: number
  lastCheck: number
  inviteLink: string | null
  isVerified: boolean
  likes: number
  createdBy: string | null
  updatedBy: string | null
  createdAt: number
  updatedAt: number
}

interface FreeKeyData {
  id: string
  keyValues: string
  keyType: 'claude' | 'llm'
  status: 'active' | 'inactive' | 'exhausted'
  createdBy: string | null
  updatedBy: string | null
  createdAt: number
  updatedAt: number
}

interface DailySummaryData {
  date: string
  routers: {
    total: number
    online: number
    offline: number
    newToday: RouterData[]
  }
  freeKeys: {
    total: number
    active: number
    claude: number
    llm: number
    newToday: FreeKeyData[]
  }
}

/**
 * 辅助函数：将数据库记录转换为可序列化的格式
 */
function serializeRouterData(data: any): RouterData {
  return {
    id: String(data.id),
    name: String(data.name),
    url: String(data.url),
    status: data.status as 'online' | 'offline',
    responseTime: Number(data.responseTime),
    lastCheck: Number(data.lastCheck),
    inviteLink: data.inviteLink ? String(data.inviteLink) : null,
    isVerified: Boolean(data.isVerified),
    likes: Number(data.likes),
    createdBy: data.createdBy ? String(data.createdBy) : null,
    updatedBy: data.updatedBy ? String(data.updatedBy) : null,
    createdAt: Number(data.createdAt),
    updatedAt: Number(data.updatedAt)
  }
}

function serializeFreeKeyData(data: any): FreeKeyData {
  return {
    id: String(data.id),
    keyValues: String(data.keyValues),
    keyType: data.keyType as 'claude' | 'llm',
    status: data.status as 'active' | 'inactive' | 'exhausted',
    createdBy: data.createdBy ? String(data.createdBy) : null,
    updatedBy: data.updatedBy ? String(data.updatedBy) : null,
    createdAt: Number(data.createdAt),
    updatedAt: Number(data.updatedAt)
  }
}

/**
 * 获取前一天的数据汇总
 */
export async function getDailySummaryData(): Promise<DailySummaryData> {
  // 获取昨天的日期
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  yesterday.setHours(0, 0, 0, 0)

  // 获取前一天结束时间（23:59:59）
  const yesterdayEnd = new Date(yesterday)
  yesterdayEnd.setHours(23, 59, 59, 999)

  // 获取前一天新增的路由器
  const newRoutersYesterday = await db
    .select()
    .from(routers)
    .where(gte(routers.createdAt, yesterday))
    .orderBy(desc(routers.createdAt))

  // 获取所有路由器统计
  const allRoutersCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(routers)

  const onlineRoutersCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(routers)
    .where(eq(routers.status, 'online'))

  const offlineRoutersCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(routers)
    .where(eq(routers.status, 'offline'))

  // 获取前一天新增的免费密钥
  const newFreeKeysYesterday = await db
    .select()
    .from(freeKeys)
    .where(gte(freeKeys.createdAt, yesterday))
    .orderBy(desc(freeKeys.createdAt))

  // 获取所有免费密钥统计
  const allKeysCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(freeKeys)

  const activeKeysCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(freeKeys)
    .where(eq(freeKeys.status, 'active'))

  const claudeKeysCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(freeKeys)
    .where(eq(freeKeys.keyType, 'claude'))

  const llmKeysCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(freeKeys)
    .where(eq(freeKeys.keyType, 'llm'))

  // 序列化数据以确保可序列化
  const serializedRouters = newRoutersYesterday.map(serializeRouterData)
  const serializedKeys = newFreeKeysYesterday.map(serializeFreeKeyData)

  return {
    date: yesterdayEnd.toISOString().split('T')[0],
    routers: {
      total: Number(allRoutersCount[0]?.count || 0),
      online: Number(onlineRoutersCount[0]?.count || 0),
      offline: Number(offlineRoutersCount[0]?.count || 0),
      newToday: serializedRouters
    },
    freeKeys: {
      total: Number(allKeysCount[0]?.count || 0),
      active: Number(activeKeysCount[0]?.count || 0),
      claude: Number(claudeKeysCount[0]?.count || 0),
      llm: Number(llmKeysCount[0]?.count || 0),
      newToday: serializedKeys
    }
  }
}

/**
 * 生成 Markdown 格式的每日总结
 */
export function generateDailySummaryMarkdown(
  data: DailySummaryData,
  locale: string,
  t: any
): string {
  const { date, routers, freeKeys } = data

  // 格式化日期
  const dateObj = new Date(date)
  const formattedDate = dateObj.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  let markdown = `# 📊 ${t('title')} - ${formattedDate}\n\n`

  markdown += `> ${t('subtitle')} **${formattedDate}** ${t('subtitleSuffix')}\n\n`

  markdown += `---\n\n`

  // 路由器部分
  markdown += `## 🔌 ${t('routersSection.title')}\n\n`

  markdown += `### ${t('routersSection.overview')}\n\n`
  markdown += `| ${t('routersSection.total')} | ${t('routersSection.online')} | ${t('routersSection.offline')} | ${t('routersSection.newToday')} |\n`
  markdown += `|------|------|------|------|\n`
  markdown += `| **${routers.total}** ${t('routersSection.units.items')} | **${routers.online}** ${t('routersSection.units.items')} ✅ | **${routers.offline}** ${t('routersSection.units.items')} ⚠️ | **${routers.newToday.length}** ${t('routersSection.units.items')} 🆕 |\n\n`

  // 今日新增路由器
  if (routers.newToday.length > 0) {
    markdown += `### ${t('routersSection.newTodayTitle')}\n\n`
    routers.newToday.forEach((router, index) => {
      const statusEmoji = router.status === 'online' ? '✅' : '⚠️'
      const verifiedBadge = router.isVerified ? ` 🔒${t('routersSection.verified')}` : ''
      markdown += `${index + 1}. **${router.name}** ${statusEmoji}${verifiedBadge}\n`
      markdown += `   - URL: [${router.url}](${router.url})\n`
      markdown += `   - ${t('routersSection.status')}: ${router.status === 'online' ? t('routersSection.statusOnline') : t('routersSection.statusOffline')}\n`
      markdown += `   - ${t('routersSection.responseTime')}: ${router.responseTime}ms\n`
      if (router.inviteLink) {
        markdown += `   - ${t('routersSection.inviteLink')}: [${t('routersSection.visitLink')}](${router.inviteLink})\n`
      }
      markdown += `   - ${t('routersSection.likes')}: ${router.likes} 👍\n\n`
    })
  } else {
    markdown += `### ${t('routersSection.newTodayTitle')}\n\n`
    markdown += `${t('routersSection.noNewItems')}\n\n`
  }

  markdown += `---\n\n`

  // 免费密钥部分
  markdown += `## 🔑 ${t('freeKeysSection.title')}\n\n`

  markdown += `### ${t('freeKeysSection.overview')}\n\n`
  markdown += `| ${t('freeKeysSection.total')} | ${t('freeKeysSection.active')} | ${t('freeKeysSection.claude')} | ${t('freeKeysSection.llm')} | ${t('freeKeysSection.newToday')} |\n`
  markdown += `|------|------|------|------|------|\n`
  markdown += `| **${freeKeys.total}** ${t('freeKeysSection.units.groups')} | **${freeKeys.active}** ${t('freeKeysSection.units.groups')} ✅ | **${freeKeys.claude}** ${t('freeKeysSection.units.groups')} | **${freeKeys.llm}** ${t('freeKeysSection.units.groups')} | **${freeKeys.newToday.length}** ${t('freeKeysSection.units.groups')} 🆕 |\n\n`

  // 今日新增密钥
  if (freeKeys.newToday.length > 0) {
    markdown += `### ${t('freeKeysSection.newTodayTitle')}\n\n`
    freeKeys.newToday.forEach((key, index) => {
      const statusEmoji = key.status === 'active' ? '✅' : key.status === 'inactive' ? '⚠️' : '❌'
      const typeLabel = key.keyType === 'claude' ? t('freeKeysSection.typeClaude') : t('freeKeysSection.typeLlm')
      const keys = parseKeyValues(key.keyValues)

      let statusLabel = t('freeKeysSection.statusActive')
      if (key.status === 'inactive') statusLabel = t('freeKeysSection.statusInactive')
      if (key.status === 'exhausted') statusLabel = t('freeKeysSection.statusExhausted')

      markdown += `${index + 1}. **${typeLabel} ${t('freeKeysSection.units.groups')}** ${statusEmoji}\n`
      markdown += `   - ${t('freeKeysSection.type')}: ${typeLabel}\n`
      markdown += `   - ${t('freeKeysSection.status')}: ${statusLabel}\n`
      markdown += `   - ${t('freeKeysSection.keyCount')}: ${keys.length} ${t('routersSection.units.items')}\n`

      if (keys.length > 0 && keys.length <= 5) {
        markdown += `   - ${t('freeKeysSection.keyList')}:\n`
        keys.forEach((k, i) => {
          // 隐藏部分密钥内容
          const maskedKey = k.length > 20 ? `${k.substring(0, 10)}...${k.substring(k.length - 10)}` : k
          markdown += `     ${i + 1}. \`${maskedKey}\`\n`
        })
      } else if (keys.length > 5) {
        markdown += `   - ${t('freeKeysSection.keyPreview')}:\n`
        keys.slice(0, 3).forEach((k, i) => {
          const maskedKey = k.length > 20 ? `${k.substring(0, 10)}...${k.substring(k.length - 10)}` : k
          markdown += `     ${i + 1}. \`${maskedKey}\`\n`
        })
        markdown += `   - ${t('freeKeysSection.moreKeys', { count: keys.length - 3 })}\n`
      }

      markdown += `\n`
    })
  } else {
    markdown += `### ${t('freeKeysSection.newTodayTitle')}\n\n`
    markdown += `${t('freeKeysSection.noNewItems')}\n\n`
  }

  markdown += `---\n\n`

  // 底部说明
  markdown += `## 💡 ${t('notesSection.title')}\n\n`
  markdown += `- ${t('notesSection.dataDate')}${formattedDate}\n`
  markdown += `- ${t('notesSection.autoCheck')}\n`
  markdown += `- ${t('notesSection.realTimeUpdate')}\n`
  markdown += `- ${t('notesSection.autoGenerate')}\n\n`

  markdown += `---\n\n`
  const lastUpdateTime = new Date().toLocaleString(locale)
  markdown += `*${t('notesSection.lastUpdate')} ${lastUpdateTime}*\n`

  return markdown
}
