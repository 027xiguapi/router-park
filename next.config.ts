import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    dangerouslyAllowSVG: true,          // 允许 SVG
    contentDispositionType: 'attachment', // 可选：强制下载，减少 XSS 风险
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;", // 可选：CSP 沙箱
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'oss.routerpark.com'
      },
      {
        protocol: 'https',
        hostname: 'static.destinyai.tools'
      },
      {
        protocol: 'https',
        hostname: '**' // 允许所有 HTTPS 图片（因为我们在组件中已经用 img 标签处理了）
      }
    ]
  },
  eslint: {
    ignoreDuringBuilds: true
  },
  typescript: {
    ignoreBuildErrors: true
  },
  reactStrictMode: false,
}

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: './messages/en.json'
  }
})
export default withNextIntl(nextConfig)
