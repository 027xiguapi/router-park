import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { createDb } from '@/lib/db'
import { docs } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'

interface DocFrontmatter {
  title: string
  url: string
  scraped_at?: string
}

/**
 * 从文件名提取标题（如果 frontmatter 中没有）
 */
function extractTitleFromFilename(filename: string): string {
  // 移除扩展名
  const nameWithoutExt = filename.replace(/\.md$/, '')
  // 移除时间戳部分（如：2025-11-24 14_03_00）
  const withoutTimestamp = nameWithoutExt.replace(/\s*-?\s*\d{4}-\d{2}-\d{2}\s+\d{2}_\d{2}_\d{2}$/, '')
  return withoutTimestamp.trim()
}

/**
 * 从 URL 或文件名生成 slug
 */
function generateSlug(url?: string, filename?: string): string {
  if (url) {
    return url
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  if (filename) {
    return filename
      .replace(/\.md$/, '')
      .toLowerCase()
      .replace(/[\s_]+/g, '-')
      .replace(/[^a-z0-9\-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')
  }

  return 'untitled'
}

/**
 * 读取并解析 Markdown 文件
 */
function parseMarkdownFile(filePath: string): {
  title: string
  slug: string
  content: string
  coverImageUrl?: string
} {
  const fileContent = fs.readFileSync(filePath, 'utf-8')
  const { data, content } = matter(fileContent)

  const frontmatter = data as DocFrontmatter
  const filename = path.basename(filePath)

  // 提取标题
  const title = frontmatter.title || extractTitleFromFilename(filename)

  // 生成 slug
  const slug = generateSlug(frontmatter.url, filename)

  // 提取封面图片 URL（如果内容中有图片）
  const imageMatch = content.match(/!\[.*?\]\((https?:\/\/[^\)]+)\)/)
  const coverImageUrl = imageMatch ? imageMatch[1] : undefined

  return {
    title,
    slug,
    content: content.trim(),
    coverImageUrl
  }
}

/**
 * 批量导入文档到数据库
 */
async function importDocs() {
  const db = createDb()
  const baseDocsDir = path.join(process.cwd(), 'doc')

  console.log('🔍 正在扫描 doc 文件夹...')

  // 检查 doc 目录是否存在
  if (!fs.existsSync(baseDocsDir)) {
    console.error(`❌ 错误: doc 文件夹不存在: ${baseDocsDir}`)
    process.exit(1)
  }

  // 读取所有语言文件夹（如 en, zh 等）
  const localeDirs = fs
    .readdirSync(baseDocsDir)
    .filter((item) => {
      const itemPath = path.join(baseDocsDir, item)
      return fs.statSync(itemPath).isDirectory()
    })

  if (localeDirs.length === 0) {
    console.log('⚠️  doc 文件夹中没有找到语言子文件夹')
    process.exit(0)
  }

  console.log(`🌍 找到 ${localeDirs.length} 个语言文件夹: ${localeDirs.join(', ')}\n`)

  let imported = 0
  let updated = 0
  let skipped = 0
  let errors = 0
  let totalFiles = 0

  // 遍历每个语言文件夹
  for (const localeDir of localeDirs) {
    const locale = localeDir // 文件夹名称即为 locale（如 en, zh）
    const docsDir = path.join(baseDocsDir, localeDir)

    console.log(`\n📂 处理语言: ${locale}`)
    console.log('─'.repeat(50))

    // 读取该语言文件夹下的所有 .md 文件
    const files = fs.readdirSync(docsDir).filter((file) => file.endsWith('.md'))

    if (files.length === 0) {
      console.log(`   ⚠️  ${locale} 文件夹中没有找到 Markdown 文件`)
      continue
    }

    console.log(`   📚 找到 ${files.length} 个 Markdown 文件\n`)
    totalFiles += files.length

    for (const file of files) {
      const filePath = path.join(docsDir, file)

      try {
        console.log(`   📄 处理: ${file}`)

        // 解析文件
        const { title, slug, content, coverImageUrl } = parseMarkdownFile(filePath)

        console.log(`      标题: ${title}`)
        console.log(`      Slug: ${slug}`)
        console.log(`      Locale: ${locale}`)

        // 检查文档是否已存在（相同 slug 和 locale）
        const existing = await db
          .select()
          .from(docs)
          .where(and(eq(docs.slug, slug), eq(docs.locale, locale)))
          .limit(1)

        if (existing.length > 0) {
          // 更新现有文档
          await db
            .update(docs)
            .set({
              title,
              content,
              coverImageUrl: coverImageUrl || null,
              updatedAt: new Date()
            })
            .where(eq(docs.id, existing[0].id))

          console.log(`      ✅ 更新成功\n`)
          updated++
        } else {
          // 插入新文档
          await db.insert(docs).values({
            slug,
            locale,
            title,
            content,
            coverImageUrl: coverImageUrl || null
          })

          console.log(`      ✅ 导入成功\n`)
          imported++
        }
      } catch (error) {
        console.error(`      ❌ 处理失败: ${error instanceof Error ? error.message : '未知错误'}\n`)
        errors++
      }
    }
  }

  // 打印统计信息
  console.log('\n' + '='.repeat(50))
  console.log('📊 导入统计:')
  console.log(`   ✅ 新增: ${imported} 个文档`)
  console.log(`   🔄 更新: ${updated} 个文档`)
  console.log(`   ⏭️  跳过: ${skipped} 个文档`)
  console.log(`   ❌ 失败: ${errors} 个文档`)
  console.log(`   📚 总计: ${totalFiles} 个文件`)
  console.log('='.repeat(50))

  if (errors > 0) {
    process.exit(1)
  }
}

// 执行导入
importDocs()
  .then(() => {
    console.log('\n✨ 导入完成!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 导入失败:', error)
    process.exit(1)
  })
