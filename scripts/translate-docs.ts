import { createDb } from '@/lib/db'
import { docs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

// 支持的语言列表
const locales = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  { code: 'ko', name: '한국어' },
  { code: 'es', name: 'Español' },
  { code: 'fr', name: 'Français' },
  { code: 'de', name: 'Deutsch' },
  { code: 'it', name: 'Italiano' },
  { code: 'ru', name: 'Русский' },
  { code: 'pt', name: 'Português' },
  { code: 'ar', name: 'العربية' },
  { code: 'hi', name: 'हिन्दी' }
]

// 需要翻译的文档 slug 列表
const docsToTranslate = [
  'open-code-windows-config-guide',
  'open-code-macos-config-guide',
  'open-code-linux-config-guide',
  'claude-code-windows-config-guide',
  'claude-code-macos-config-guide',
  'claude-code-linux-config-guide',
  'codex-windows-config-guide',
  'codex-macos-config-guide',
  'codex-linux-config-guide',
  'github-copilot-vscode-config-guide',
  'cursor-config-guide',
  'cline-vscode'
]

/**
 * 使用 OpenAI API 翻译文本
 */
async function translateText(text: string, targetLang: string, langName: string): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY
  const baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY 环境变量未设置')
  }

  const systemPrompt = `You are a professional technical document translator. Translate the following technical documentation from Chinese to ${langName}.

Rules:
1. Preserve all Markdown formatting (headers, lists, code blocks, links, etc.)
2. Keep code blocks, URLs, and technical terms unchanged
3. Maintain the same structure and layout
4. Use natural ${langName} expressions for technical documentation
5. Keep brand names and product names in their original form (e.g., "Claude Code", "OpenCode", "Cursor")
6. For command-line instructions and code, keep them in English
7. Translate comments in code blocks to ${langName} if they exist`

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          {
            role: 'user',
            content: text
          }
        ],
        temperature: 0.3,
        max_tokens: 8000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`翻译 API 请求失败: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error(`翻译到 ${langName} 失败:`, error)
    throw error
  }
}

/**
 * 分块翻译长文本
 */
async function translateLongText(text: string, targetLang: string, langName: string): Promise<string> {
  const maxChunkSize = 3000 // 每块最大字符数

  // 如果文本较短，直接翻译
  if (text.length <= maxChunkSize) {
    return await translateText(text, targetLang, langName)
  }

  // 按段落分割文本
  const paragraphs = text.split('\n\n')
  const chunks: string[] = []
  let currentChunk = ''

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length + 2 <= maxChunkSize) {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph
    } else {
      if (currentChunk) {
        chunks.push(currentChunk)
      }
      currentChunk = paragraph
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk)
  }

  console.log(`   文本分为 ${chunks.length} 块进行翻译...`)

  // 逐块翻译
  const translatedChunks: string[] = []
  for (let i = 0; i < chunks.length; i++) {
    console.log(`   翻译第 ${i + 1}/${chunks.length} 块...`)
    const translated = await translateText(chunks[i], targetLang, langName)
    translatedChunks.push(translated)

    // 添加延迟避免 API 限流
    if (i < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return translatedChunks.join('\n\n')
}

/**
 * 翻译单个文档到指定语言
 */
async function translateDocument(
  db: ReturnType<typeof createDb>,
  slug: string,
  targetLocale: string,
  langName: string
) {
  console.log(`\n📄 翻译文档: ${slug} -> ${langName} (${targetLocale})`)

  // 获取中文原文
  const sourceDoc = await db
    .select()
    .from(docs)
    .where(and(eq(docs.slug, slug), eq(docs.locale, 'zh')))
    .limit(1)

  if (sourceDoc.length === 0) {
    console.log(`   ⚠️  未找到中文原文，跳过`)
    return false
  }

  const source = sourceDoc[0]

  // 检查目标语言版本是否已存在
  const existingDoc = await db
    .select()
    .from(docs)
    .where(and(eq(docs.slug, slug), eq(docs.locale, targetLocale)))
    .limit(1)

  // 翻译标题和内容
  console.log(`   翻译标题...`)
  const translatedTitle = await translateText(source.title, targetLocale, langName)

  console.log(`   翻译内容 (${source.content.length} 字符)...`)
  const translatedContent = await translateLongText(source.content, targetLocale, langName)

  if (existingDoc.length > 0) {
    // 更新现有文档
    await db
      .update(docs)
      .set({
        title: translatedTitle,
        content: translatedContent,
        coverImageUrl: source.coverImageUrl,
        updatedAt: new Date()
      })
      .where(eq(docs.id, existingDoc[0].id))

    console.log(`   ✅ 更新成功`)
  } else {
    // 插入新文档
    await db.insert(docs).values({
      slug,
      locale: targetLocale,
      title: translatedTitle,
      content: translatedContent,
      coverImageUrl: source.coverImageUrl
    })

    console.log(`   ✅ 创建成功`)
  }

  return true
}

/**
 * 主函数：批量翻译文档
 */
async function translateAllDocs() {
  console.log('🌍 开始批量翻译文档\n')
  console.log('=' .repeat(60))

  const db = createDb()

  let totalTranslated = 0
  let totalFailed = 0
  let totalSkipped = 0

  for (const slug of docsToTranslate) {
    console.log(`\n📚 处理文档: ${slug}`)
    console.log('-'.repeat(60))

    for (const locale of locales) {
      try {
        const success = await translateDocument(db, slug, locale.code, locale.name)
        if (success) {
          totalTranslated++
        } else {
          totalSkipped++
        }

        // 添加延迟避免 API 限流
        await new Promise((resolve) => setTimeout(resolve, 2000))
      } catch (error) {
        console.error(`   ❌ 翻译失败:`, error instanceof Error ? error.message : '未知错误')
        totalFailed++
      }
    }
  }

  console.log('\n' + '='.repeat(60))
  console.log('📊 翻译统计:')
  console.log(`   ✅ 成功: ${totalTranslated}`)
  console.log(`   ❌ 失败: ${totalFailed}`)
  console.log(`   ⏭️  跳过: ${totalSkipped}`)
  console.log(`   📚 总计: ${docsToTranslate.length} 个文档 × ${locales.length} 种语言 = ${docsToTranslate.length * locales.length} 个任务`)
  console.log('='.repeat(60))

  if (totalFailed > 0) {
    process.exit(1)
  }
}

// 执行翻译
translateAllDocs()
  .then(() => {
    console.log('\n✨ 翻译完成!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 翻译失败:', error)
    process.exit(1)
  })
