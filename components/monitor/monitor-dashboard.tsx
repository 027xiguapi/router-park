'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'

import { Watermark } from '@/components/watermark'
import { useMonitor } from '@/contexts/monitor-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { useUser } from '@/contexts/user-context'

import { ServiceCard } from './service-card'
import { StatsCards } from './stats-cards'

import type { ServiceStatus } from './types'
import type { Router } from '@/lib/db/routers'

export function MonitorDashboard() {
  const t = useTranslations('monitor')
  const locale = useLocale()
  const { toast } = useToast()
  const { isAuthenticated, showLoginModal, user } = useUser()
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'latest' | 'my-likes' | 'most-liked'>('latest')
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString(locale, { hour12: false }))
  const { setRefreshMonitor } = useMonitor()

  // Submit form state
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    inviteLink: ''
  })

  // 临时用户ID（实际应用中应从认证系统获取）
  const TEMP_USER_ID = user?.id || ''

  // 从数据库加载路由器数据
  const loadServices = async (tab: 'latest' | 'my-likes' | 'most-liked' = activeTab) => {
    try {
      setLoading(true)

      let url = '/api/routers'
      if (tab === 'most-liked') {
        url = '/api/routers?sortBy=likes'
      } else if (tab === 'my-likes') {
        url = `/api/routers?userId=${TEMP_USER_ID}&likedBy=true`
      }

      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setServices(data.data)
        setLastUpdate(new Date().toLocaleTimeString(locale, { hour12: false }))
      }
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadServices()
  }, [locale])

  // Tab 切换时重新加载数据
  useEffect(() => {
    loadServices(activeTab)
  }, [activeTab])

  // 计算统计数据
  const totalServices = services.length

  // 刷新函数
  const handleRefresh = async () => {
    await loadServices()
  }

  // 注册刷新函数到 Context
  useEffect(() => {
    setRefreshMonitor(() => handleRefresh)

    // 组件卸载时清除
    return () => {
      setRefreshMonitor(null)
    }
  }, [setRefreshMonitor])

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
          createdBy: TEMP_USER_ID
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
        // 刷新数据
        await loadServices()
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
    <section className="dark:bg-background relative bg-gray-50 py-16" id="monitor">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="dark:text-foreground mb-2 text-3xl font-bold text-gray-900">{t('title')}</h2>
          <p className="dark:text-muted-foreground text-gray-600">{t('description')}</p>
        </div>

        {/* 提交路由器按钮 */}
        <div className="mb-6 flex justify-center">
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

        <StatsCards totalServices={totalServices} lastUpdate={lastUpdate} t={t} />

        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as 'latest' | 'my-likes' | 'most-liked')}
          className="mt-8"
        >
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
            <TabsTrigger value="latest">最新</TabsTrigger>
            <TabsTrigger value="most-liked">点赞最多</TabsTrigger>
            <TabsTrigger value="my-likes">我的点赞</TabsTrigger>
          </TabsList>

          <TabsContent value="latest" className="mt-6">
            {loading && services.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="mt-4 text-muted-foreground">加载路由器数据中...</p>
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">暂无路由器数据</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} t={t} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="my-likes" className="mt-6">
            {loading && services.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="mt-4 text-muted-foreground">加载点赞数据中...</p>
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">你还没有点赞任何路由器</p>
                <p className="text-sm text-muted-foreground mt-2">去"最新"或"点赞最多"标签页点赞你喜欢的路由器吧！</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} t={t} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="most-liked" className="mt-6">
            {loading && services.length === 0 ? (
              <div className="flex justify-center items-center py-12">
                <div className="text-center">
                  <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                  <p className="mt-4 text-muted-foreground">加载热门路由器中...</p>
                </div>
              </div>
            ) : services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">暂无路由器数据</p>
              </div>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {services.map((service) => (
                  <ServiceCard key={service.id} service={service} t={t} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* 水印放在最上层 */}
      <Watermark text="routerpark" count={30} opacity={0.05} darkOpacity={0.05} rotate={-25} />
    </section>
  )
}
