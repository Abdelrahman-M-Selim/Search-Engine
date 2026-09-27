export interface SearchResultItem {
  page_id: number
  title: string
  url: string
  snippet: string
  score?: number
  domain?: string
  crawled_at?: string
  term_frequencies?: Record<string, number>
}

export interface SearchResponse {
  query: string
  total_results: number
  page: number
  limit: number
  results: SearchResultItem[]
  execution_time_ms?: number
  cached?: boolean
  tokens?: string[]
}

export interface SearchFilters {
  sortBy: 'relevance' | 'date' | 'frequency'
  domain?: string
  limit: number
}
