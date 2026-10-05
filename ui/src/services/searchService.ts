import { httpClient } from './http'
import type { SearchResponse, SearchFilters } from '../types/search'

export const searchService = {
  async search(query: string, page = 1, limit = 10, _filters?: SearchFilters): Promise<SearchResponse> {
    const trimmed = query.trim()
    if (!trimmed) {
      return {
        query: '',
        total_results: 0,
        page: 1,
        limit,
        results: [],
        execution_time_ms: 0,
        cached: false
      }
    }

    const startTime = performance.now()
    const res = await httpClient.get<SearchResponse>('/search', {
      q: trimmed,
      page,
      limit
    })
    const endTime = performance.now()

    return {
      ...res,
      execution_time_ms: res.execution_time_ms ?? Math.round(endTime - startTime)
    }
  },

  async getSuggestions(_prefix: string): Promise<string[]> {
    return []
  }
}
