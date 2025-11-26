# Markdown 文件翻译工具

这个工具用于将 `doc/en` 文件夹中的 Markdown 文件翻译成多种语言。

## 功能特点

- ✅ 自动翻译所有 Markdown 文件
- ✅ 支持 11 种语言（日语、韩语、西班牙语、法语、德语、意大利语、俄语、葡萄牙语、阿拉伯语、印地语）
- ✅ 保留 Markdown 格式、代码块、链接和图片
- ✅ 智能分块处理长文档
- ✅ API 限流保护

## 支持的语言

| 语言代码 | 语言名称 |
|---------|---------|
| `ja` | 日本語 |
| `ko` | 한국어 |
| `es` | Español |
| `fr` | Français |
| `de` | Deutsch |
| `it` | Italiano |
| `ru` | Русский |
| `pt` | Português |
| `ar` | العربية |
| `hi` | हिन्दी |

## 环境配置

在使用之前，需要配置 GMI API：

```bash
# .env.local 文件
GMI_API_KEY=your_api_key_here
```

或者在运行时设置环境变量：

**Windows (PowerShell):**
```powershell
$env:GMI_API_KEY = "your_api_key_here"
```

**macOS/Linux:**
```bash
export GMI_API_KEY="your_api_key_here"
```

## 使用方法

### 1. 翻译所有文件（批量翻译）

将 `doc/en` 文件夹中的所有 Markdown 文件翻译成所有支持的语言：

```bash
pnpm markdown:translate
```

这会：
- 读取 `doc/en` 目录下的所有 `.md` 文件
- 翻译到 11 种语言
- 自动创建对应的语言目录（`doc/ja`, `doc/ko`, `doc/es` 等）
- 保存翻译后的文件

### 2. 翻译单个文件

翻译单个 Markdown 文件到指定语言：

```bash
pnpm markdown:translate-one <文件名> <语言代码>
```

**示例：**

```bash
# 翻译到日语
pnpm markdown:translate-one "控制台 - UniVibe-2025-11-24 14_03_00.md" ja

# 翻译到韩语
pnpm markdown:translate-one "控制台 - UniVibe-2025-11-24 14_03_00.md" ko

# 翻译到西班牙语
pnpm markdown:translate-one "控制台 - UniVibe-2025-11-24 14_03_00.md" es
```

## 翻译规则

翻译工具会：

✅ **保留的内容：**
- Markdown 格式（标题、列表、引用等）
- 代码块和命令行指令
- URL 和文件路径
- 图片引用和链接
- HTML 标签
- 品牌名称（Claude Code、OpenCode、Cursor 等）

✅ **翻译的内容：**
- 正文内容
- 标题文本
- 代码注释（如果存在）

## 输出目录结构

```
doc/
├── en/           # 英文原文
├── zh/           # 中文（已存在）
├── ja/           # 日语（翻译后）
├── ko/           # 韩语（翻译后）
├── es/           # 西班牙语（翻译后）
├── fr/           # 法语（翻译后）
├── de/           # 德语（翻译后）
├── it/           # 意大利语（翻译后）
├── ru/           # 俄语（翻译后）
├── pt/           # 葡萄牙语（翻译后）
├── ar/           # 阿拉伯语（翻译后）
└── hi/           # 印地语（翻译后）
```

## 性能优化

- **分块翻译**: 长文档（>3000字符）会自动分块处理
- **API 限流保护**: 每次请求之间有 1-2 秒延迟
- **错误处理**: 失败的翻译会记录并继续处理其他文件
- **模型**: 使用 DeepSeek-Prover-V2-671B 模型，提供高质量翻译

## 注意事项

1. **API 成本**: 使用 `deepseek-ai/DeepSeek-Prover-V2-671B` 模型，批量翻译会产生费用
2. **翻译时间**: 批量翻译可能需要较长时间，取决于文件数量和大小
3. **文件覆盖**: 如果目标语言文件已存在，会被覆盖
4. **网络连接**: 需要稳定的网络连接到 GMI API

## 故障排除

### 问题：`GMI_API_KEY 环境变量未设置`

**解决方案**：确保已设置环境变量或在 `.env.local` 文件中配置

### 问题：API 请求失败

**解决方案**：
- 检查 API key 是否正确
- 检查网络连接到 `api.gmi-serving.com`
- 检查 API 账户余额

### 问题：翻译质量不佳

**解决方案**：
- 可以在脚本中调整 `temperature` 参数（当前为 0）
- 可以修改翻译提示词（`systemPrompt`）
- 可以调整 `max_tokens` 参数（当前为 12000）

## 开发者信息

### 脚本位置

- 批量翻译: `scripts/translate-markdown-files.ts`
- 单文件翻译: `scripts/translate-markdown-single.ts`

### 自定义修改

可以根据需要修改脚本中的：
- `SOURCE_LOCALE`: 源语言（默认 `en`）
- `locales`: 支持的语言列表
- `maxChunkSize`: 分块大小（默认 3000 字符）
- 翻译提示词
- 使用的 AI 模型（当前为 `deepseek-ai/DeepSeek-Prover-V2-671B`）
- `temperature`: 翻译创造性（当前为 0，更确定性）
- `max_tokens`: 最大输出令牌数（当前为 12000）
