import { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'static.getwhynot.org'
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
  experimental: {
    staleTimes: {
      dynamic: 3600,
      static: 3600
    }
  }
}

const withNextIntl = createNextIntlPlugin({
  experimental: {
    createMessagesDeclaration: './messages/en.json'
  }
})
export default withNextIntl(nextConfig)
