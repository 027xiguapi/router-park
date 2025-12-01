import { NextRequest, NextResponse } from 'next/server'

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

// POST /v1/chat/completions - AI 聊天接口转发（支持多模型动态配置）
export async function POST(request: NextRequest) {
  try {
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

    // 验证 API Key
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

// GET /api/v1/chat/completions - 获取支持的模型列表
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
