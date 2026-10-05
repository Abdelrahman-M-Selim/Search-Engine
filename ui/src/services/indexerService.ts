import { httpClient } from './http'
import type { IndexStatusResponse, InvertedIndexPostings } from '../types/indexer'

export const indexerService = {
  async getIndexStatus(): Promise<IndexStatusResponse> {
    return await httpClient.get<IndexStatusResponse>('/index/status')
  },

  async getAllTerms(): Promise<InvertedIndexPostings[]> {
    return []
  },

  async inspectTerm(_term: string): Promise<InvertedIndexPostings | null> {
    return null
  }
}
