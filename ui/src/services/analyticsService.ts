import { httpClient } from './http'
import type { TopQueryItem, CTRResponse, SearchLogRecord, ClickLogPayload } from '../types/analytics'

export const analyticsService = {
  async logClick(payload: ClickLogPayload): Promise<{ status: string }> {
    return await httpClient.post<{ status: string }>('/analytics/click', payload)
  },

  async logSearch(query: string, userId?: string | null): Promise<void> {
    try {
      await httpClient.post('/analytics/search', {
        query,
        user_id: userId || null
      })
    } catch {
      // fire and forget
    }
  },

  async getTopQueries(): Promise<TopQueryItem[]> {
    try {
      return await httpClient.get<TopQueryItem[]>('/analytics/top-queries')
    } catch {
      return []
    }
  },

  async getCTR(window = '7d'): Promise<CTRResponse> {
    try {
      return await httpClient.get<CTRResponse>('/analytics/click-through-rate', { window })
    } catch {
      return {
        ctr: 0,
        window,
        total_searches: 0,
        total_clicks: 0
      }
    }
  },

  async getRecentSearchLogs(): Promise<SearchLogRecord[]> {
    return []
  }
}
