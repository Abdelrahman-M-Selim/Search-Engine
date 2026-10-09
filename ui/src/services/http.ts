import { config } from './config'

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  timeoutMs?: number
}

export class HttpClient {
  private getBaseUrl(): string {
    return config.apiGatewayBaseUrl.replace(/\/$/, '')
  }

  private getToken(): string | null {
    return localStorage.getItem('se_jwt_token')
  }

  async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers = {}, timeoutMs = 30000, ...rest } = options

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

    // Set up timeout using AbortController
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs)

    try {
      const response = await fetch(url, {
        headers: finalHeaders,
        signal: controller.signal,
        ...rest
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        // Global 401 Unauthorized handling
        if (response.status === 401) {
          localStorage.removeItem('se_jwt_token')
          localStorage.removeItem('se_user_data')
          window.dispatchEvent(new Event('auth:unauthorized'))
          // Optionally: window.location.href = '/login'
        }

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
    } catch (error: any) {
      clearTimeout(timeoutId)
      if (error.name === 'AbortError') {
        throw new Error('Request timed out')
      }
      throw error
    }
  }

  async get<T>(endpoint: string, params?: Record<string, string | number | boolean | undefined>, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'GET', params })
  }

  async post<T>(endpoint: string, body?: unknown, params?: Record<string, string | number | boolean | undefined>, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      params,
      body: body ? JSON.stringify(body) : undefined
    })
  }

  async put<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  async patch<T>(endpoint: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined
    })
  }

  async delete<T>(endpoint: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: 'DELETE' })
  }
}

export const httpClient = new HttpClient()
