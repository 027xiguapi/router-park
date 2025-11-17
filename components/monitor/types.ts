export interface ServiceStatus {
  id: string
  name: string
  url: string
  status: "online" | "offline"
  responseTime: number
  lastCheck: string
  inviteLink?: string
  likes?: number
  error?: string
  isVerified?: boolean
  createdBy?: string // 创建人 ID
  createdByName?: string // 创建人名称
  createdByImage?: string // 创建人头像
}
