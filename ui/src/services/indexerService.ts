import { httpClient } from './http'
import type { IndexStatusResponse, PaginatedTerms, PaginatedPostings } from '../types/indexer'

export const indexerService = {
  async getIndexStatus(): Promise<IndexStatusResponse> {
    return await httpClient.get<IndexStatusResponse>('/index/status')
  },

  async getAllTerms(page: number = 1, limit: number = 100): Promise<PaginatedTerms> {
    try {
      return await httpClient.get<PaginatedTerms>('/index/terms', { page, limit })
    } catch {
      return { items: [], total: 0, page, size: limit, total_pages: 1 }
    }
  },

  async inspectTerm(term: string, page: number = 1, limit: number = 50): Promise<PaginatedPostings | null> {
    try {
      return await httpClient.get<PaginatedPostings>(`/index/terms/${encodeURIComponent(term)}`, { page, limit })
    } catch {
      return null
    }
  }
}
