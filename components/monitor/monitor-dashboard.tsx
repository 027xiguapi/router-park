'use client'

import { useTranslations, useLocale } from 'next-intl'
import { useState, useEffect } from 'react'

import { Watermark } from '@/components/watermark'
import { useMonitor } from '@/contexts/monitor-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

import { ServiceCard } from './service-card'
import { StatsCards } from './stats-cards'

import type { ServiceStatus } from './types'
import type { Router } from '@/lib/db/routers'

// 将 Router 数据转换为 ServiceStatus
function transformRouterToService(router: Router, locale: string): ServiceStatus {
  return {
    id: router.id,
    name: router.name,
    url: router.url,
    status: router.status,
    responseTime: router.responseTime,
    lastCheck: new Date(router.lastCheck).toLocaleTimeString(locale, { hour12: false }),
    inviteLink: router.inviteLink || undefined,
    likes: router.likes
  }
}

export function MonitorDashboard() {
  const t = useTranslations('monitor')
  const locale = useLocale()
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'latest' | 'my-likes' | 'most-liked'>('latest')
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString(locale, { hour12: false }))
  const { setRefreshMonitor } = useMonitor()

  // 临时用户ID（实际应用中应从认证系统获取）
  const TEMP_USER_ID = 'temp-user-123'

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
        const transformedServices = data.data.map((router: Router) =>
          transformRouterToService(router, locale)
        )
        setServices(transformedServices)
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

  return (
    <section className="dark:bg-background relative bg-gray-50 py-16" id="monitor">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="dark:text-foreground mb-2 text-3xl font-bold text-gray-900">{t('title')}</h2>
          <p className="dark:text-muted-foreground text-gray-600">{t('description')}</p>
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
