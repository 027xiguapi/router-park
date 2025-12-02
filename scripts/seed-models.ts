import { createDb } from '../lib/db'
import { models } from '../lib/db/schema'

// 模型数据定义
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

// 轻量级语言模型
const lightweightModels: ModelData[] = [
  {
    slug: 'gpt-4.1-nano',
    name: 'GPT-4.1 Nano',
    provider: 'openai',
    title: 'GPT-4.1 Nano - OpenAI 轻量级模型',
    description: 'OpenAI 推出的超轻量级模型，适合简单任务和快速响应场景',
    content: `# GPT-4.1 Nano

## 模型简介

GPT-4.1 Nano 是 OpenAI 推出的超轻量级语言模型，专为简单任务和快速响应场景设计。

## 特点

- **超快响应**: 毫秒级响应时间
- **低成本**: 相比完整版 GPT-4 成本大幅降低
- **高效率**: 适合大规模并发调用

## 适用场景

- 简单问答
- 文本分类
- 快速摘要
- 关键词提取

## 使用建议

适合对响应速度要求高、任务复杂度较低的场景。
`,
    status: 'active',
    contextWindow: 8192,
    maxOutputTokens: 4096,
    capabilities: ['text', 'fast-inference'],
    officialUrl: 'https://openai.com',
    sortOrder: 100
  },
  {
    slug: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'google',
    title: 'Gemini 2.5 Flash Lite - Google 轻量级模型',
    description: 'Google Gemini 系列的轻量级版本，提供快速且经济的 AI 能力',
    content: `# Gemini 2.5 Flash Lite

## 模型简介

Gemini 2.5 Flash Lite 是 Google 推出的轻量级多模态模型，在保持高性能的同时大幅降低延迟和成本。

## 特点

- **多模态支持**: 支持文本和图像理解
- **超低延迟**: 专为实时应用优化
- **成本效益**: 适合大规模部署

## 适用场景

- 实时聊天
- 图像描述
- 快速内容生成
- 边缘设备部署

## 技术规格

基于 Gemini 架构的精简版本，针对速度和效率进行了优化。
`,
    status: 'active',
    contextWindow: 32768,
    maxOutputTokens: 8192,
    capabilities: ['text', 'vision', 'fast-inference'],
    officialUrl: 'https://deepmind.google/technologies/gemini/',
    sortOrder: 99
  }
]

// Lexica 图像模型
const lexicaModels: ModelData[] = [
  {
    slug: 'lexica-v2',
    name: 'Lexica v2',
    provider: 'other',
    title: 'Lexica v2 - AI 图像生成模型',
    description: 'Lexica 第二代图像生成模型，提供高质量的艺术风格图像生成',
    content: `# Lexica v2

## 模型简介

Lexica v2 是 Lexica.art 推出的第二代图像生成模型，专注于艺术风格图像的生成。

## 特点

- **艺术风格**: 擅长生成具有艺术感的图像
- **高分辨率**: 支持生成高清图像
- **风格多样**: 支持多种艺术风格

## 适用场景

- 艺术创作
- 概念设计
- 插画生成
- 创意设计

## 使用提示

使用详细的艺术风格描述词可以获得更好的效果。
`,
    status: 'active',
    capabilities: ['image-generation', 'art-style'],
    officialUrl: 'https://lexica.art',
    sortOrder: 80
  },
  {
    slug: 'lexica-aperture',
    name: 'Lexica Aperture',
    provider: 'other',
    title: 'Lexica Aperture - 专业图像生成模型',
    description: 'Lexica 的旗舰图像生成模型，提供摄影级别的图像质量',
    content: `# Lexica Aperture

## 模型简介

Lexica Aperture 是 Lexica 的旗舰图像生成模型，以其出色的摄影风格图像生成能力著称。

## 特点

- **摄影级质量**: 生成的图像具有专业摄影质感
- **光影处理**: 出色的光影和色彩处理能力
- **细节丰富**: 高度精细的图像细节

## 适用场景

- 产品摄影
- 人像生成
- 风景图像
- 商业设计

## 技术亮点

采用先进的扩散模型技术，特别针对摄影风格进行了优化训练。
`,
    status: 'active',
    capabilities: ['image-generation', 'photography', 'high-quality'],
    officialUrl: 'https://lexica.art',
    sortOrder: 81
  }
]

// 大语言模型
const llmModels: ModelData[] = [
  {
    slug: 'gpt-5.1',
    name: 'GPT-5.1',
    provider: 'openai',
    title: 'GPT-5.1 - OpenAI 新一代旗舰模型',
    description: 'OpenAI 最新发布的 GPT-5 系列模型，具有更强的推理能力和知识广度',
    content: `# GPT-5.1

## 模型简介

GPT-5.1 是 OpenAI 推出的新一代旗舰语言模型，代表了当前 AI 技术的最高水平。

## 核心能力

- **超强推理**: 复杂逻辑推理能力显著提升
- **知识广度**: 涵盖更广泛的知识领域
- **长上下文**: 支持超长文本处理
- **多任务**: 出色的多任务处理能力

## 适用场景

- 复杂编程任务
- 学术研究辅助
- 专业文档撰写
- 高级数据分析

## 技术规格

采用全新的 Transformer 架构优化，大幅提升了训练效率和模型性能。
`,
    status: 'beta',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    capabilities: ['text', 'reasoning', 'coding', 'analysis'],
    officialUrl: 'https://openai.com',
    sortOrder: 200
  },
  {
    slug: 'gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    provider: 'google',
    title: 'Gemini 3 Pro Preview - Google 下一代多模态模型',
    description: 'Google Gemini 3 系列的预览版本，支持更强大的多模态理解能力',
    content: `# Gemini 3 Pro Preview

## 模型简介

Gemini 3 Pro Preview 是 Google 下一代多模态 AI 模型的预览版本。

## 核心能力

- **原生多模态**: 统一处理文本、图像、音频、视频
- **深度推理**: 增强的逻辑推理能力
- **代码生成**: 支持多种编程语言
- **实时交互**: 优化的响应速度

## 适用场景

- 多模态内容分析
- 视频理解和生成
- 复杂问题求解
- 创意内容创作

## 预览说明

当前为预览版本，部分功能可能会在正式版中调整。
`,
    status: 'beta',
    contextWindow: 200000,
    maxOutputTokens: 32768,
    capabilities: ['text', 'vision', 'audio', 'video', 'reasoning', 'coding'],
    officialUrl: 'https://deepmind.google/technologies/gemini/',
    sortOrder: 199
  },
  {
    slug: 'glm-4.5',
    name: 'GLM-4.5',
    provider: 'alibaba',
    title: 'GLM-4.5 - 智谱 AI 大语言模型',
    description: '智谱 AI 推出的新一代中文大语言模型，在中文理解和生成方面表现优异',
    content: `# GLM-4.5

## 模型简介

GLM-4.5 是智谱 AI 推出的新一代大语言模型，在中文处理方面具有显著优势。

## 核心能力

- **中文理解**: 出色的中文语义理解能力
- **长文本**: 支持超长上下文处理
- **工具调用**: 支持函数调用和工具使用
- **知识问答**: 丰富的中文知识库

## 适用场景

- 中文内容创作
- 客服对话系统
- 知识问答
- 文档分析

## 技术特点

基于 GLM 架构，针对中文语料进行了深度优化训练。
`,
    status: 'active',
    contextWindow: 128000,
    maxOutputTokens: 8192,
    capabilities: ['text', 'chinese', 'function-calling', 'long-context'],
    officialUrl: 'https://www.zhipuai.cn/',
    sortOrder: 150
  },
  {
    slug: 'glm-4.6',
    name: 'GLM-4.6',
    provider: 'alibaba',
    title: 'GLM-4.6 - 智谱 AI 最新大语言模型',
    description: '智谱 AI 最新版本的大语言模型，全面提升了各项能力指标',
    content: `# GLM-4.6

## 模型简介

GLM-4.6 是智谱 AI 的最新版本大语言模型，在 GLM-4.5 基础上进行了全面升级。

## 更新亮点

- **性能提升**: 推理速度和准确率全面提升
- **多模态**: 增强的图像理解能力
- **代码能力**: 更强的编程辅助能力
- **安全性**: 增强的内容安全过滤

## 适用场景

- 企业级应用
- 智能客服
- 内容审核
- 编程辅助

## 技术升级

采用最新的训练技术，模型参数和训练数据都有显著增加。
`,
    status: 'active',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    capabilities: ['text', 'vision', 'chinese', 'function-calling', 'coding'],
    officialUrl: 'https://www.zhipuai.cn/',
    sortOrder: 151
  },
  {
    slug: 'deepseek-v3.1',
    name: 'DeepSeek V3.1',
    provider: 'other',
    title: 'DeepSeek V3.1 - 深度求索大语言模型',
    description: 'DeepSeek 推出的高性能大语言模型，以优秀的性价比著称',
    content: `# DeepSeek V3.1

## 模型简介

DeepSeek V3.1 是深度求索公司推出的大语言模型，在保持高性能的同时提供极具竞争力的价格。

## 核心优势

- **高性价比**: 相同性能下成本更低
- **开源友好**: 支持开源社区
- **中英双语**: 优秀的中英文能力
- **代码生成**: 强大的编程能力

## 适用场景

- 日常对话
- 代码编写
- 内容创作
- 数据分析

## 技术特点

采用创新的 MoE (Mixture of Experts) 架构，实现了性能与效率的最佳平衡。
`,
    status: 'active',
    contextWindow: 64000,
    maxOutputTokens: 8192,
    capabilities: ['text', 'coding', 'chinese', 'english'],
    officialUrl: 'https://www.deepseek.com/',
    sortOrder: 180
  },
  {
    slug: 'deepseek-r1-0528',
    name: 'DeepSeek R1 0528',
    provider: 'other',
    title: 'DeepSeek R1 0528 - 深度推理模型',
    description: 'DeepSeek 的推理增强模型，专为复杂逻辑推理任务设计',
    content: `# DeepSeek R1 0528

## 模型简介

DeepSeek R1 0528 是 DeepSeek 推出的推理增强版本模型，在复杂逻辑推理方面表现出色。

## 核心能力

- **深度推理**: 多步骤逻辑推理能力
- **数学能力**: 高级数学问题求解
- **代码调试**: 复杂代码问题诊断
- **思维链**: 清晰的推理过程展示

## 适用场景

- 数学问题求解
- 逻辑推理任务
- 复杂编程问题
- 科学研究辅助

## 版本说明

0528 为 5 月 28 日发布的版本，包含最新的推理优化。
`,
    status: 'active',
    contextWindow: 64000,
    maxOutputTokens: 8192,
    capabilities: ['text', 'reasoning', 'math', 'coding'],
    officialUrl: 'https://www.deepseek.com/',
    sortOrder: 185
  },
  {
    slug: 'deepseek-v3.2',
    name: 'DeepSeek V3.2',
    provider: 'other',
    title: 'DeepSeek V3.2 - 深度求索最新大语言模型',
    description: 'DeepSeek 最新发布的 V3.2 版本，全面提升了模型能力',
    content: `# DeepSeek V3.2

## 模型简介

DeepSeek V3.2 是深度求索公司最新发布的大语言模型版本，在各项指标上都有显著提升。

## 更新内容

- **推理增强**: 整合了 R1 系列的推理优化
- **长上下文**: 支持更长的上下文窗口
- **多语言**: 增强的多语言支持
- **工具使用**: 更好的函数调用能力

## 适用场景

- 企业级部署
- 复杂任务处理
- 多语言应用
- API 集成

## 技术亮点

采用了最新的训练技术和更大规模的高质量数据集。
`,
    status: 'active',
    contextWindow: 128000,
    maxOutputTokens: 16384,
    capabilities: ['text', 'coding', 'reasoning', 'function-calling', 'multilingual'],
    officialUrl: 'https://www.deepseek.com/',
    sortOrder: 190
  }
]

// 图像生成模型 - Flux 系列
const fluxModels: ModelData[] = [
  {
    slug: 'flux',
    name: 'FLUX',
    provider: 'other',
    title: 'FLUX - 新一代图像生成模型',
    description: 'Black Forest Labs 推出的革命性图像生成模型，提供卓越的图像质量',
    content: `# FLUX

## 模型简介

FLUX 是 Black Forest Labs 推出的新一代图像生成模型，代表了 AI 图像生成的最新技术水平。

## 核心特点

- **高质量输出**: 生成的图像细节丰富、质量卓越
- **文本渲染**: 出色的图像内文字渲染能力
- **提示理解**: 精准的文本提示理解
- **多样风格**: 支持各种艺术风格

## 适用场景

- 创意设计
- 产品展示
- 艺术创作
- 营销素材

## 技术架构

基于 Rectified Flow Transformers 架构，实现了生成质量的显著提升。
`,
    status: 'active',
    capabilities: ['image-generation', 'text-rendering', 'high-quality'],
    officialUrl: 'https://blackforestlabs.ai/',
    sortOrder: 90
  },
  {
    slug: 'flux-realism',
    name: 'FLUX Realism',
    provider: 'other',
    title: 'FLUX Realism - 写实风格图像生成',
    description: 'FLUX 的写实风格版本，专注于生成逼真的照片级图像',
    content: `# FLUX Realism

## 模型简介

FLUX Realism 是 FLUX 模型的写实风格特化版本，专门针对照片级真实图像生成进行了优化。

## 特点

- **照片级真实**: 生成的图像几乎无法与真实照片区分
- **肤质细节**: 出色的人物肤质和毛发渲染
- **光影效果**: 自然的光影和反射效果
- **环境真实**: 逼真的背景和环境渲染

## 适用场景

- 人像摄影
- 产品图片
- 场景模拟
- 虚拟摄影

## 使用建议

使用详细的场景描述和光影指示可以获得最佳效果。
`,
    status: 'active',
    capabilities: ['image-generation', 'photorealistic', 'portrait'],
    officialUrl: 'https://blackforestlabs.ai/',
    sortOrder: 89
  },
  {
    slug: 'flux-anime',
    name: 'FLUX Anime',
    provider: 'other',
    title: 'FLUX Anime - 动漫风格图像生成',
    description: 'FLUX 的动漫风格版本，擅长生成高质量的动漫和插画风格图像',
    content: `# FLUX Anime

## 模型简介

FLUX Anime 专为动漫和插画风格图像生成而设计，能够创作出精美的二次元风格作品。

## 特点

- **多种画风**: 支持日漫、美漫等多种风格
- **人物设计**: 出色的角色设计能力
- **色彩鲜艳**: 丰富饱满的色彩表现
- **细节精致**: 精细的线条和阴影处理

## 适用场景

- 角色设计
- 插画创作
- 漫画制作
- 游戏美术

## 风格提示

可以通过添加具体的画风关键词来调整生成风格。
`,
    status: 'active',
    capabilities: ['image-generation', 'anime', 'illustration'],
    officialUrl: 'https://blackforestlabs.ai/',
    sortOrder: 88
  },
  {
    slug: 'flux-3d',
    name: 'FLUX 3D',
    provider: 'other',
    title: 'FLUX 3D - 3D 风格图像生成',
    description: 'FLUX 的 3D 渲染风格版本，生成具有立体感的 3D 效果图像',
    content: `# FLUX 3D

## 模型简介

FLUX 3D 专注于生成具有 3D 渲染效果的图像，适合需要立体感和深度的视觉内容。

## 特点

- **立体效果**: 逼真的 3D 渲染质感
- **材质表现**: 多种材质的准确呈现
- **光照模拟**: 物理级别的光照效果
- **深度感**: 出色的空间深度表现

## 适用场景

- 产品渲染
- 建筑可视化
- 游戏概念图
- 工业设计

## 技术说明

结合了先进的渲染技术知识，能够模拟各种 3D 渲染引擎的效果。
`,
    status: 'active',
    capabilities: ['image-generation', '3d-rendering', 'product-design'],
    officialUrl: 'https://blackforestlabs.ai/',
    sortOrder: 87
  },
  {
    slug: 'flux-pro',
    name: 'FLUX Pro',
    provider: 'other',
    title: 'FLUX Pro - 专业版图像生成模型',
    description: 'FLUX 的专业版本，提供最高质量的图像生成能力',
    content: `# FLUX Pro

## 模型简介

FLUX Pro 是 FLUX 系列的专业版本，为专业创作者和企业用户提供最高质量的图像生成服务。

## 专业特性

- **最高质量**: 业界领先的图像质量
- **商用授权**: 完整的商业使用权限
- **优先处理**: 更快的生成速度
- **高级功能**: 更多参数控制选项

## 适用场景

- 商业广告
- 品牌设计
- 专业出版
- 企业宣传

## 版本说明

Pro 版本提供更多的控制参数和更高的输出分辨率。
`,
    status: 'active',
    capabilities: ['image-generation', 'professional', 'high-resolution', 'commercial'],
    officialUrl: 'https://blackforestlabs.ai/',
    sortOrder: 95
  },
  {
    slug: 'any-dark',
    name: 'Any Dark',
    provider: 'other',
    title: 'Any Dark - 暗色风格图像生成',
    description: '专注于暗色调和神秘风格的图像生成模型',
    content: `# Any Dark

## 模型简介

Any Dark 是专注于暗色调和神秘风格图像生成的模型，擅长创作具有氛围感的暗色系作品。

## 特点

- **暗色美学**: 优秀的暗色调处理
- **氛围营造**: 出色的神秘氛围表现
- **光影对比**: 戏剧性的明暗对比
- **质感丰富**: 深邃的纹理细节

## 适用场景

- 恐怖主题
- 奇幻创作
- 夜景场景
- 艺术摄影

## 使用技巧

使用与黑暗、神秘相关的关键词可以获得最佳效果。
`,
    status: 'active',
    capabilities: ['image-generation', 'dark-theme', 'atmospheric'],
    officialUrl: 'https://blackforestlabs.ai/',
    sortOrder: 75
  },
  {
    slug: 'turbo',
    name: 'Turbo',
    provider: 'other',
    title: 'Turbo - 快速图像生成模型',
    description: '优化速度的图像生成模型，提供极快的生成速度',
    content: `# Turbo

## 模型简介

Turbo 是针对速度优化的图像生成模型，在保持良好质量的同时提供极快的生成速度。

## 特点

- **极速生成**: 秒级图像生成
- **批量处理**: 支持高效批量生成
- **质量平衡**: 速度与质量的最佳平衡
- **低延迟**: 适合实时应用

## 适用场景

- 实时预览
- 大批量生成
- 快速迭代
- 原型设计

## 性能说明

生成速度比标准版本快 3-5 倍，适合需要快速迭代的工作流程。
`,
    status: 'active',
    capabilities: ['image-generation', 'fast', 'batch-processing'],
    officialUrl: 'https://blackforestlabs.ai/',
    sortOrder: 70
  },
  {
    slug: 'flux-1.1-pro',
    name: 'FLUX 1.1 Pro',
    provider: 'other',
    title: 'FLUX 1.1 Pro - 增强版专业图像生成',
    description: 'FLUX Pro 的升级版本，提供更强大的图像生成能力',
    content: `# FLUX 1.1 Pro

## 模型简介

FLUX 1.1 Pro 是 FLUX Pro 的升级版本，在图像质量和功能上都有显著提升。

## 升级内容

- **质量提升**: 更精细的图像细节
- **更好的提示理解**: 更准确地理解复杂提示
- **新增风格**: 支持更多艺术风格
- **性能优化**: 更快的生成速度

## 适用场景

- 高端商业项目
- 艺术创作
- 广告制作
- 品牌视觉

## 版本特点

1.1 版本重点优化了人物生成和场景复杂度的处理能力。
`,
    status: 'active',
    capabilities: ['image-generation', 'professional', 'enhanced', 'high-quality'],
    officialUrl: 'https://blackforestlabs.ai/',
    sortOrder: 96
  },
  {
    slug: 'flux-kontext',
    name: 'FLUX Kontext',
    provider: 'other',
    title: 'FLUX Kontext - 上下文感知图像生成',
    description: 'FLUX 的上下文感知版本，能够保持图像间的一致性',
    content: `# FLUX Kontext

## 模型简介

FLUX Kontext 是具有上下文感知能力的图像生成模型，擅长在多张图像间保持风格和主体的一致性。

## 核心能力

- **一致性保持**: 多张图像间的风格统一
- **角色一致**: 同一角色在不同场景的一致呈现
- **风格迁移**: 将特定风格应用到新图像
- **序列生成**: 生成连贯的图像序列

## 适用场景

- 角色设计迭代
- 故事板制作
- 品牌视觉统一
- 连续场景创作

## 使用方法

通过上传参考图像来指导新图像的生成。
`,
    status: 'active',
    capabilities: ['image-generation', 'consistency', 'style-transfer', 'context-aware'],
    officialUrl: 'https://blackforestlabs.ai/',
    sortOrder: 92
  },
  {
    slug: 'flux-kontext-pro',
    name: 'FLUX Kontext Pro',
    provider: 'other',
    title: 'FLUX Kontext Pro - 专业上下文感知图像生成',
    description: 'FLUX Kontext 的专业版，提供更强大的一致性控制能力',
    content: `# FLUX Kontext Pro

## 模型简介

FLUX Kontext Pro 是 FLUX Kontext 的专业版本，为需要高度一致性的专业项目提供支持。

## 专业特性

- **精确控制**: 更精细的一致性参数控制
- **多参考图**: 支持多张参考图像输入
- **高级编辑**: 支持局部修改和调整
- **商业授权**: 完整商用权限

## 适用场景

- IP 角色开发
- 动画制作
- 游戏美术
- 品牌形象系统

## 技术优势

采用先进的特征提取和风格编码技术，实现前所未有的一致性控制。
`,
    status: 'active',
    capabilities: ['image-generation', 'professional', 'consistency', 'multi-reference'],
    officialUrl: 'https://blackforestlabs.ai/',
    sortOrder: 93
  }
]

// Stable Diffusion 系列模型
const sdModels: ModelData[] = [
  {
    slug: 'sd3',
    name: 'Stable Diffusion 3',
    provider: 'other',
    title: 'Stable Diffusion 3 - 新一代稳定扩散模型',
    description: 'Stability AI 推出的第三代稳定扩散模型，全面提升了图像生成质量',
    content: `# Stable Diffusion 3

## 模型简介

Stable Diffusion 3 (SD3) 是 Stability AI 推出的第三代图像生成模型，代表了开源图像生成的最新进展。

## 核心改进

- **全新架构**: 采用 Multimodal Diffusion Transformer
- **文字渲染**: 显著改进的图像内文字生成
- **提示理解**: 更准确的长提示处理
- **图像质量**: 全面提升的视觉质量

## 适用场景

- 创意设计
- 艺术创作
- 内容生成
- 研究开发

## 开源说明

SD3 提供多个版本，包括开源社区版和商业授权版。
`,
    status: 'active',
    capabilities: ['image-generation', 'text-rendering', 'open-source'],
    officialUrl: 'https://stability.ai/',
    sortOrder: 85
  },
  {
    slug: 'sd3.5-large',
    name: 'Stable Diffusion 3.5 Large',
    provider: 'other',
    title: 'SD 3.5 Large - 大规模稳定扩散模型',
    description: 'SD 3.5 的大规模版本，提供最高质量的图像生成',
    content: `# Stable Diffusion 3.5 Large

## 模型简介

Stable Diffusion 3.5 Large 是 SD3 系列的大规模版本，拥有更多参数和更强的生成能力。

## 模型特点

- **大规模参数**: 80 亿参数
- **顶级质量**: 业界领先的图像质量
- **复杂场景**: 出色的复杂场景处理
- **艺术表现**: 丰富的艺术风格支持

## 适用场景

- 专业创作
- 高端商业
- 艺术项目
- 研究探索

## 硬件要求

由于模型规模较大，建议使用高性能 GPU 进行推理。
`,
    status: 'active',
    capabilities: ['image-generation', 'high-quality', 'large-scale'],
    officialUrl: 'https://stability.ai/',
    sortOrder: 86
  },
  {
    slug: 'sd3.5-turbo',
    name: 'Stable Diffusion 3.5 Turbo',
    provider: 'other',
    title: 'SD 3.5 Turbo - 快速稳定扩散模型',
    description: 'SD 3.5 的速度优化版本，提供快速的图像生成',
    content: `# Stable Diffusion 3.5 Turbo

## 模型简介

Stable Diffusion 3.5 Turbo 是针对速度优化的 SD3.5 版本，在保持良好质量的同时大幅提升生成速度。

## 速度优势

- **4 步生成**: 仅需 4 个采样步骤
- **实时预览**: 支持实时图像预览
- **高效部署**: 适合生产环境部署
- **批量处理**: 支持高效批量生成

## 适用场景

- 实时应用
- 原型快速迭代
- 大规模生成
- 低延迟场景

## 技术说明

采用蒸馏技术，将生成步骤从数十步压缩到 4 步。
`,
    status: 'active',
    capabilities: ['image-generation', 'fast', 'turbo', 'real-time'],
    officialUrl: 'https://stability.ai/',
    sortOrder: 84
  },
  {
    slug: 'sdxl',
    name: 'Stable Diffusion XL',
    provider: 'other',
    title: 'SDXL - 高分辨率图像生成模型',
    description: 'Stability AI 的高分辨率图像生成模型，支持原生 1024x1024 分辨率',
    content: `# Stable Diffusion XL (SDXL)

## 模型简介

SDXL 是 Stability AI 推出的高分辨率图像生成模型，原生支持 1024x1024 分辨率输出。

## 核心特点

- **高分辨率**: 原生 1024x1024 输出
- **双模型架构**: Base + Refiner 两阶段生成
- **社区生态**: 丰富的 LoRA 和微调模型
- **广泛兼容**: 支持多种部署方式

## 适用场景

- 艺术创作
- 商业设计
- 内容生产
- 模型微调

## 生态系统

SDXL 拥有丰富的社区资源，包括大量的 LoRA、Checkpoint 和工具。
`,
    status: 'active',
    capabilities: ['image-generation', 'high-resolution', 'customizable'],
    officialUrl: 'https://stability.ai/',
    sortOrder: 82
  },
  {
    slug: 'sdxl-lightning',
    name: 'SDXL Lightning',
    provider: 'other',
    title: 'SDXL Lightning - 极速图像生成',
    description: 'SDXL 的极速版本，支持 1-4 步快速生成',
    content: `# SDXL Lightning

## 模型简介

SDXL Lightning 是 ByteDance 基于 SDXL 开发的极速版本，将生成步骤压缩到 1-4 步。

## 速度特点

- **单步生成**: 支持 1 步快速生成
- **极低延迟**: 毫秒级响应时间
- **质量保持**: 在高速下保持良好质量
- **灵活选择**: 1/2/4/8 步多种选择

## 适用场景

- 实时预览
- 交互式设计
- 大批量生成
- 边缘设备部署

## 技术原理

采用渐进式蒸馏技术，在保持图像质量的同时大幅减少推理步骤。
`,
    status: 'active',
    capabilities: ['image-generation', 'ultra-fast', 'low-latency', 'efficient'],
    officialUrl: 'https://stability.ai/',
    sortOrder: 83
  }
]

// 合并所有模型数据
const allModels: ModelData[] = [
  ...lightweightModels,
  ...lexicaModels,
  ...llmModels,
  ...fluxModels,
  ...sdModels
]

async function seedModels() {
  console.log('🌱 开始生成模型数据...\n')

  const db = createDb()

  let successCount = 0
  let errorCount = 0

  for (const modelData of allModels) {
    try {
      // 为中文和英文分别创建记录
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
  console.log(`- 模型总数: ${allModels.length} 个`)
  console.log('\n✨ 模型数据生成完成!')
}

// 执行脚本
seedModels().catch(console.error)
