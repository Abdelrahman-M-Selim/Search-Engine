export interface AppConfig {
  useMock: boolean
  apiGatewayBaseUrl: string
  mockLatencyMs: number
  version: string
  serviceUrls: {
    search: string
    crawler: string
    indexer: string
    auth: string
    analytics: string
  }
}

// Default to mock mode as requested, but keep full capability to switch with one toggle
export const config: AppConfig = {
  useMock: true,
  apiGatewayBaseUrl: import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8000',
  mockLatencyMs: 250,
  version: '1.0.0-MVP',
  serviceUrls: {
    search: '/search',
    crawler: '/crawl',
    indexer: '/index',
    auth: '/auth',
    analytics: '/analytics',
  }
}

export function setMockMode(enabled: boolean) {
  config.useMock = enabled
  localStorage.setItem('se_mock_mode', enabled ? 'true' : 'false')
}

export function initConfigFromStorage() {
  const stored = localStorage.getItem('se_mock_mode')
  if (stored !== null) {
    config.useMock = stored === 'true'
  }
}
