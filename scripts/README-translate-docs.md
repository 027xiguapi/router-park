# 文档翻译指南

本指南说明如何将数据库中的中文文档翻译成多种语言。

## 前置要求

1. **OpenAI API Key**: 需要设置环境变量 `OPENAI_API_KEY`
2. **API 基础 URL** (可选): 如果使用代理，设置 `OPENAI_BASE_URL`

### 环境变量配置

在项目根目录创建 `.env.local` 文件（如果还没有）：

```bash
# OpenAI API 配置
OPENAI_API_KEY=sk-your-api-key-here
OPENAI_BASE_URL=https://your-proxy-url.com/v1  # 可选，使用代理时配置
```

## 使用方法

### 方法 1: 批量翻译所有文档

翻译所有指定的文档到所有支持的语言：

```bash
pnpm docs:translate
```

这将翻译以下文档：
- open-code-windows-config-guide
- open-code-macos-config-guide
- open-code-linux-config-guide
- claude-code-windows-config-guide
- claude-code-macos-config-guide
- claude-code-linux-config-guide
- codex-windows-config-guide
- codex-macos-config-guide
- codex-linux-config-guide
- github-copilot-vscode-config-guide
- cursor-config-guide
- cline-vscode

翻译到以下语言：
- 🇬🇧 English (en)
- 🇯🇵 日本語 (ja)
- 🇰🇷 한국어 (ko)
- 🇪🇸 Español (es)
- 🇫🇷 Français (fr)
- 🇩🇪 Deutsch (de)
- 🇮🇹 Italiano (it)
- 🇷🇺 Русский (ru)
- 🇵🇹 Português (pt)
- 🇸🇦 العربية (ar)
- 🇮🇳 हिन्दी (hi)

**注意**:
- 批量翻译需要较长时间（约 12 × 11 = 132 个文档）
- 会产生 API 调用费用
- 脚本会自动添加延迟避免 API 限流

### 方法 2: 翻译单个文档

翻译指定的文档到指定语言：

```bash
pnpm docs:translate-one <slug> <locale>
```

**示例**：

```bash
# 翻译 Claude Code Windows 配置指南到英语
pnpm docs:translate-one claude-code-windows-config-guide en

# 翻译 Cursor 配置指南到日语
pnpm docs:translate-one cursor-config-guide ja

# 翻译 OpenCode Linux 配置指南到法语
pnpm docs:translate-one open-code-linux-config-guide fr
```

## 翻译规则

翻译脚本使用 GPT-4o-mini 模型，遵循以下规则：

1. ✅ 保留所有 Markdown 格式（标题、列表、代码块、链接等）
2. ✅ 保持代码块、URL 和技术术语不变
3. ✅ 维持相同的结构和布局
4. ✅ 使用自然的目标语言表达
5. ✅ 品牌名称和产品名称保持原样（如 "Claude Code", "OpenCode", "Cursor"）
6. ✅ 命令行指令和代码保持英文
7. ✅ 如果代码块中有注释，翻译注释内容

## 工作流程

### 完整的文档多语言化流程

1. **准备中文文档**
   ```bash
   # 将 Markdown 文件放到 doc/ 目录
   pnpm docs:import
   ```

2. **翻译文档**
   ```bash
   # 批量翻译（耗时较长）
   pnpm docs:translate

   # 或者逐个翻译
   pnpm docs:translate-one claude-code-windows-config-guide en
   pnpm docs:translate-one claude-code-windows-config-guide ja
   # ... 依次翻译其他语言
   ```

3. **验证翻译结果**
   - 启动开发服务器: `pnpm dev`
   - 访问不同语言版本:
     - `/en/docs/claude-code-windows-config-guide`
     - `/ja/docs/claude-code-windows-config-guide`
     - `/fr/docs/claude-code-windows-config-guide`

## 数据库结构

翻译后的文档存储在 `docs` 表中：

```sql
- id: 唯一标识
- slug: 文档标识符（相同 slug 不同 locale 表示同一文档的不同语言版本）
- locale: 语言代码（zh, en, ja, ko, 等）
- title: 文档标题（已翻译）
- content: 文档内容（已翻译）
- coverImageUrl: 封面图片 URL
- createdAt: 创建时间
- updatedAt: 更新时间
```

## 修改翻译配置

### 添加/删除要翻译的文档

编辑 `scripts/translate-docs.ts`：

```typescript
const docsToTranslate = [
  'your-new-doc-slug',  // 添加新文档
  'another-doc-slug',
  // ...
]
```

### 添加/删除目标语言

编辑 `scripts/translate-docs.ts`：

```typescript
const locales = [
  { code: 'en', name: 'English' },
  { code: 'ja', name: '日本語' },
  // 添加新语言...
]
```

### 调整翻译模型

编辑 `translateText` 函数中的模型参数：

```typescript
model: 'gpt-4o-mini',  // 改为 'gpt-4o' 或其他模型
temperature: 0.3,      // 调整创造性（0-1）
max_tokens: 8000       // 调整最大输出长度
```

## 故障排查

### 问题 1: API Key 错误

```
Error: OPENAI_API_KEY 环境变量未设置
```

**解决**: 在 `.env.local` 中设置 `OPENAI_API_KEY`

### 问题 2: 未找到中文文档

```
⚠️ 未找到中文原文，跳过
```

**解决**:
1. 确保中文文档已导入: `pnpm docs:import`
2. 检查 slug 是否正确
3. 检查数据库中是否有该文档（locale='zh'）

### 问题 3: API 限流

```
翻译 API 请求失败: 429
```

**解决**:
- 脚本已内置延迟机制
- 如果仍然超限，可增加延迟时间
- 或分批次翻译（使用 `docs:translate-one`）

### 问题 4: 翻译质量不佳

**解决**:
1. 调整 `temperature` 参数（降低更保守，提高更创造）
2. 修改 system prompt 提供更详细的指示
3. 使用更强大的模型（gpt-4o）

## 成本估算

使用 GPT-4o-mini:
- 输入: $0.15 / 1M tokens
- 输出: $0.60 / 1M tokens

估算（每篇文档约 3000 字）:
- 单篇文档单语言: 约 $0.01 - $0.02
- 12 篇文档 × 11 种语言 = 132 次翻译: 约 $1.50 - $2.00

使用 GPT-4o 会贵约 10-20 倍。

## 最佳实践

1. **先测试单个文档**: 使用 `docs:translate-one` 先翻译一个文档验证效果
2. **分批次翻译**: 不要一次性翻译所有，可以按语言或按文档分批
3. **人工校验**: 翻译完成后应人工检查关键文档的翻译质量
4. **版本控制**: 重要修改后重新翻译相关文档
5. **增量更新**: 文档更新后只翻译修改的部分

## 示例工作流

```bash
# 1. 导入新文档
pnpm docs:import

# 2. 测试翻译一个文档到英语
pnpm docs:translate-one claude-code-windows-config-guide en

# 3. 检查翻译质量
# 访问 http://localhost:7000/en/docs/claude-code-windows-config-guide

# 4. 如果满意，翻译该文档到其他语言
pnpm docs:translate-one claude-code-windows-config-guide ja
pnpm docs:translate-one claude-code-windows-config-guide ko
# ... 继续其他语言

# 5. 或直接批量翻译所有
pnpm docs:translate
```

## 维护建议

- 定期检查翻译质量
- 更新文档时同步更新所有语言版本
- 对于频繁修改的文档，考虑手动维护翻译
- 收集用户反馈改进翻译规则
