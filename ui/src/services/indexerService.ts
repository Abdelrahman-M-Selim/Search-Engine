import { config } from './config'
import { httpClient, simulateDelay } from './http'
import { mockInvertedIndex } from './mockData'
import type { IndexStatusResponse, InvertedIndexPostings } from '../types/indexer'

export const indexerService = {
  async getIndexStatus(): Promise<IndexStatusResponse> {
    if (!config.useMock) {
      try {
        return await httpClient.get<IndexStatusResponse>('/index/status')
      } catch (err) {
        console.warn('Backend indexer unreachable, using mock status:', err)
      }
    }

    await simulateDelay(180)
    return {
      total_indexed_pages: 42,
      total_unique_terms: 1845,
      last_indexed_at: new Date().toISOString(),
      avg_terms_per_page: 164
    }
  },

  async getAllTerms(): Promise<InvertedIndexPostings[]> {
    await simulateDelay(200)
    return mockInvertedIndex
  },

  async inspectTerm(term: string): Promise<InvertedIndexPostings | null> {
    await simulateDelay(150)
    const normalized = term.toLowerCase().trim()
    const match = mockInvertedIndex.find(item => item.term.toLowerCase() === normalized)
    return match || null
  }
}
