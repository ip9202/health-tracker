import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /**
   * 실험적 기능 설정
   */
  experimental: {
    /**
     * Server Actions 설정
     * Next.js 16.1.1에서는 experimental 내부에 위치
     * @see https://nextjs.org/docs/app/api-reference/config/next-config-js/serverActions
     */
    serverActions: {
      allowedOrigins: ['localhost:3000']
    }
  }
}

export default nextConfig
