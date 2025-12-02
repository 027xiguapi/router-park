'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Avatar } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
    Send,
    Image as ImageIcon,
    Loader2,
    User,
    Bot,
    X,
    Trash2,
    Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Markdown from 'markdown-to-jsx/react'

// 消息类型定义
interface Message {
    id: string
    role: 'user' | 'assistant'
    content: string
    images?: string[]
    timestamp: number
}

// 模型信息接口
interface ModelInfo {
    name: string
    provider: string
    slug: string
}

interface ModelChatProps {
    embedded?: boolean
}

const ModelChat = ({ embedded = false }: ModelChatProps) => {
    const params = useParams()
    const slug = params?.slug as string
    const locale = params?.locale as string

    // 状态管理
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [selectedImages, setSelectedImages] = useState<string[]>([])
    const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null)
    const [isLoadingModel, setIsLoadingModel] = useState(true)

    // Refs
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const textareaRef = useRef<HTMLTextAreaElement>(null)

    // 获取模型信息
    useEffect(() => {
        const fetchModelInfo = async () => {
            try {
                setIsLoadingModel(true)
                const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || ''
                const response = await fetch(`${baseUrl}/api/models/${slug}?locale=${locale}`)

                if (response.ok) {
                    const data = await response.json()
                    setModelInfo({
                        name: data.name,
                        provider: data.provider,
                        slug: data.slug
                    })
                }
            } catch (error) {
                console.error('Failed to fetch model info:', error)
            } finally {
                setIsLoadingModel(false)
            }
        }

        if (slug && locale) {
            fetchModelInfo()
        }
    }, [slug, locale])

    // 从 localStorage 加载对话历史
    useEffect(() => {
        if (slug) {
            const storageKey = `chat_history_${slug}`
            const savedMessages = localStorage.getItem(storageKey)

            if (savedMessages) {
                try {
                    setMessages(JSON.parse(savedMessages))
                } catch (error) {
                    console.error('Failed to parse saved messages:', error)
                }
            }
        }
    }, [slug])

    // 保存对话历史到 localStorage
    useEffect(() => {
        if (slug && messages.length > 0) {
            const storageKey = `chat_history_${slug}`
            localStorage.setItem(storageKey, JSON.stringify(messages))
        }
    }, [messages, slug])

    // 自动滚动到底部
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages])

    // 处理图片上传
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return

        Array.from(files).forEach(file => {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader()
                reader.onload = (event) => {
                    const result = event.target?.result as string
                    setSelectedImages(prev => [...prev, result])
                }
                reader.readAsDataURL(file)
            }
        })

        // 重置 input
        if (fileInputRef.current) {
            fileInputRef.current.value = ''
        }
    }

    // 移除选中的图片
    const removeImage = (index: number) => {
        setSelectedImages(prev => prev.filter((_, i) => i !== index))
    }

    // 发送消息
    const handleSendMessage = async () => {
        if (!input.trim() && selectedImages.length === 0) return
        if (isLoading) return

        // 创建用户消息
        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input,
            images: selectedImages.length > 0 ? [...selectedImages] : undefined,
            timestamp: Date.now()
        }

        // 添加用户消息
        setMessages(prev => [...prev, userMessage])

        // 清空输入
        setInput('')
        setSelectedImages([])

        // 开始加载
        setIsLoading(true)

        try {
            // 调用 API
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    model: slug,
                    stream: true
                })
            })

            if (!response.ok) {
                throw new Error('API request failed')
            }

            // 创建助手消息
            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '',
                timestamp: Date.now()
            }

            setMessages(prev => [...prev, assistantMessage])

            // 处理流式响应
            const reader = response.body?.getReader()
            const decoder = new TextDecoder()

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read()

                    if (done) break

                    const chunk = decoder.decode(value)
                    const lines = chunk.split('\n')

                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            const data = line.slice(6)

                            if (data === '[DONE]') {
                                break
                            }

                            try {
                                const parsed = JSON.parse(data)
                                const content = parsed.choices?.[0]?.delta?.content || ''

                                if (content) {
                                    setMessages(prev => {
                                        const newMessages = [...prev]
                                        const lastMessage = newMessages[newMessages.length - 1]
                                        if (lastMessage && lastMessage.role === 'assistant') {
                                            lastMessage.content += content
                                        }
                                        return newMessages
                                    })
                                }
                            } catch (e) {
                                // 忽略解析错误
                            }
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to send message:', error)

            // 添加错误消息
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: '抱歉,发生了错误。请稍后重试。',
                timestamp: Date.now()
            }

            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }

    // 清空对话历史
    const handleClearHistory = () => {
        if (window.confirm('确定要清空对话历史吗?')) {
            setMessages([])
            if (slug) {
                localStorage.removeItem(`chat_history_${slug}`)
            }
        }
    }

    // 处理键盘事件
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    if (isLoadingModel) {
        return (
            <div className={cn(
                "flex items-center justify-center",
                embedded ? "h-[400px]" : "min-h-screen bg-background"
            )}>
                <div className="flex items-center gap-2">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="text-muted-foreground">加载模型信息中...</span>
                </div>
            </div>
        )
    }

    return (
        <div className={cn(
            "flex flex-col",
            embedded
                ? "h-[600px] border rounded-lg overflow-hidden"
                : "min-h-screen bg-gradient-to-br from-background via-background to-muted/20"
        )}>
            {/* 顶部导航栏 */}
            <header className={cn(
                "border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60",
                embedded ? "sticky top-0 z-10" : "sticky top-0 z-50"
            )}>
                <div className={cn(
                    "flex items-center justify-between",
                    embedded ? "px-4 h-12" : "container mx-auto px-4 h-16"
                )}>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Bot className={cn("text-primary", embedded ? "h-5 w-5" : "h-6 w-6")} />
                            <div>
                                <h1 className={cn("font-bold", embedded ? "text-base" : "text-lg")}>
                                    {modelInfo?.name || slug}
                                </h1>
                                {modelInfo?.provider && !embedded && (
                                    <p className="text-xs text-muted-foreground">{modelInfo.provider}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="hidden sm:flex">
                            <Bot className="h-3 w-3 mr-1" />
                            AI 对话
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClearHistory}
                            title="清空对话历史"
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </header>

            {/* 聊天内容区 */}
            <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full">
                    <div className={cn(
                        "py-6",
                        embedded ? "px-4" : "container mx-auto max-w-4xl px-4"
                    )}>
                        {messages.length === 0 ? (
                            <div className={cn(
                                "flex flex-col items-center justify-center text-center",
                                embedded ? "h-[350px]" : "h-[calc(100vh-16rem)]"
                            )}>
                                <Bot className={cn(
                                    "text-muted-foreground/50 mb-4",
                                    embedded ? "h-12 w-12" : "h-16 w-16"
                                )} />
                                <h2 className={cn("font-bold mb-2", embedded ? "text-xl" : "text-2xl")}>开始对话</h2>
                                <p className={cn(
                                    "text-muted-foreground mb-6",
                                    embedded ? "text-sm max-w-sm" : "max-w-md"
                                )}>
                                    您可以发送文字或图片与 {modelInfo?.name || '模型'} 进行对话
                                </p>
                                <div className={cn(
                                    "grid gap-3 w-full",
                                    embedded ? "grid-cols-1 max-w-sm" : "grid-cols-1 sm:grid-cols-2 max-w-2xl"
                                )}>
                                    <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setInput('解释一下量子计算的基本原理')}>
                                        <p className="text-sm text-muted-foreground">💡 "解释一下量子计算的基本原理"</p>
                                    </Card>
                                    <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setInput('帮我写一个React组件')}>
                                        <p className="text-sm text-muted-foreground">🎨 "帮我写一个React组件"</p>
                                    </Card>
                                    {!embedded && (
                                        <>
                                            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setInput('分析这段代码的性能问题')}>
                                                <p className="text-sm text-muted-foreground">📝 "分析这段代码的性能问题"</p>
                                            </Card>
                                            <Card className="p-4 hover:bg-muted/50 cursor-pointer transition-colors" onClick={() => setInput('这张图片里有什么内容?')}>
                                                <p className="text-sm text-muted-foreground">🔍 "这张图片里有什么内容?"</p>
                                            </Card>
                                        </>
                                    )}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 pb-6">
                                {messages.map((message, index) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            'flex gap-4',
                                            message.role === 'user' ? 'justify-end' : 'justify-start'
                                        )}
                                    >
                                        {message.role === 'assistant' && (
                                            <Avatar className="h-8 w-8 shrink-0 bg-primary/10">
                                                <Bot className="h-5 w-5 text-primary" />
                                            </Avatar>
                                        )}

                                        <div
                                            className={cn(
                                                'max-w-[80%] rounded-lg px-4 py-3',
                                                message.role === 'user'
                                                    ? 'bg-primary text-primary-foreground'
                                                    : 'bg-muted'
                                            )}
                                        >
                                            {/* 图片 */}
                                            {message.images && message.images.length > 0 && (
                                                <div className="mb-2 grid grid-cols-2 gap-2">
                                                    {message.images.map((img, idx) => (
                                                        <img
                                                            key={idx}
                                                            src={img}
                                                            alt={`上传的图片 ${idx + 1}`}
                                                            className="rounded-lg max-h-48 object-cover"
                                                        />
                                                    ))}
                                                </div>
                                            )}

                                            {/* 文字内容 */}
                                            {message.content && (
                                                <div className={cn(
                                                    'prose prose-sm max-w-none',
                                                    message.role === 'user'
                                                        ? 'prose-invert'
                                                        : 'dark:prose-invert prose-headings:text-foreground prose-p:text-foreground'
                                                )}>
                                                    {message.role === 'assistant' ? (
                                                        <Markdown>{message.content}</Markdown>
                                                    ) : (
                                                        <p className="whitespace-pre-wrap">{message.content}</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* 时间戳 */}
                                            <div className={cn(
                                                'text-xs mt-1 opacity-70',
                                                message.role === 'user' ? 'text-right' : 'text-left'
                                            )}>
                                                {new Date(message.timestamp).toLocaleTimeString('zh-CN', {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </div>
                                        </div>

                                        {message.role === 'user' && (
                                            <Avatar className="h-8 w-8 shrink-0 bg-primary">
                                                <User className="h-5 w-5 text-primary-foreground" />
                                            </Avatar>
                                        )}
                                    </div>
                                ))}

                                {/* 加载指示器 */}
                                {isLoading && (
                                    <div className="flex gap-4 justify-start">
                                        <Avatar className="h-8 w-8 shrink-0 bg-primary/10">
                                            <Bot className="h-5 w-5 text-primary" />
                                        </Avatar>
                                        <div className="bg-muted rounded-lg px-4 py-3">
                                            <div className="flex items-center gap-2">
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                <span className="text-sm text-muted-foreground">正在思考...</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </div>

            {/* 输入区域 */}
            <div className="border-t border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className={cn(
                    "py-4",
                    embedded ? "px-4" : "container mx-auto max-w-4xl px-4"
                )}>
                    {/* 图片预览 */}
                    {selectedImages.length > 0 && (
                        <div className="mb-3 flex gap-2 flex-wrap">
                            {selectedImages.map((img, index) => (
                                <div key={index} className="relative group">
                                    <img
                                        src={img}
                                        alt={`预览 ${index + 1}`}
                                        className={cn(
                                            "object-cover rounded-lg border-2 border-border",
                                            embedded ? "h-16 w-16" : "h-20 w-20"
                                        )}
                                    />
                                    <button
                                        onClick={() => removeImage(index)}
                                        className="absolute -top-2 -right-2 p-1 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* 输入框 */}
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <Textarea
                                ref={textareaRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={embedded ? "输入消息..." : "输入消息... (Shift + Enter 换行)"}
                                className={cn(
                                    "resize-none pr-12",
                                    embedded ? "min-h-[44px] max-h-[120px]" : "min-h-[52px] max-h-[200px]"
                                )}
                                disabled={isLoading}
                            />

                            {/* 图片上传按钮 */}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="absolute right-2 bottom-2"
                                onClick={() => fileInputRef.current?.click()}
                                disabled={isLoading}
                            >
                                <ImageIcon className="h-5 w-5" />
                            </Button>

                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageUpload}
                            />
                        </div>

                        {/* 发送按钮 */}
                        <Button
                            onClick={handleSendMessage}
                            disabled={(!input.trim() && selectedImages.length === 0) || isLoading}
                            className={cn("px-6", embedded ? "h-[44px]" : "h-[52px]")}
                        >
                            {isLoading ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                        </Button>
                    </div>

                    {/* 提示文字 */}
                    {!embedded && (
                        <p className="text-xs text-muted-foreground mt-2 text-center">
                            对话内容将自动保存在浏览器中 · 按 Enter 发送,Shift + Enter 换行
                        </p>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ModelChat
