import fs from 'fs'
import path from 'path'

/**
 * 翻译单个 Markdown 文件
 * 用法: npx tsx scripts/translate-markdown-single.ts <filename> <target-locale>
 * 例如: npx tsx scripts/translate-markdown-single.ts "控制台 - UniVibe-2025-11-24 14_03_00.md" ja
 */

const fileName = process.argv[2]
const targetLocale = process.argv[3]

if (!fileName || !targetLocale) {
  console.error('❌ 用法: npx tsx scripts/translate-markdown-single.ts <filename> <target-locale>')
  console.error('例如: npx tsx scripts/translate-markdown-single.ts "控制台 - UniVibe.md" ja')
  process.exit(1)
}

const localeNames: Record<string, string> = {
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

/**
 * 使用 GMI API 翻译文本
 */
async function translateText(text: string): Promise<string> {
  const apiKey = process.env.GMI_API_KEY

  if (!apiKey) {
    throw new Error('GMI_API_KEY 环境变量未设置')
  }

  const systemPrompt = `You are a professional technical document translator. Translate the following technical documentation from English to ${langName}.

Rules:
1. Preserve all Markdown formatting (headers, lists, code blocks, links, images, etc.)
2. Keep code blocks, URLs, file paths, and technical commands unchanged
3. Maintain the same structure and layout
4. Use natural ${langName} expressions for technical documentation
5. Keep brand names and product names in their original form
6. For command-line instructions and code, keep them in English
7. Translate comments in code blocks to ${langName} if they exist
8. Keep HTML tags and attributes unchanged
9. Preserve image references and links`

  try {
    const response = await fetch('https://api.gmi-serving.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-ai/DeepSeek-Prover-V2-671B',
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
        temperature: 0,
        max_tokens: 12000
      })
    })

    if (!response.ok) {
      const error = await response.text()
      throw new Error(`API 请求失败: ${response.status} - ${error}`)
    }

    const data = await response.json()
    return data.choices[0].message.content
  } catch (error) {
    console.error('翻译失败:', error)
    throw error
  }
}

/**
 * 分块翻译长文本
 */
async function translateLongText(text: string): Promise<string> {
  const maxChunkSize = 3000

  if (text.length <= maxChunkSize) {
    return await translateText(text)
  }

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

  console.log(`📦 文本分为 ${chunks.length} 块进行翻译...\n`)

  const translatedChunks: string[] = []
  for (let i = 0; i < chunks.length; i++) {
    console.log(`🔄 翻译第 ${i + 1}/${chunks.length} 块...`)
    const translated = await translateText(chunks[i])
    translatedChunks.push(translated)

    if (i < chunks.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 1000))
    }
  }

  return translatedChunks.join('\n\n')
}

async function main() {
  console.log('\n🌍 Markdown 文件翻译工具')
  console.log('='.repeat(60))
  console.log(`📄 文件: ${fileName}`)
  console.log(`🎯 目标语言: ${langName} (${targetLocale})`)
  console.log('='.repeat(60) + '\n')

  // 源文件路径
  const sourceDir = path.join(process.cwd(), 'doc', 'en')
  const sourcePath = path.join(sourceDir, fileName)

  if (!fs.existsSync(sourcePath)) {
    console.error(`❌ 源文件不存在: ${sourcePath}`)
    process.exit(1)
  }

  // 读取源文件
  console.log('📖 读取源文件...')
  const sourceContent = fs.readFileSync(sourcePath, 'utf-8')
  console.log(`📏 文件大小: ${sourceContent.length} 字符\n`)

  // 翻译内容
  console.log(`🔄 开始翻译到 ${langName}...\n`)
  const translatedContent = await translateLongText(sourceContent)
  console.log('\n✅ 翻译完成\n')

  // 创建目标目录
  const targetDir = path.join(process.cwd(), 'doc', targetLocale)
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true })
    console.log(`📁 创建目录: ${targetDir}`)
  }

  // 保存翻译文件
  const targetPath = path.join(targetDir, fileName)
  fs.writeFileSync(targetPath, translatedContent, 'utf-8')
  console.log(`💾 保存文件: ${targetPath}`)

  console.log('\n' + '='.repeat(60))
  console.log('🎉 翻译成功完成!')
  console.log('='.repeat(60) + '\n')
}

main().catch((error) => {
  console.error('\n❌ 错误:', error)
  process.exit(1)
})
