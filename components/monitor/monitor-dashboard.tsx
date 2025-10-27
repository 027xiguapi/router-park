"use client"

import { useState, useEffect } from "react"
import { StatsCards } from "./stats-cards"
import { ServiceCard } from "./service-card"
import type { ServiceStatus } from "./types"
import { useMonitor } from "@/contexts/monitor-context"

const initialServices: ServiceStatus[] = [
  {
    id: "1",
    name: "codemirror",
    url: "https://api.codemirror.codes/",
    status: "online",
    responseTime: 30082,
    lastCheck: "10:00:26",
    inviteLink: "https://api.codemirror.codes/register?aff=Atn3",
  },
  {
    id: "10",
    name: "cjack",
    url: "https://cjackapi.cjack.top/",
    status: "online",
    responseTime: 213229,
    lastCheck: "10:00:26",
    inviteLink: "https://cjackapi.cjack.top/register?aff=YLld",
  },
  {
    id: "1",
    name: "https://api.aioec.tech/",
    url: "https://api.aioec.tech",
    status: "online",
    responseTime: 30082,
    lastCheck: "10:00:26",
    inviteLink: "https://api.aioec.tech/register?aff=qR6S",
  },
  {
    id: "2",
    name: "privnode",
    url: "https://pro.privnode.com",
    status: "online",
    responseTime: 30287,
    lastCheck: "10:00:26",
    inviteLink: "https://pro.privnode.com/register?aff=hqWu",
  },
  {
    id: "3",
    name: "88code",
    url: "https://www.88code.org",
    status: "online",
    responseTime: 8472,
    lastCheck: "10:00:26",
    inviteLink: "https://www.88code.org/register?ref=SH7VWA",
  },
  {
    id: "5",
    name: "七牛云",
    url: "https://portal.qiniu.com/ai-inference/model",
    status: "online",
    responseTime: 11823,
    lastCheck: "10:00:26",
    inviteLink: "https://s.qiniu.com/aQfmmq",
  },
  {
    id: "6",
    name: "Agent Router",
    url: "https://agentrouter.org",
    status: "online",
    responseTime: 15463,
    lastCheck: "10:00:26",
    inviteLink: "https://agentrouter.org/register?aff=odTz",
  },
  {
    id: "7",
    name: "Any Router",
    url: "https://q.ouuw.cn",
    status: "online",
    responseTime: 4911,
    lastCheck: "10:00:26",
    inviteLink: "https://anyrouter.top/register?aff=BMDt",
  },
  {
    id: "8",
    name: "cats",
    url: "https://catsapi.com",
    status: "online",
    responseTime: 217966,
    lastCheck: "10:00:26",
    inviteLink: "https://catsapi.com/register?aff=BvgW",
  },
  {
    id: "9",
    name: "clawcloudrun",
    url: "https://xgbnaogz.ap-northeast-1.clawcloudrun.com/",
    status: "online",
    responseTime: 213229,
    lastCheck: "10:00:26",
    inviteLink: "https://xgbnaogz.ap-northeast-1.clawcloudrun.com/register?aff=TlOF",
  },
  {
    id: "10",
    name: "b4u",
    url: "https://b4u.qzz.io/",
    status: "online",
    responseTime: 213229,
    lastCheck: "10:00:26",
    inviteLink: "https://b4u.qzz.io/",
  },
]

export function MonitorDashboard() {
  const [services, setServices] = useState<ServiceStatus[]>(initialServices)
  const [lastUpdate, setLastUpdate] = useState<string>(new Date().toLocaleTimeString("zh-CN", { hour12: false }))
  const { setRefreshMonitor } = useMonitor()

  // 计算统计数据
  const totalServices = services.length

  // 刷新函数
  const handleRefresh = () => {
    setLastUpdate(new Date().toLocaleTimeString("zh-CN", { hour12: false }))
    // 这里可以添加实际的刷新逻辑
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
    <section className="bg-gray-50 py-16 dark:bg-background" id="monitor">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-foreground">API 接口监控面板</h2>
          <p className="text-gray-600 dark:text-muted-foreground">实时监控各中转接口的可用状态</p>
        </div>

        <StatsCards totalServices={totalServices} lastUpdate={lastUpdate} />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.id} service={service} />
          ))}
        </div>
      </div>
    </section>
  )
}
