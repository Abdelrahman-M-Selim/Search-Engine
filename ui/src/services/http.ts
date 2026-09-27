import { config } from './config'

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
}

export class HttpClient {
  private getBaseUrl(): string {
    return config.apiGatewayBaseUrl.replace(/\/$/, '')
  }

  private getToken(): string | null {
    return localStorage.getItem('se_jwt_token')
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers = {}, ...rest } = options

    let url = `${this.getBaseUrl()}${endpoint.startsWith('/') ? '' : '/'}${endpoint}`

    if (params) {
      const searchParams = new URLSearchParams()
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value))
        }
      }
      const qs = searchParams.toString()
      if (qs) {
        url += (url.includes('?') ? '&' : '?') + qs
      }
    }

    const token = this.getToken()
    const finalHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers as Record<string, string>)
    }

    const response = await fetch(url, {
      headers: finalHeaders,
      ...rest
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorJson
      try {
        errorJson = JSON.parse(errorText)
      } catch {
        errorJson = { message: errorText || response.statusText }
      }
      throw new Error(errorJson.message || `Request failed with status ${response.status}`)
    }

    return (await response.json()) as T
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET', params })
  }

  async post<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      params,
      body: body ? JSON.stringify(body) : undefined
    })
  }
}

export const httpClient = new HttpClient()

// Utility for mock delay
export function simulateDelay(ms?: number): Promise<void> {
  const delay = ms ?? config.mockLatencyMs
  return new Promise((resolve) => setTimeout(resolve, delay))
}
