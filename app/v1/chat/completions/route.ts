import { NextRequest, NextResponse } from 'next/server'

import { createDb } from '@/lib/db'
import { validateApiKey, incrementApiKeyUsage } from '@/lib/db/api-keys'
import { findModelConfig, getDefaultConfig, getAllSupportedModels } from '@/lib/models-config'

// 定义请求体类型
interface ChatCompletionMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

interface ChatCompletionRequest {
  model: string
  messages: ChatCompletionMessage[]
  temperature?: number
  max_tokens?: number
  top_p?: number
  stream?: boolean
  [key: string]: unknown
}

// 从请求头中提取 Bearer Token
function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader) {
    return null
  }

  const parts = authHeader.split(' ')
  if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
    return null
  }

  return parts[1]
}

// 获取客户端 IP 地址
function getClientIp(request: NextRequest): string {
  // 尝试从各种 header 中获取真实 IP
  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    // x-forwarded-for 可能包含多个 IP，取第一个
    return forwardedFor.split(',')[0].trim()
  }

  const realIp = request.headers.get('x-real-ip')
  if (realIp) {
    return realIp
  }

  // 如果都没有，返回默认值
  return '127.0.0.1'
}

// POST /v1/chat/completions - AI 聊天接口转发（支持多模型动态配置）
export async function POST(request: NextRequest) {
  const db = createDb()
  let validatedApiKey: { id: string } | null = null

  try {
    // 1. 验证 Authorization Header
    const token = extractBearerToken(request)
    if (!token) {
      return NextResponse.json(
        {
          error: {
            message: 'Missing or invalid Authorization header. Expected: Bearer sk-...',
            type: 'authentication_error',
            code: 'missing_api_key'
          }
        },
        { status: 401 }
      )
    }

    // 验证 token 格式
    if (!token.startsWith('sk-')) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid API key format. API key must start with "sk-"',
            type: 'authentication_error',
            code: 'invalid_api_key_format'
          }
        },
        { status: 401 }
      )
    }

    // 解析请求体
    const body = (await request.json()) as ChatCompletionRequest

    // 验证必填字段
    if (!body.model || !body.messages || !Array.isArray(body.messages)) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid request body. "model" and "messages" are required.',
            type: 'invalid_request_error',
            code: 'invalid_body'
          }
        },
        { status: 400 }
      )
    }

    // 验证 messages 格式
    for (const msg of body.messages) {
      if (!msg.role || !msg.content) {
        return NextResponse.json(
          {
            error: {
              message: 'Each message must have "role" and "content" fields.',
              type: 'invalid_request_error',
              code: 'invalid_message_format'
            }
          },
          { status: 400 }
        )
      }
    }

    // 2. 验证 API Key（包括模型限制和 IP 白名单）
    const clientIp = getClientIp(request)
    const validation = await validateApiKey(db, token, body.model, clientIp)

    if (!validation.valid) {
      return NextResponse.json(
        {
          error: {
            message: validation.error || 'API key validation failed',
            type: 'authentication_error',
            code: 'invalid_api_key'
          }
        },
        { status: 401 }
      )
    }

    // 保存验证通过的 API Key ID 用于后续更新使用量
    validatedApiKey = validation.apiKey ? { id: validation.apiKey.id } : null

    // 根据模型名称查找配置
    let modelConfig = await findModelConfig(body.model)

    // 如果找不到配置，使用默认配置
    if (!modelConfig) {
      console.warn(`Model "${body.model}" not found in config, using default config`)
      modelConfig = await getDefaultConfig()

      // 如果没有任何配置
      if (!modelConfig) {
        const supportedModels = await getAllSupportedModels()
        return NextResponse.json(
          {
            error: {
              message: `No model configurations available. Please add configurations in admin panel.`,
              type: 'invalid_request_error',
              code: 'no_config',
              supported_models: supportedModels
            }
          },
          { status: 500 }
        )
      }
    }

    // 验证模型配置的 API Key
    if (!modelConfig.apiKey) {
      return NextResponse.json(
        {
          error: {
            message: `API key not configured for provider "${modelConfig.provider}"`,
            type: 'invalid_request_error',
            code: 'api_key_missing'
          }
        },
        { status: 500 }
      )
    }

    // 准备转发请求
    const forwardHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${modelConfig.apiKey}`
    }

    console.log(`Forwarding request to ${modelConfig.provider} (${modelConfig.name}) for model: ${body.model}`)

    // 转发请求
    const response = await fetch(modelConfig.apiUrl, {
      method: 'POST',
      headers: forwardHeaders,
      body: JSON.stringify(body)
    })

    // 检查响应类型
    const contentType = response.headers.get('content-type')

    // 处理流式响应
    if (
      body.stream ||
      contentType?.includes('text/plain') ||
      contentType?.includes('text/event-stream') ||
      contentType?.includes('application/stream')
    ) {
      // 流式响应时也要更新使用量（使用估算值）
      if (validatedApiKey) {
        // 对于流式响应，使用输入 tokens 的估算值
        const estimatedTokens = JSON.stringify(body.messages).length / 4
        await incrementApiKeyUsage(db, validatedApiKey.id, Math.ceil(estimatedTokens))
      }

      return new Response(response.body, {
        status: response.status,
        headers: {
          'Content-Type': contentType || 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive'
        }
      })
    }

    // 处理 JSON 响应
    const data = await response.json()

    // 如果上游 API 返回错误
    if (!response.ok) {
      return NextResponse.json(
        {
          error: {
            message: data.error?.message || 'Upstream API error',
            type: data.error?.type || 'api_error',
            code: data.error?.code || 'upstream_error',
            provider: modelConfig.provider
          }
        },
        { status: response.status }
      )
    }

    // 3. 请求成功后更新 API Key 使用量
    if (validatedApiKey) {
      // 从响应中获取实际使用的 tokens
      const usedTokens = data.usage?.total_tokens || 0
      await incrementApiKeyUsage(db, validatedApiKey.id, usedTokens)
    }

    // 返回成功响应
    return NextResponse.json(data)
  } catch (error) {
    console.error('Error in chat completions API:', error)

    // 处理网络错误
    if (error instanceof TypeError && error.message.includes('fetch')) {
      return NextResponse.json(
        {
          error: {
            message: 'Failed to connect to upstream API',
            type: 'network_error',
            code: 'connection_failed'
          }
        },
        { status: 503 }
      )
    }

    // 处理 JSON 解析错误
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: {
            message: 'Invalid JSON in request body',
            type: 'invalid_request_error',
            code: 'invalid_json'
          }
        },
        { status: 400 }
      )
    }

    // 其他错误
    return NextResponse.json(
      {
        error: {
          message: error instanceof Error ? error.message : 'Internal server error',
          type: 'internal_error',
          code: 'unknown_error'
        }
      },
      { status: 500 }
    )
  }
}

// GET /v1/chat/completions - 获取支持的模型列表
export async function GET() {
  try {
    const supportedModels = await getAllSupportedModels()
    return NextResponse.json({
      success: true,
      data: {
        models: supportedModels,
        total: supportedModels.length
      }
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get models list'
      },
      { status: 500 }
    )
  }
}
