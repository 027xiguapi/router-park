'use client'

import { useTranslations } from 'next-intl'
import { useState, useEffect } from 'react'

import { Watermark } from '@/components/watermark'
import { useMonitor } from '@/contexts/monitor-context'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useUser } from '@/contexts/user-context'
import { useRouter } from '@/i18n/navigation'

import { ServiceCard } from './service-card'
import { StatsCards } from './stats-cards'
import { MonitorPagination } from './monitor-pagination'
import { SearchBar } from './search-bar'

import type { ServiceStatus } from './types'
interface MonitorDashboardProps {
  locale: string
  currentPage: number
  pageSize?: number
  activeTab?: 'latest' | 'my-likes' | 'most-liked'
  searchQuery?: string
}

export function MonitorDashboard({ locale, currentPage, pageSize = 12, activeTab = 'latest', searchQuery = '' }: MonitorDashboardProps) {
  const t = useTranslations('monitor')
  const { isAuthenticated, showLoginModal, user } = useUser()
  const [services, setServices] = useState<ServiceStatus[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString(locale, { hour12: false }))
  const { setRefreshMonitor } = useMonitor()
  const router = useRouter()
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 12,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  })

  const loadServices = async (
  ) => {
    try {

      const tab = activeTab
      const search = searchQuery
      const page = currentPage
      setLoading(true)

      // 构建URL参数
      const params = new URLSearchParams()
      params.set('page', page.toString())
      params.set('pageSize', pageSize.toString())

      if (search.trim()) {
        params.set('search', search.trim())
      }

      if (tab === 'most-liked') {
        params.set('sortBy', 'likes')
      } else if (tab === 'my-likes') {
        if (!isAuthenticated) {
          showLoginModal()
          return
        }
        params.set('userId', user?.id || '')
        params.set('likedBy', 'true')
      } else {
        params.set('sortBy', 'latest')
      }

      const url = `/api/routers?${params.toString()}`
      const response = await fetch(url)
      const data = await response.json()

      if (data.success) {
        setServices(data.data)
        if (data.pagination) {
          setPagination(data.pagination)
        }
        setLastUpdate(new Date().toLocaleTimeString(locale, { hour12: false }))
      }
    } catch (error) {
      console.error('Error loading services:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadServices()
  }, [locale])

  // 当 URL 参数变化时重新加载数据
  useEffect(() => {
    loadServices()
  }, [activeTab, currentPage, searchQuery, pageSize])

  const handleSearch = (searchInput: string, tab?: 'latest' | 'my-likes' | 'most-liked', resetPage: boolean = true) => {
    const selectedTab = tab || activeTab
    const search = searchInput.trim()
    const page = resetPage ? 1 : currentPage

    const params = new URLSearchParams()
    params.set('page', page.toString())
    params.set('tab', selectedTab)

    if (search) {
      params.set('search', search)
    }

    router.push(`/router-monitor?${params.toString()}`)
  }

  // 计算统计数据
  const totalServices = pagination.total

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

        {/* 搜索栏 */}
        <SearchBar
          searchQuery={searchQuery}
          onSearch={(searchInput) => handleSearch(searchInput)}
          onRouterSubmitted={loadServices}
        />

        <Tabs
          value={activeTab}
          onValueChange={(value) => handleSearch(searchQuery, value as 'latest' | 'my-likes' | 'most-liked')}
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
                <p className="text-muted-foreground">
                  {searchQuery ? `未找到包含 "${searchQuery}" 的路由器` : '暂无路由器数据'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} t={t} />
                  ))}
                </div>

                {/* 分页组件 */}
                <div className="mt-8">
                  <MonitorPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                  />
                  {pagination.totalPages > 1 && (
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      第 {pagination.page} / {pagination.totalPages} 页，共 {pagination.total} 个结果
                    </div>
                  )}
                </div>
              </>
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
                <p className="text-muted-foreground">
                  {searchQuery ? `未找到包含 "${searchQuery}" 的点赞路由器` : '你还没有点赞任何路由器'}
                </p>
                {!searchQuery && (
                  <p className="text-sm text-muted-foreground mt-2">去"最新"或"点赞最多"标签页点赞你喜欢的路由器吧！</p>
                )}
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} t={t} />
                  ))}
                </div>

                {/* 分页组件 */}
                <div className="mt-8">
                  <MonitorPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                  />
                  {pagination.totalPages > 1 && (
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      第 {pagination.page} / {pagination.totalPages} 页，共 {pagination.total} 个结果
                    </div>
                  )}
                </div>
              </>
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
                <p className="text-muted-foreground">
                  {searchQuery ? `未找到包含 "${searchQuery}" 的路由器` : '暂无路由器数据'}
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {services.map((service) => (
                    <ServiceCard key={service.id} service={service} t={t} />
                  ))}
                </div>

                {/* 分页组件 */}
                <div className="mt-8">
                  <MonitorPagination
                    currentPage={pagination.page}
                    totalPages={pagination.totalPages}
                  />
                  {pagination.totalPages > 1 && (
                    <div className="mt-4 text-center text-sm text-muted-foreground">
                      第 {pagination.page} / {pagination.totalPages} 页，共 {pagination.total} 个结果
                    </div>
                  )}
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
      {/* 水印放在最上层 */}
      <Watermark text="routerpark" count={30} opacity={0.05} darkOpacity={0.05} rotate={-25} />
    </section>
  )
}
