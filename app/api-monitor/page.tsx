import { MonitorDashboard } from "@/components/monitor/monitor-dashboard"

export const metadata = {
  title: "Claude Code中转监控面板 - AI 导航",
  description: "实时监控 Claude Code 中转服务状态",
}

export default function MonitorPage() {
  return <MonitorDashboard />
}
