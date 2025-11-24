import { createDb } from '@/lib/db'
import { docs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

/**
 * 手动翻译单个文档
 * 用法: npx tsx scripts/translate-single-doc.ts <slug> <target-locale>
 * 例如: npx tsx scripts/translate-single-doc.ts claude-code-windows-config-guide en
 */

const slug = process.argv[2]
const targetLocale = process.argv[3]

if (!slug || !targetLocale) {
  console.error('❌ 用法: npx tsx scripts/translate-single-doc.ts <slug> <target-locale>')
  console.error('例如: npx tsx scripts/translate-single-doc.ts claude-code-windows-config-guide en')
  process.exit(1)
}

const localeNames: Record<string, string> = {
  en: 'English',
  ja: '日本語',
  ko: '한국어',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  ru: 'Русский',
  pt: 'Português',
  ar: 'العربية',
  hi: 'हिन्दी'
}

const langName = localeNames[targetLocale]
if (!langName) {
  console.error(`❌ 不支持的语言: ${targetLocale}`)
  console.error('支持的语言:', Object.keys(localeNames).join(', '))
  process.exit(1)
}

async function translateText(text: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 环境变量未设置')
  }

  const systemPrompt = `You are a professional technical document translator. Translate the following technical documentation from Chinese to ${langName}.

Rules:
1. Preserve all Markdown formatting
2. Keep code blocks and URLs unchanged
3. Use natural ${langName} expressions
4. Keep brand names in original form`

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text }
      ],
      temperature: 0.3,
      max_tokens: 8000
    })
  })

  if (!response.ok) {
    throw new Error(`API 请求失败: ${response.status}`)
  }

  const data = await response.json()
  return data.choices[0].message.content
}

async function main() {
  console.log(`\n📄 翻译文档: ${slug}`)
  console.log(`🌍 目标语言: ${langName} (${targetLocale})\n`)

  const db = createDb()

  // 获取中文原文
  const sourceDoc = await db
    .select()
    .from(docs)
    .where(and(eq(docs.slug, slug), eq(docs.locale, 'zh')))
    .limit(1)

  if (sourceDoc.length === 0) {
    console.error(`❌ 未找到中文文档: ${slug}`)
    process.exit(1)
  }

  const source = sourceDoc[0]

  console.log(`📝 原标题: ${source.title}`)
  console.log(`📏 内容长度: ${source.content.length} 字符\n`)

  // 翻译标题
  console.log('🔄 翻译标题...')
  const translatedTitle = await translateText(source.title)
  console.log(`✅ 译文标题: ${translatedTitle}\n`)

  // 翻译内容
  console.log('🔄 翻译内容...')
  const translatedContent = await translateText(source.content)
  console.log(`✅ 翻译完成\n`)

  // 检查是否已存在
  const existing = await db
    .select()
    .from(docs)
    .where(and(eq(docs.slug, slug), eq(docs.locale, targetLocale)))
    .limit(1)

  if (existing.length > 0) {
    await db
      .update(docs)
      .set({
        title: translatedTitle,
        content: translatedContent,
        coverImageUrl: source.coverImageUrl,
        updatedAt: new Date()
      })
      .where(eq(docs.id, existing[0].id))

    console.log('✅ 已更新现有文档')
  } else {
    await db.insert(docs).values({
      slug,
      locale: targetLocale,
      title: translatedTitle,
      content: translatedContent,
      coverImageUrl: source.coverImageUrl
    })

    console.log('✅ 已创建新文档')
  }

  console.log(`\n🎉 完成! 可访问: /${targetLocale}/docs/${slug}`)
}

main().catch((error) => {
  console.error('\n❌ 错误:', error)
  process.exit(1)
})
