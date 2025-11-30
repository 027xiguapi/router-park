import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { db } from '../lib/db'
import { posts } from '../lib/db/schema'
import { eq } from 'drizzle-orm'

// 从文件名生成 slug
function generateSlug(filename: string): string {
  // 移除 .md 扩展名
  const slug = filename.replace(/\.md$/, '')
  return slug
}

// 生成 excerpt（从内容中提取前150个字符）
function generateExcerpt(content: string): string {
  // 移除 Markdown 语法
  const plainText = content
    .replace(/#{1,6}\s+/g, '') // 移除标题标记
    .replace(/\*\*(.*?)\*\*/g, '$1') // 移除粗体标记
    .replace(/\*(.*?)\*/g, '$1') // 移除斜体标记
    .replace(/`(.*?)`/g, '$1') // 移除行内代码标记
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 移除链接，保留文本
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 移除图片
    .replace(/```[\s\S]*?```/g, '') // 移除代码块
    .replace(/^\s*[-*+]\s+/gm, '') // 移除列表标记
    .replace(/^\s*\d+\.\s+/gm, '') // 移除有序列表标记
    .replace(/^\s*>\s+/gm, '') // 移除引用标记
    .replace(/\n\s*\n/g, '\n') // 合并多个换行
    .trim()

  return plainText.length > 150 ? plainText.substring(0, 150) + '...' : plainText
}

// 提取封面图片 URL
function extractCoverImageUrl(content: string): string | undefined {
  // 查找第一个图片链接
  const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/
  const match = content.match(imageRegex)
  return match ? match[2] : undefined
}

async function importBlogs() {
  const blogDir = path.join(process.cwd(), 'blog', 'all', 'en')

  if (!fs.existsSync(blogDir)) {
    console.error('Blog directory not found:', blogDir)
    process.exit(1)
  }

  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'))

  console.log(`Found ${files.length} markdown files in blog/all/en directory`)

  let successCount = 0
  let skipCount = 0
  let errorCount = 0

  for (const file of files) {
    try {
      const filePath = path.join(blogDir, file)
      const fileContent = fs.readFileSync(filePath, 'utf-8')

      // 使用 gray-matter 解析 frontmatter
      const { data: frontmatter, content } = matter(fileContent)

      // 优先使用 frontmatter 中的 url 或 slug 字段，否则从文件名生成
      const slug = frontmatter.url || frontmatter.slug || generateSlug(file)

      // 检查是否已存在
      const existingPost = await db.select().from(posts).where(eq(posts.slug, slug)).limit(1)

      if (existingPost.length > 0) {
        console.log(`Skipping existing post: ${slug}`)
        skipCount++
        continue
      }

      // 从 frontmatter 或内容中提取数据
      const title = frontmatter.title || content.split('\n').find(line => line.startsWith('# '))?.replace('# ', '') || slug
      const excerpt = frontmatter.excerpt || generateExcerpt(content)
      const coverImageUrl = frontmatter.cover_image_url || frontmatter.coverImageUrl || extractCoverImageUrl(content)

      // 解析发布日期
      let publishedAt: number | undefined
      if (frontmatter.publishedAt) {
        publishedAt = new Date(frontmatter.publishedAt).getTime()
      } else if (frontmatter.date) {
        publishedAt = new Date(frontmatter.date).getTime()
      }

      const postData = {
        id: crypto.randomUUID(),
        slug,
        title,
        coverImageUrl: coverImageUrl || null,
        excerpt,
        content,
        publishedAt: publishedAt || null,
      }

      await db.insert(posts).values(postData)

      console.log(`✅ Imported: ${slug} - ${title}`)
      successCount++

    } catch (error) {
      console.error(`❌ Error importing ${file}:`, error)
      errorCount++
    }
  }

  console.log('\n=== Import Summary ===')
  console.log(`Total files: ${files.length}`)
  console.log(`Successfully imported: ${successCount}`)
  console.log(`Skipped (already exist): ${skipCount}`)
  console.log(`Errors: ${errorCount}`)
  console.log('=====================')

  if (errorCount > 0) {
    process.exit(1)
  }
}

// 运行导入
if (require.main === module) {
  importBlogs()
    .then(() => {
      console.log('Import completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('Import failed:', error)
      process.exit(1)
    })
}

export { importBlogs }