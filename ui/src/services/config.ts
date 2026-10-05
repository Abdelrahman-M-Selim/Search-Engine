export interface AppConfig {
  apiGatewayBaseUrl: string
  version: string
  serviceUrls: {
    search: string
    crawler: string
    indexer: string
    auth: string
    analytics: string
  }
}

export const config: AppConfig = {
  apiGatewayBaseUrl: import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8000',
  version: '1.0.0',
  serviceUrls: {
    search: '/search',
    crawler: '/crawl',
    indexer: '/index',
    auth: '/auth',
    analytics: '/analytics',
  }
}
