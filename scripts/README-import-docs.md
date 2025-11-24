# 文档批量导入工具

此脚本用于将 `doc` 文件夹中的 Markdown 文件批量导入到数据库中。

## 功能特性

- ✅ 自动解析 Markdown frontmatter (title, url)
- ✅ 从文件名自动提取标题（如果 frontmatter 中没有）
- ✅ 自动生成 SEO 友好的 slug
- ✅ 自动提取封面图片 URL（如果内容中有图片）
- ✅ 支持更新已存在的文档（基于 slug + locale）
- ✅ 所有文档的 locale 自动设置为 'zh'
- ✅ 详细的导入统计和错误报告

## Markdown 文件格式

支持两种格式：

### 格式 1：带 frontmatter

```markdown
---
title: "OpenCode Windows 安装指南"
url: "open-code-windows-config-guide"
scraped_at: "2025-11-23T05:22:43.090Z"
---

# OpenCode Windows 安装指南

文档内容...
```

### 格式 2：无 frontmatter

```markdown
# 文档标题

文档内容...
```

如果没有 frontmatter，脚本会：
- 从文件名提取标题
- 从文件名生成 slug

## 使用方法

### 1. 准备文档文件

将所有要导入的 Markdown 文件放入项目根目录的 `doc` 文件夹中：

```
router-park/
├── doc/
│   ├── 文档1.md
│   ├── 文档2.md
│   └── ...
```

### 2. 运行导入脚本

```bash
pnpm docs:import
```

或者直接运行：

```bash
tsx scripts/import-docs.ts
```

## 导入逻辑

1. **扫描文件**: 读取 `doc` 文件夹中所有 `.md` 文件
2. **解析内容**:
   - 解析 frontmatter (gray-matter)
   - 提取标题、URL/slug
   - 提取文档内容
   - 自动提取首张图片作为封面（可选）
3. **检查重复**:
   - 查询数据库是否存在相同 slug 和 locale 的文档
   - 如果存在，更新文档内容
   - 如果不存在，创建新文档
4. **保存到数据库**:
   - locale 固定为 'zh'
   - 自动设置 createdAt 和 updatedAt 时间戳

## 输出示例

```
🔍 正在扫描 doc 文件夹...
📚 找到 12 个 Markdown 文件

📄 处理: 控制台 - UniVibe-2025-11-24 14_03_00.md
   标题: OpenCode Windows 安装指南
   Slug: open-code-windows-config-guide
   ✅ 导入成功

📄 处理: 控制台 - UniVibe-2025-11-24 14_03_26.md
   标题: Claude Code 配置指南
   Slug: claude-code-config-guide
   ✅ 导入成功

...

==================================================
📊 导入统计:
   ✅ 新增: 10 个文档
   🔄 更新: 2 个文档
   ⏭️  跳过: 0 个文档
   ❌ 失败: 0 个文档
   📚 总计: 12 个文件
==================================================

✨ 导入完成!
```

## 数据库结构

导入的文档存储在 `docs` 表中，结构如下：

```typescript
{
  id: string              // UUID，自动生成
  slug: string            // URL 标识符，从 frontmatter.url 或文件名生成
  locale: string          // 固定为 'zh'
  coverImageUrl: string?  // 封面图片 URL（可选）
  title: string           // 文档标题
  content: string         // Markdown 内容
  createdAt: Date         // 创建时间
  updatedAt: Date         // 更新时间
}
```

## Slug 生成规则

1. 如果 frontmatter 中有 `url` 字段，使用该值
2. 否则，从文件名生成：
   - 移除 `.md` 扩展名
   - 移除时间戳部分 (如 `2025-11-24 14_03_00`)
   - 转换为小写
   - 空格和下划线转换为连字符
   - 移除非字母数字和连字符的字符
   - 合并多个连字符为一个

示例：
- `控制台 - UniVibe-2025-11-24 14_03_00.md` → `univibe`
- `OpenCode_Installation Guide.md` → `opencode-installation-guide`

## 注意事项

1. **重复检查**: 脚本会检查 slug + locale 的组合，如果已存在则更新而不是创建新记录
2. **错误处理**: 如果某个文件导入失败，脚本会继续处理其他文件，最后显示统计信息
3. **内容提取**: 会移除 frontmatter，只保存实际的 Markdown 内容
4. **时间戳**: 新文档会自动设置创建时间，更新文档会更新修改时间

## 故障排除

### 问题：找不到 doc 文件夹

确保项目根目录存在 `doc` 文件夹：

```bash
mkdir doc
```

### 问题：导入失败

检查：
1. 数据库连接是否正常
2. Markdown 文件格式是否正确
3. frontmatter 格式是否符合 YAML 规范

### 问题：slug 冲突

如果两个文件生成了相同的 slug，后导入的会覆盖先导入的。建议：
1. 在 frontmatter 中明确指定不同的 `url`
2. 或修改文件名确保唯一性

## 相关命令

- `pnpm docs:import` - 导入文档
- `pnpm db:studio` - 打开 Drizzle Studio 查看数据库
- 访问 `/[locale]/admin/docs` - 在后台管理界面查看/编辑文档
