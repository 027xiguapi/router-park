"use client"

import { useEffect, useState, useMemo } from "react"
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, Search, ArrowUpDown, ArrowUp, ArrowDown, ExternalLink } from "lucide-react"

interface Router {
  id: string
  name: string
  url: string
  status: "online" | "offline"
  responseTime: number
  lastCheck: string
  inviteLink?: string | null
  isVerified: boolean
  likes: number
  createdBy?: string | null
  createdByName?: string | null
  createdByImage?: string | null
  updatedBy?: string | null
  createdAt: string
  updatedAt: string
  isLikedByCurrentUser?: boolean
}

type SortField = "name" | "likes" | "createdAt" | "status" | "routerCount"
type SortOrder = "asc" | "desc"

// 合并后的路由器数据
interface MergedRouter {
  domain: string // 域名
  name: string // 使用第一个记录的名称
  urls: string[] // 所有 URL
  mainUrl: string // 主 URL（最短的或根域名）
  status: "online" | "offline"
  totalLikes: number // 累加的点赞数
  routerCount: number // 该域名下的路由器数量
  isVerified: boolean
  createdByName?: string | null
  createdAt: string
  originalRouters: Router[] // 保留原始数据
}

// 提取域名的辅助函数
function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url)
    return urlObj.hostname
  } catch {
    return url
  }
}

// 合并相同域名的路由器
function mergeRoutersByDomain(routers: Router[]): MergedRouter[] {
  const domainMap = new Map<string, Router[]>()

  // 按域名分组
  routers.forEach((router) => {
    const domain = extractDomain(router.url)
    if (!domainMap.has(domain)) {
      domainMap.set(domain, [])
    }
    domainMap.get(domain)!.push(router)
  })

  // 合并每个域名下的路由器
  const merged: MergedRouter[] = []
  domainMap.forEach((routerGroup, domain) => {
    // 累加点赞数
    const totalLikes = routerGroup.reduce((sum, r) => sum + r.likes, 0)

    // 收集所有 URL，并找到最短的作为主 URL
    const urls = routerGroup.map((r) => r.url)
    const mainUrl = urls.reduce((shortest, current) =>
      current.length < shortest.length ? current : shortest
    )

    // 使用第一个记录的基本信息
    const firstRouter = routerGroup[0]

    // 检查是否有在线的
    const hasOnline = routerGroup.some((r) => r.status === "online")

    // 检查是否有认证的
    const hasVerified = routerGroup.some((r) => r.isVerified)

    // 使用最新的创建时间
    const latestCreatedAt = routerGroup
      .map((r) => new Date(r.createdAt).getTime())
      .reduce((latest, current) => Math.max(latest, current), 0)

    merged.push({
      domain,
      name: firstRouter.name,
      urls,
      mainUrl,
      status: hasOnline ? "online" : "offline",
      totalLikes,
      routerCount: routerGroup.length,
      isVerified: hasVerified,
      createdByName: firstRouter.createdByName,
      createdAt: new Date(latestCreatedAt).toISOString(),
      originalRouters: routerGroup,
    })
  })

  return merged
}

export function APIProvidersTable() {
  const [routers, setRouters] = useState<Router[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortField, setSortField] = useState<SortField>("createdAt")
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc")
  const [mergeByDomain, setMergeByDomain] = useState(true) // 默认开启合并

  // 获取数据
  useEffect(() => {
    async function fetchRouters() {
      try {
        const response = await fetch("/api/routers")
        const result = await response.json()
        if (result.success) {
          setRouters(result.data)
        }
      } catch (error) {
        console.error("Failed to fetch routers:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRouters()
  }, [])

  // 计算创建者统计
  const creatorStats = useMemo(() => {
    const stats = new Map<string, number>()
    routers.forEach((router) => {
      const creatorId = router.createdBy || "unknown"
      stats.set(creatorId, (stats.get(creatorId) || 0) + 1)
    })
    return stats
  }, [routers])

  // 过滤和排序数据
  const filteredAndSortedRouters = useMemo(() => {
    let filtered = routers

    // 搜索过滤
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase()
      filtered = filtered.filter(
        (router) =>
          router.name.toLowerCase().includes(lowerSearch) ||
          router.url.toLowerCase().includes(lowerSearch) ||
          router.createdByName?.toLowerCase().includes(lowerSearch)
      )
    }

    // 如果启用域名合并
    if (mergeByDomain) {
      const merged = mergeRoutersByDomain(filtered)

      // 排序合并后的数据
      const sorted = [...merged].sort((a, b) => {
        let aValue: any
        let bValue: any

        switch (sortField) {
          case "name":
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
          case "likes":
            aValue = a.totalLikes
            bValue = b.totalLikes
            break
          case "createdAt":
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
          case "status":
            aValue = a.status
            bValue = b.status
            break
          case "routerCount":
            aValue = a.routerCount
            bValue = b.routerCount
            break
          default:
            return 0
        }

        if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
        if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
        return 0
      })

      return sorted
    }

    // 不合并时的排序
    const sorted = [...filtered].sort((a, b) => {
      let aValue: any
      let bValue: any

      switch (sortField) {
        case "name":
          aValue = a.name.toLowerCase()
          bValue = b.name.toLowerCase()
          break
        case "likes":
          aValue = a.likes
          bValue = b.likes
          break
        case "createdAt":
          aValue = new Date(a.createdAt).getTime()
          bValue = new Date(b.createdAt).getTime()
          break
        case "status":
          aValue = a.status
          bValue = b.status
          break
        case "routerCount":
          aValue = 1
          bValue = 1
          break
        default:
          return 0
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1
      return 0
    })

    return sorted
  }, [routers, searchTerm, sortField, sortOrder, mergeByDomain])

  // 切换排序
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortOrder("desc")
    }
  }

  // 导出 CSV
  const handleExportCSV = () => {
    const headers = mergeByDomain
      ? ["序号", "网站名称", "域名", "主 URL", "所有 URL", "点赞数", "链接数量", "状态", "创建者", "创建数", "创建时间"]
      : ["序号", "网站名称", "网站地址", "点赞数", "状态", "创建者", "创建数", "创建时间"]

    const csvData = mergeByDomain
      ? (filteredAndSortedRouters as MergedRouter[]).map((router, index) => [
          index + 1,
          router.name,
          router.domain,
          router.mainUrl,
          router.urls.join(" | "),
          router.totalLikes,
          router.routerCount,
          router.status === "online" ? "在线" : "离线",
          router.createdByName || "未知",
          creatorStats.get(router.originalRouters[0]?.createdBy || "unknown") || 0,
          new Date(router.createdAt).toLocaleString("zh-CN"),
        ])
      : (filteredAndSortedRouters as Router[]).map((router, index) => [
          index + 1,
          router.name,
          router.url,
          router.likes,
          router.status === "online" ? "在线" : "离线",
          router.createdByName || "未知",
          creatorStats.get(router.createdBy || "unknown") || 0,
          new Date(router.createdAt).toLocaleString("zh-CN"),
        ])

    const csv = [
      headers.join(","),
      ...csvData.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      ),
    ].join("\n")

    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", `routers-${mergeByDomain ? "merged-" : ""}${new Date().toISOString().split("T")[0]}.csv`)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 导出 JSON
  const handleExportJSON = () => {
    const json = JSON.stringify(filteredAndSortedRouters, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute(
      "download",
      `routers-${mergeByDomain ? "merged-" : ""}${new Date().toISOString().split("T")[0]}.json`
    )
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 渲染排序图标
  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return <ArrowUpDown className="ml-2 h-4 w-4 opacity-50" />
    }
    return sortOrder === "asc" ? (
      <ArrowUp className="ml-2 h-4 w-4" />
    ) : (
      <ArrowDown className="ml-2 h-4 w-4" />
    )
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">路由器统计</h1>
            <p className="text-muted-foreground mt-1">
              共 {filteredAndSortedRouters.length} 个{mergeByDomain ? "域名" : "网站"}
              {searchTerm && ` (从 ${routers.length} 个中筛选)`}
            </p>
          </div>
        </div>

        {/* 搜索和导出工具栏 */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索网站名称、地址或创建者..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => setMergeByDomain(!mergeByDomain)}
              variant={mergeByDomain ? "default" : "outline"}
            >
              {mergeByDomain ? "已合并域名" : "显示全部"}
            </Button>
            {/*<Button onClick={handleExportCSV} variant="outline">*/}
            {/*  <Download className="mr-2 h-4 w-4" />*/}
            {/*  导出 CSV*/}
            {/*</Button>*/}
            {/*<Button onClick={handleExportJSON} variant="outline">*/}
            {/*  <Download className="mr-2 h-4 w-4" />*/}
            {/*  导出 JSON*/}
            {/*</Button>*/}
          </div>
        </div>

        {/* 表格 */}
        <div className="rounded-md border">
          <Table>
            <TableCaption>
              {filteredAndSortedRouters.length === 0
                ? "暂无数据"
                : "路由器网站统计数据"}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">序号</TableHead>
                <TableHead className="w-[200px]">
                  <button
                    onClick={() => handleSort("name")}
                    className="flex items-center hover:text-foreground"
                  >
                    网站名称
                    <SortIcon field="name" />
                  </button>
                </TableHead>
                {mergeByDomain ? (
                  <>
                    <TableHead>域名</TableHead>
                    <TableHead>推荐链接</TableHead>
                  </>
                ) : (
                  <TableHead>网站地址</TableHead>
                )}
                <TableHead className="text-right">
                  <button
                    onClick={() => handleSort("likes")}
                    className="flex items-center ml-auto hover:text-foreground"
                  >
                    点赞数
                    <SortIcon field="likes" />
                  </button>
                </TableHead>
                <TableHead className="text-right">
                  <button
                    onClick={() => handleSort("routerCount")}
                    className="flex items-center ml-auto hover:text-foreground"
                  >
                    推荐数
                    <SortIcon field="routerCount" />
                  </button>
                </TableHead>
                <TableHead>创建者</TableHead>
                <TableHead className="text-right">
                  <button
                    onClick={() => handleSort("createdAt")}
                    className="flex items-center ml-auto hover:text-foreground"
                  >
                    创建时间
                    <SortIcon field="createdAt" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedRouters.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={mergeByDomain ? 9 : 8} className="text-center py-8">
                    <p className="text-muted-foreground">没有找到匹配的数据</p>
                  </TableCell>
                </TableRow>
              ) : mergeByDomain ? (
                (filteredAndSortedRouters as MergedRouter[]).map((router, index) => (
                  <TableRow key={router.domain}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {router.name}
                        {router.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            认证
                          </Badge>
                        )}
                        {router.routerCount > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {router.routerCount} 个链接
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm text-muted-foreground">{router.domain}</div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <a
                          href={router.mainUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary hover:underline max-w-[300px] truncate text-sm"
                        >
                          {router.mainUrl}
                          <ExternalLink className="h-3 w-3 flex-shrink-0" />
                        </a>
                        {router.routerCount > 1 && (
                          <details className="text-xs">
                            <summary className="cursor-pointer text-muted-foreground hover:text-foreground">
                              + {router.routerCount - 1} 个其他链接
                            </summary>
                            <div className="mt-1 space-y-1 pl-2">
                              {router.urls
                                .filter((url) => url !== router.mainUrl)
                                .map((url, i) => (
                                  <div key={i}>
                                    <a
                                      href={url}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-primary hover:underline break-all"
                                    >
                                      {url}
                                    </a>
                                  </div>
                                ))}
                            </div>
                          </details>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">
                      {router.totalLikes}
                    </TableCell>
                    <TableCell className="text-right">
                      {router.routerCount}
                    </TableCell>
                    <TableCell>
                      {router.createdByName || (
                        <span className="text-muted-foreground">未知</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(router.createdAt).toLocaleString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                (filteredAndSortedRouters as Router[]).map((router, index) => (
                  <TableRow key={router.id}>
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {router.name}
                        {router.isVerified && (
                          <Badge variant="secondary" className="text-xs">
                            认证
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <a
                        href={router.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline max-w-[300px] truncate"
                      >
                        {router.url}
                        <ExternalLink className="h-3 w-3 flex-shrink-0" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right">{router.likes}</TableCell>
                    <TableCell className="text-right">
                      {1}
                    </TableCell>
                    <TableCell>
                      {router.createdByName || (
                        <span className="text-muted-foreground">未知</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(router.createdAt).toLocaleString("zh-CN", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* 统计摘要 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">总点赞数</p>
            <p className="text-2xl font-bold">
              {mergeByDomain
                ? (filteredAndSortedRouters as MergedRouter[]).reduce(
                    (sum, r) => sum + r.totalLikes,
                    0
                  )
                : (filteredAndSortedRouters as Router[]).reduce(
                    (sum, r) => sum + r.likes,
                    0
                  )}
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">在线网站</p>
            <p className="text-2xl font-bold">
              {filteredAndSortedRouters.filter((r) => r.status === "online").length}
            </p>
          </div>
          <div className="p-4 border rounded-lg">
            <p className="text-sm text-muted-foreground">认证网站</p>
            <p className="text-2xl font-bold">
              {filteredAndSortedRouters.filter((r) => r.isVerified).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}