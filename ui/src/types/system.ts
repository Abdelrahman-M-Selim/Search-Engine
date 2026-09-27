export type ServiceStatus = 'healthy' | 'degraded' | 'offline' | 'idle' | 'running'

export interface ServiceNodeInfo {
  id: string
  name: string
  technology: string
  port: number
  endpoint: string
  status: ServiceStatus
  latencyMs: number
  description: string
  category: 'core' | 'support' | 'infra'
  metrics?: Record<string, string | number>
}

export interface SystemHealthSummary {
  gateway: ServiceStatus
  services: Record<string, ServiceNodeInfo>
  lastChecked: string
  allHealthy: boolean
}
