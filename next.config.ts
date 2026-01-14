import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Turbopack 비활성화 - webpack 사용
  // webpack: (config, { isServer }) => {
  //   return config
  // },

  experimental: {
    // Turbopack 비활성화
    turbo: undefined,

    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  }
}

export default nextConfig
