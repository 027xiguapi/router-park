import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { ThemeProvider } from "@/components/theme-provider"
import { MonitorProvider } from "@/contexts/monitor-context"
import "./globals.css"
import {Header} from "@/components/header";
import {Footer} from "@/components/footer";

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI 接口中转网站 - 统一的大模型接口网关",
  description: "更好的价格，更好的稳定性，只需要将模型基址替换为中转接口即可使用",
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`font-sans antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
          <MonitorProvider>
            <Header />
            {children}
            <Footer />
          </MonitorProvider>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
