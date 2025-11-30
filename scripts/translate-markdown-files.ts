import fs from 'fs'
import path from 'path'

// 支持的语言列表
const locales = [
  { code: 'en', name: 'English', dir: 'ltr' },
]

// 源语言和目标语言
const SOURCE_LOCALE = 'zh'
const SOURCE_DIR = path.join(process.cwd(), 'blog', SOURCE_LOCALE)

/**
 * 使用 GMI API 翻译文本
 */
async function translateText(text: string, targetLang: string, langName: string): Promise<string> {
  const apiKey = process.env.GMI_API_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjA5MGFmODg0LWMxZmEtNGE2Ny1iMTBjLWZlZmE3ZjNhYWJkNCIsInR5cGUiOiJpZV9tb2RlbCJ9.efB4z3rv39Ul1CWH6OCwyb2tc26ZBJEbX_o9vdEZT_g"

  if (!apiKey) {
    throw new Error('GMI_API_KEY 环境变量未设置')
  }

  const systemPrompt = `You are a professional technical document translator. Translate the following technical documentation from Chinese to ${langName}.

Rules:
1. Preserve all Markdown formatting (headers, lists, code blocks, links, images, etc.)
2. Keep code blocks, URLs, file paths, and technical commands unchanged
3. Maintain the same structure and layout
4. Use natural ${langName} expressions for technical documentation
5. Keep brand names and product names in their original form (e.g., "Claude Code", "OpenCode", "Cursor", "UniVibe")
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
        model: 'deepseek-ai/DeepSeek-V3.1',
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
 * 翻译单个文件
 */
async function translateFile(
  filePath: string,
  fileName: string,
  targetLocale: string,
  langName: string
): Promise<boolean> {
  console.log(`\n📄 翻译文件: ${fileName} -> ${langName} (${targetLocale})`)

  try {
    // 读取源文件
    const sourceContent = fs.readFileSync(filePath, 'utf-8')
    console.log(`   文件大小: ${sourceContent.length} 字符`)

    // 翻译内容
    const translatedContent = await translateLongText(sourceContent, targetLocale, langName)

    // 创建目标目录
    const targetDir = path.join(process.cwd(), 'blog', targetLocale)
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true })
      console.log(`   ✅ 创建目录: ${targetDir}`)
    }

    // 写入翻译后的文件
    const targetPath = path.join(targetDir, fileName)
    fs.writeFileSync(targetPath, translatedContent, 'utf-8')
    console.log(`   ✅ 保存成功: ${targetPath}`)

    return true
  } catch (error) {
    console.error(`   ❌ 翻译失败:`, error instanceof Error ? error.message : '未知错误')
    return false
  }
}

/**
 * 获取所有 markdown 文件
 */
function getMarkdownFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) {
    throw new Error(`源目录不存在: ${dir}`)
  }

  const files = fs.readdirSync(dir)
  return files.filter((file) => file.endsWith('.md'))
}

/**
 * 主函数：批量翻译文件
 */
async function translateAllFiles() {
  console.log('🌍 开始批量翻译 Markdown 文件\n')
  console.log('=' .repeat(60))
  console.log(`📂 源目录: ${SOURCE_DIR}`)
  console.log(`🔤 源语言: 中文 (${SOURCE_LOCALE})`)
  console.log('=' .repeat(60))

  // 获取所有 markdown 文件
  const markdownFiles = getMarkdownFiles(SOURCE_DIR)
  console.log(`\n📚 找到 ${markdownFiles.length} 个 Markdown 文件`)

  if (markdownFiles.length === 0) {
    console.log('⚠️  没有找到需要翻译的文件')
    return
  }

  // 显示文件列表
  markdownFiles.forEach((file, index) => {
    console.log(`   ${index + 1}. ${file}`)
  })

  // 目标语言（排除源语言）
  const targetLocales = locales.filter((l) => l.code !== SOURCE_LOCALE)

  console.log(`\n🎯 目标语言: ${targetLocales.map((l) => l.name).join(', ')}`)
  console.log(`📊 预计任务: ${markdownFiles.length} 个文件 × ${targetLocales.length} 种语言 = ${markdownFiles.length * targetLocales.length} 个任务`)
  console.log('=' .repeat(60))

  let totalTranslated = 0
  let totalFailed = 0

  for (const fileName of markdownFiles) {
    const filePath = path.join(SOURCE_DIR, fileName)
    console.log(`\n📖 处理文件: ${fileName}`)
    console.log('-'.repeat(60))

    for (const locale of targetLocales) {
      try {
        const success = await translateFile(filePath, fileName, locale.code, locale.name)
        if (success) {
          totalTranslated++
        } else {
          totalFailed++
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
  console.log(`   📚 总计: ${markdownFiles.length * targetLocales.length} 个任务`)
  console.log('='.repeat(60))

  if (totalFailed > 0) {
    console.log('\n⚠️  部分翻译失败，请检查错误信息')
    process.exit(1)
  }
}

// 执行翻译
translateAllFiles()
  .then(() => {
    console.log('\n✨ 翻译完成!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 翻译失败:', error)
    process.exit(1)
  })
