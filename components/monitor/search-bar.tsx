'use client'

import { useState, useEffect } from 'react'
import { Search, Plus } from 'lucide-react'
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group"
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/contexts/user-context'

interface SearchBarProps {
  searchQuery: string
  onSearch: (searchInput: string) => void
  onRouterSubmitted?: () => void
}

export function SearchBar({ searchQuery, onSearch, onRouterSubmitted }: SearchBarProps) {
  const { toast } = useToast()
  const { isAuthenticated, showLoginModal, user } = useUser()
  const [searchInput, setSearchInput] = useState(searchQuery)

  // Submit form state
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    inviteLink: ''
  })

  // 同步 searchQuery prop 到 searchInput state
  useEffect(() => {
    setSearchInput(searchQuery)
  }, [searchQuery])

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchInput(value)

    // 如果输入为空，立即清除搜索
    if (!value.trim()) {
      onSearch('')
    }
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onSearch(searchInput)
    }
  }

  const handleSearchClick = () => {
    onSearch(searchInput)
  }

  // 处理表单输入变化
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      inviteLink: ''
    })
  }

  // 提交新路由器
  const handleSubmitRouter = async () => {
    // 检查登录状态
    if (!isAuthenticated) {
      showLoginModal()
      return
    }

    // 表单验证
    if (!formData.name.trim() || !formData.url.trim()) {
      toast({
        title: "错误",
        description: "请填写必填字段（路由器名称和URL）",
        variant: "destructive"
      })
      return
    }

    // 简单的URL验证
    try {
      new URL(formData.url)
    } catch {
      toast({
        title: "错误",
        description: "请输入有效的URL地址",
        variant: "destructive"
      })
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('/api/routers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          url: formData.url.trim(),
          inviteLink: formData.inviteLink.trim() || null,
          createdBy: user?.id || null,
        })
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: "提交成功",
          description: "你的路由器已提交，等待验证后将显示在列表中"
        })
        setSubmitDialogOpen(false)
        resetForm()
        onRouterSubmitted?.()
      } else {
        toast({
          title: "提交失败",
          description: data.error || "提交过程中出现错误，请重试",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error submitting router:', error)
      toast({
        title: "提交失败",
        description: "网络错误，请检查连接后重试",
        variant: "destructive"
      })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="mt-6 flex justify-center">
      <div className="flex w-full max-w-sm items-center space-x-2">
        <InputGroup>
          <InputGroupInput placeholder="搜索路由器名称或网址..." value={searchInput} onChange={handleSearchInputChange} onKeyDown={handleSearchKeyDown} />
          <InputGroupAddon align="inline-end">
            <InputGroupButton variant="secondary" onClick={handleSearchClick}>搜索</InputGroupButton>
          </InputGroupAddon>
        </InputGroup>

        <div>
          <Dialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="mr-2 h-4 w-4" />
                提交网站
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>提交新路由器</DialogTitle>
                <DialogDescription>
                  分享你的路由器，让更多人发现和使用。提交后需要审核验证。
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="router-name">路由器名称 *</Label>
                  <Input
                    id="router-name"
                    placeholder="例如：OpenAI官方API"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="router-url">网站地址 *</Label>
                  <Input
                    id="router-url"
                    placeholder="例如：https://chatgpt.com/"
                    value={formData.url}
                    onChange={(e) => handleInputChange('url', e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="invite-link">邀请链接</Label>
                  <Input
                    id="invite-link"
                    placeholder="例如：https://example.com/invite?code=abc"
                    value={formData.inviteLink}
                    onChange={(e) => handleInputChange('inviteLink', e.target.value)}
                    disabled={submitting}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSubmitDialogOpen(false)
                      resetForm()
                    }}
                    disabled={submitting}
                    className="flex-1"
                  >
                    取消
                  </Button>
                  <Button
                    onClick={handleSubmitRouter}
                    disabled={submitting}
                    className="flex-1"
                  >
                    {submitting ? '提交中...' : '提交'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  )
}
