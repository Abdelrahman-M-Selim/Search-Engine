import { config } from './config'
import { httpClient, simulateDelay } from './http'
import { mockTopQueries, mockSearchLogs } from './mockData'
import type { TopQueryItem, CTRResponse, SearchLogRecord, ClickLogPayload } from '../types/analytics'

let clickCount = 38
let totalSearchCount = 120

export const analyticsService = {
  async logClick(payload: ClickLogPayload): Promise<{ status: string }> {
    clickCount++
    if (!config.useMock) {
      try {
        return await httpClient.post<{ status: string }>('/analytics/click', payload)
      } catch (err) {
        console.warn('Click log backend unreachable, handled locally:', err)
      }
    }
    return { status: 'logged' }
  },

  async logSearch(query: string, userId?: string | null, resultCount = 0): Promise<void> {
    totalSearchCount++
    mockSearchLogs.unshift({
      id: Date.now(),
      query,
      user_id: userId || null,
      searched_at: new Date().toISOString(),
      result_count: resultCount
    })

    if (!config.useMock) {
      try {
        await httpClient.post('/analytics/search', {
          query,
          user_id: userId || null
        })
      } catch (err) {
        console.warn('Search log backend unreachable, handled locally:', err)
      }
    }
  },

  async getTopQueries(): Promise<TopQueryItem[]> {
    if (!config.useMock) {
      try {
        return await httpClient.get<TopQueryItem[]>('/analytics/top-queries')
      } catch (err) {
        console.warn('Analytics top-queries unreachable, using mock:', err)
      }
    }

    await simulateDelay(180)
    return mockTopQueries
  },

  async getCTR(window = '7d'): Promise<CTRResponse> {
    if (!config.useMock) {
      try {
        return await httpClient.get<CTRResponse>('/analytics/click-through-rate', { window })
      } catch (err) {
        console.warn('Analytics CTR unreachable, using mock:', err)
      }
    }

    await simulateDelay(150)
    const ctr = Number((clickCount / Math.max(1, totalSearchCount)).toFixed(2))
    return {
      ctr: Math.min(1.0, ctr || 0.32),
      window,
      total_searches: totalSearchCount,
      total_clicks: clickCount
    }
  },

  async getRecentSearchLogs(): Promise<SearchLogRecord[]> {
    await simulateDelay(120)
    return mockSearchLogs.slice(0, 10)
  }
}
