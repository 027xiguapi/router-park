'use client'

import { useState, useEffect } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Send, User } from 'lucide-react'
import Markdown from 'markdown-to-jsx/react'
import { useUser } from '@/contexts/user-context'
import { formatDate } from '@/lib/utils'
import {useTranslations} from "next-intl";

interface Comment {
  id: string
  content: string
  likes: number
  createdAt: Date
  updatedAt: Date
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface ProxyCommentsProps {
  slug: string
  t: (key: string) => string
}

export function ProxyComments({ slug}: ProxyCommentsProps) {
  const t = useTranslations("comments")
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { isAuthenticated, showLoginModal, user } = useUser()

  // 获取评论列表
  useEffect(() => {
    fetchComments()
  }, [slug])

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/proxy/${slug}/comments`)
      const data = await response.json()
      if (data.success) {
        setComments(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!isAuthenticated) {
      showLoginModal()
      return
    }

    if (!newComment.trim()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/proxy/${slug}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content: newComment })
      })

      const data = await response.json()

      if (data.success) {
        setComments([data.data, ...comments])
        setNewComment('')
      } else {
        alert(data.error || t('submitError'))
      }
    } catch (error) {
      console.error('Failed to submit comment:', error)
      alert(t('submitError'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mt-8 sm:mt-12">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl sm:text-2xl">
            <MessageSquare className="h-5 w-5 sm:h-6 sm:w-6" />
            {t('title')} ({length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* 评论输入表单 */}
          <form onSubmit={handleSubmit} className="mb-6 sm:mb-8">
            <div className="space-y-3">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={
                  isAuthenticated
                    ? t('placeholder')
                    : t('loginRequired')
                }
                className="min-h-[100px] resize-y"
                disabled={!isAuthenticated || isSubmitting}
                maxLength={5000}
              />
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  {t('markdownSupport')}
                </p>
                <div className="flex items-center gap-2">
                  {newComment.length > 0 && (
                    <span className="text-xs text-muted-foreground">
                      {newComment.length}/5000
                    </span>
                  )}
                  <Button
                    type="submit"
                    disabled={!isAuthenticated || isSubmitting || !newComment.trim()}
                    size="sm"
                    className="gap-1.5"
                  >
                    <Send className="h-4 w-4" />
                    {isSubmitting ? t('submitting') : t('submit')}
                  </Button>
                </div>
              </div>
              {!isAuthenticated && (
                <p className="text-sm text-muted-foreground">
                  {t('loginHint')}{' '}
                  <button
                    type="button"
                    onClick={showLoginModal}
                    className="text-primary hover:underline font-medium"
                  >
                    {t('loginLink')}
                  </button>
                </p>
              )}
            </div>
          </form>

          {/* 评论列表 */}
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              {t('common.loading')}
            </div>
          ) : length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground">{t('noComments')}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t('beFirst')}
              </p>
            </div>
          ) : (
            <div className="space-y-4 sm:space-y-6">
              {map((comment) => (
                <div
                  key={comment.id}
                  className="border border-border rounded-lg p-4 sm:p-5 hover:border-primary/30 transition-colors"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    {/* 用户头像 */}
                    <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0">
                      {comment.user.image ? (
                        <AvatarImage
                          src={comment.user.image}
                          alt={comment.user.name || 'User'}
                        />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-primary">
                          <User className="h-4 w-4 sm:h-5 sm:w-5" />
                        </AvatarFallback>
                      )}
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      {/* 用户名和时间 */}
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm sm:text-base">
                            {comment.user.name || t('anonymousUser')}
                          </span>
                        </div>
                        <time className="text-xs sm:text-sm text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </time>
                      </div>

                      {/* 评论内容（Markdown 渲染） */}
                      <div className="prose prose-sm dark:prose-invert max-w-none
                        prose-p:text-foreground
                        prose-p:leading-relaxed
                        prose-a:text-primary
                        prose-a:no-underline
                        hover:prose-a:underline
                        prose-strong:text-foreground
                        prose-code:text-primary
                        prose-code:bg-muted
                        prose-code:px-1.5
                        prose-code:py-0.5
                        prose-code:rounded
                        prose-code:before:content-none
                        prose-code:after:content-none
                        prose-pre:bg-muted
                        prose-pre:border
                        prose-pre:border-border
                        prose-ul:list-disc
                        prose-ol:list-decimal
                        prose-li:text-foreground
                      ">
                        <Markdown>{comment.content}</Markdown>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
