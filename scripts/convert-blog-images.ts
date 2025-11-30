import fs from 'fs'
import path from 'path'

const OSS_BASE_URL = 'https://oss.routerpark.com'

/**
 * 转换 markdown 文件中的图片路径
 * 将 /blog/xxx/image.png 转换为 https://oss.routerpark.com/blog/xxx/image.png
 */
function convertImagePaths(content: string): string {
  // 匹配 Markdown 图片语法: ![alt text](/blog/...)
  // 以及 HTML img 标签: <img src="/blog/..." />

  // 转换 Markdown 图片: ![...](...) 格式
  let convertedContent = content.replace(
    /!\[([^\]]*)\]\((\/blog\/[^)]+)\)/g,
    (match, alt, path) => {
      const newPath = `${OSS_BASE_URL}${path}`
      return `![${alt}](${newPath})`
    }
  )

  // 转换 HTML img 标签: <img src="/blog/..." />
  convertedContent = convertedContent.replace(
    /<img\s+([^>]*?)src="(\/blog\/[^"]+)"([^>]*?)>/g,
    (match, before, path, after) => {
      const newPath = `${OSS_BASE_URL}${path}`
      return `<img ${before}src="${newPath}"${after}>`
    }
  )

  // 转换 HTML img 标签单引号版本: <img src='/blog/...' />
  convertedContent = convertedContent.replace(
    /<img\s+([^>]*?)src='(\/blog\/[^']+)'([^>]*?)>/g,
    (match, before, path, after) => {
      const newPath = `${OSS_BASE_URL}${path}`
      return `<img ${before}src='${newPath}'${after}>`
    }
  )

  return convertedContent
}

/**
 * 处理单个文件
 */
function processFile(filePath: string): { success: boolean; changes: number } {
  try {
    const content = fs.readFileSync(filePath, 'utf-8')
    const convertedContent = convertImagePaths(content)

    // 计算更改次数
    const originalMatches = content.match(/\/blog\/[^)"\s]+/g) || []
    const changes = originalMatches.length

    if (changes > 0) {
      fs.writeFileSync(filePath, convertedContent, 'utf-8')
      return { success: true, changes }
    }

    return { success: true, changes: 0 }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error)
    return { success: false, changes: 0 }
  }
}

/**
 * 主函数
 */
async function convertAllImages() {
  const blogDir = path.join(process.cwd(), 'blog', 'all', 'en')

  if (!fs.existsSync(blogDir)) {
    console.error(`❌ Directory not found: ${blogDir}`)
    process.exit(1)
  }

  console.log('🔍 开始转换图片路径...\n')
  console.log('=' .repeat(60))
  console.log(`📂 目录: ${blogDir}`)
  console.log(`🌐 OSS URL: ${OSS_BASE_URL}`)
  console.log('=' .repeat(60))

  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md'))
  console.log(`\n📚 找到 ${files.length} 个 Markdown 文件\n`)

  let totalChanges = 0
  let successCount = 0
  let errorCount = 0
  let modifiedFiles = 0

  for (const file of files) {
    const filePath = path.join(blogDir, file)
    const result = processFile(filePath)

    if (result.success) {
      successCount++
      if (result.changes > 0) {
        modifiedFiles++
        totalChanges += result.changes
        console.log(`✅ ${file} - 转换了 ${result.changes} 个图片链接`)
      }
    } else {
      errorCount++
      console.log(`❌ ${file} - 处理失败`)
    }
  }

  console.log('\n' + '=' .repeat(60))
  console.log('📊 转换统计:')
  console.log(`   ✅ 成功处理: ${successCount} 个文件`)
  console.log(`   📝 修改文件: ${modifiedFiles} 个文件`)
  console.log(`   🖼️  转换图片: ${totalChanges} 个链接`)
  console.log(`   ❌ 处理失败: ${errorCount} 个文件`)
  console.log('=' .repeat(60))

  if (errorCount > 0) {
    console.log('\n⚠️  部分文件处理失败，请检查错误信息')
    process.exit(1)
  } else {
    console.log('\n✨ 全部转换完成!')
  }
}

// 运行转换
convertAllImages()
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 转换失败:', error)
    process.exit(1)
  })
