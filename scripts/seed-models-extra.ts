import { createDb } from '../lib/db'
import { models } from '../lib/db/schema'

// 额外的模型数据
interface ModelData {
  slug: string
  name: string
  provider: 'openai' | 'anthropic' | 'google' | 'meta' | 'mistral' | 'alibaba' | 'baidu' | 'other'
  title: string
  description: string
  content: string
  status: 'active' | 'beta' | 'inactive' | 'deprecated'
  contextWindow?: number
  maxOutputTokens?: number
  capabilities?: string[]
  officialUrl?: string
  sortOrder?: number
}

const additionalModels: ModelData[] = [
  {
    slug: 'kimi',
    name: 'Kimi',
    provider: 'other',
    title: 'Kimi - 月之暗面长上下文大模型',
    description: '月之暗面推出的超长上下文大语言模型，支持 200 万字超长文本处理',
    content: `# Kimi

## 模型简介

Kimi 是月之暗面（Moonshot AI）推出的大语言模型，以其超长上下文处理能力著称，是国内首个支持 200 万字上下文的 AI 助手。

## 核心能力

- **超长上下文**: 支持处理 200 万字的超长文本
- **文档理解**: 出色的长文档分析和总结能力
- **联网搜索**: 支持实时联网获取最新信息
- **多轮对话**: 优秀的多轮对话记忆能力

## 适用场景

- 长文档阅读和分析
- 学术论文总结
- 代码仓库理解
- 会议记录整理
- 法律文件审阅

## 技术特点

采用创新的长上下文架构，突破了传统 Transformer 的上下文限制，能够高效处理超长文本而不丢失关键信息。

## 产品形态

- Kimi 智能助手（网页版/App）
- Moonshot API（开发者接口）

## 使用建议

特别适合需要处理大量文本资料的场景，如研究分析、文档审阅等。
`,
    status: 'active',
    contextWindow: 2000000,
    maxOutputTokens: 8192,
    capabilities: ['text', 'long-context', 'web-search', 'document-analysis', 'chinese'],
    officialUrl: 'https://kimi.moonshot.cn/',
    sortOrder: 175
  },
  {
    slug: 'doubao-1.6',
    name: '豆包 1.6',
    provider: 'other',
    title: '豆包 1.6 - 字节跳动大语言模型',
    description: '字节跳动推出的豆包大模型 1.6 版本，提供强大的对话和创作能力',
    content: `# 豆包 1.6

## 模型简介

豆包 1.6 是字节跳动推出的大语言模型最新版本，在对话、创作、推理等多个维度都有显著提升。

## 核心能力

- **智能对话**: 流畅自然的多轮对话体验
- **内容创作**: 支持多种风格的文案创作
- **代码能力**: 代码生成和解释能力
- **知识问答**: 丰富的知识储备

## 版本特点

1.6 版本相比之前版本的主要提升：
- 推理能力显著增强
- 中文理解更加准确
- 创作内容质量提升
- 响应速度优化

## 适用场景

- 日常对话助手
- 文案内容创作
- 知识问答
- 编程辅助
- 学习辅导

## 产品接入

- 豆包 App（移动端）
- 豆包网页版
- 火山引擎 API

## 技术架构

基于字节跳动自研的大模型架构，经过海量数据训练和人类反馈优化。
`,
    status: 'active',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    capabilities: ['text', 'creative-writing', 'coding', 'chinese', 'conversation'],
    officialUrl: 'https://www.doubao.com/',
    sortOrder: 160
  },
  {
    slug: 'qwen-max',
    name: 'Qwen-Max',
    provider: 'alibaba',
    title: 'Qwen-Max - 通义千问旗舰模型',
    description: '阿里云通义千问系列的旗舰模型，提供最强大的语言理解和生成能力',
    content: `# Qwen-Max

## 模型简介

Qwen-Max 是阿里云通义千问系列的旗舰版本，代表了阿里在大语言模型领域的最高技术水平。

## 核心能力

- **超强理解**: 复杂指令的精准理解
- **长文本处理**: 支持超长上下文
- **多语言**: 优秀的中英文及多语言能力
- **工具调用**: 强大的函数调用能力

## 模型优势

- **综合能力强**: 在多个评测榜单表现优异
- **中文优化**: 针对中文场景深度优化
- **企业级**: 适合企业级应用部署
- **生态完善**: 丰富的配套工具和服务

## 适用场景

- 企业智能客服
- 知识库问答
- 内容生成
- 数据分析
- 代码开发

## API 接入

通过阿里云灵积平台提供 API 服务，支持：
- 文本生成
- 多轮对话
- 函数调用
- 流式输出

## 定价说明

按 token 计费，提供免费额度供开发者测试。

## 相关模型

- Qwen-Plus: 性价比版本
- Qwen-Turbo: 快速响应版本
- Qwen-Long: 长上下文版本
`,
    status: 'active',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    capabilities: ['text', 'coding', 'function-calling', 'chinese', 'multilingual', 'reasoning'],
    officialUrl: 'https://tongyi.aliyun.com/',
    sortOrder: 170
  },
  {
    slug: 'qwen-plus',
    name: 'Qwen-Plus',
    provider: 'alibaba',
    title: 'Qwen-Plus - 通义千问增强版',
    description: '阿里云通义千问的增强版本，平衡了性能与成本',
    content: `# Qwen-Plus

## 模型简介

Qwen-Plus 是通义千问系列的增强版本，在保持高性能的同时提供更优的性价比。

## 核心特点

- **性能均衡**: 性能与成本的最佳平衡
- **响应快速**: 优化的推理速度
- **稳定可靠**: 适合生产环境部署
- **功能完整**: 支持完整的 API 功能

## 与 Qwen-Max 对比

| 特性 | Qwen-Plus | Qwen-Max |
|------|-----------|----------|
| 性能 | 高 | 最高 |
| 速度 | 更快 | 快 |
| 成本 | 更低 | 较高 |
| 适用 | 大多数场景 | 复杂场景 |

## 适用场景

- 日常对话应用
- 内容生成服务
- 智能客服系统
- 批量文本处理

## 使用建议

对于大多数应用场景，Qwen-Plus 能够提供足够好的效果，建议作为首选方案。
`,
    status: 'active',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    capabilities: ['text', 'coding', 'function-calling', 'chinese'],
    officialUrl: 'https://tongyi.aliyun.com/',
    sortOrder: 165
  },
  {
    slug: 'qwen-turbo',
    name: 'Qwen-Turbo',
    provider: 'alibaba',
    title: 'Qwen-Turbo - 通义千问快速版',
    description: '阿里云通义千问的快速版本，提供最快的响应速度',
    content: `# Qwen-Turbo

## 模型简介

Qwen-Turbo 是通义千问系列中响应速度最快的版本，专为需要低延迟的应用场景设计。

## 核心优势

- **极速响应**: 毫秒级首字延迟
- **高并发**: 支持大规模并发请求
- **低成本**: 最具性价比的选择
- **稳定性**: 99.9% 以上的服务可用性

## 适用场景

- 实时对话系统
- 流式输出应用
- 大批量处理任务
- 成本敏感型项目

## 技术特点

采用模型蒸馏和推理优化技术，在保持核心能力的同时大幅提升响应速度。

## 限制说明

- 复杂推理任务建议使用 Qwen-Max
- 超长文本建议使用 Qwen-Long
`,
    status: 'active',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    capabilities: ['text', 'fast-inference', 'chinese'],
    officialUrl: 'https://tongyi.aliyun.com/',
    sortOrder: 162
  },
  {
    slug: 'moonshot-v1',
    name: 'Moonshot v1',
    provider: 'other',
    title: 'Moonshot v1 - 月之暗面 API 模型',
    description: '月之暗面提供的 API 接口模型，支持开发者集成使用',
    content: `# Moonshot v1

## 模型简介

Moonshot v1 是月之暗面提供的 API 模型，为开发者提供了强大的语言模型能力接入。

## API 特性

- **长上下文**: 支持 8K/32K/128K 多种上下文长度
- **流式输出**: 支持 Server-Sent Events 流式响应
- **函数调用**: 支持 Function Calling 能力
- **兼容 OpenAI**: API 格式兼容 OpenAI

## 模型版本

- moonshot-v1-8k: 8K 上下文版本
- moonshot-v1-32k: 32K 上下文版本
- moonshot-v1-128k: 128K 上下文版本

## 适用场景

- 智能对话应用
- 文档处理服务
- 内容生成平台
- 企业知识库

## 接入方式

通过 Moonshot 开放平台注册获取 API Key，支持 RESTful API 调用。

## 定价

按 token 计费，不同上下文长度版本价格不同，128K 版本支持处理更长文档但成本更高。
`,
    status: 'active',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    capabilities: ['text', 'long-context', 'function-calling', 'streaming', 'chinese'],
    officialUrl: 'https://platform.moonshot.cn/',
    sortOrder: 172
  }
]

async function seedAdditionalModels() {
  console.log('🌱 开始添加额外模型数据...\n')

  const db = createDb()

  let successCount = 0
  let errorCount = 0

  for (const modelData of additionalModels) {
    try {
      const locales = ['zh', 'en']

      for (const locale of locales) {
        const insertData = {
          slug: modelData.slug,
          locale: locale,
          name: modelData.name,
          provider: modelData.provider,
          title: locale === 'zh' ? modelData.title : modelData.title.replace(/ - /g, ' | '),
          description: modelData.description,
          content: modelData.content,
          status: modelData.status,
          contextWindow: modelData.contextWindow || null,
          maxOutputTokens: modelData.maxOutputTokens || null,
          capabilities: modelData.capabilities ? JSON.stringify(modelData.capabilities) : null,
          officialUrl: modelData.officialUrl || null,
          sortOrder: modelData.sortOrder || 0,
          views: Math.floor(Math.random() * 1000),
          likes: Math.floor(Math.random() * 100),
          createdAt: new Date(),
          updatedAt: new Date()
        }

        await db.insert(models).values(insertData)
        console.log(`✅ 添加模型: ${modelData.name} (${locale})`)
        successCount++
      }
    } catch (error: any) {
      console.error(`❌ 添加模型失败: ${modelData.name}`, error.message)
      errorCount++
    }
  }

  console.log('\n📊 生成统计:')
  console.log(`- 成功: ${successCount} 条`)
  console.log(`- 失败: ${errorCount} 条`)
  console.log(`- 模型总数: ${additionalModels.length} 个`)
  console.log('\n✨ 额外模型数据添加完成!')
}

seedAdditionalModels().catch(console.error)
