import { config } from './config'
import { httpClient, simulateDelay } from './http'
import { mockPages } from './mockData'
import type { SearchResponse, SearchResultItem, SearchFilters } from '../types/search'

// In-memory mock cache to simulate Redis caching behavior
const mockRedisCache = new Map<string, { data: SearchResultItem[]; timestamp: number }>()

export const searchService = {
  async search(query: string, page = 1, limit = 10, filters?: SearchFilters): Promise<SearchResponse> {
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

    if (!config.useMock) {
      try {
        const res = await httpClient.get<SearchResponse>('/search', {
          q: trimmed,
          page,
          limit
        })
        return res
      } catch (err) {
        console.warn('Backend search unreachable, falling back to mock search engine:', err)
      }
    }

    // Mock search engine implementation with inverted index scoring & cache simulation
    const startTime = performance.now()
    const cacheKey = `search:${trimmed.toLowerCase()}`
    const isCached = mockRedisCache.has(cacheKey)

    // Simulate fast Redis cache hit (<15ms) vs PG index lookup (150-250ms)
    await simulateDelay(isCached ? 12 : 210)

    const queryTokens = trimmed
      .toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(t => t.length > 1)

    let scoredResults: SearchResultItem[] = []

    if (isCached) {
      scoredResults = mockRedisCache.get(cacheKey)!.data
    } else {
      // Score pages based on token presence in title, snippet, and term frequencies
      scoredResults = mockPages
        .map(page => {
          let score = 0
          const matchTerms: Record<string, number> = {}

          queryTokens.forEach(token => {
            // Check term frequencies in index
            const tf = page.term_frequencies?.[token] || 0
            if (tf > 0) {
              score += tf * 3
              matchTerms[token] = tf
            }
            if (page.title.toLowerCase().includes(token)) {
              score += 15
            }
            if (page.snippet.toLowerCase().includes(token)) {
              score += 8
            }
          })

          return {
            ...page,
            score,
            term_frequencies: Object.keys(matchTerms).length > 0 ? matchTerms : page.term_frequencies
          }
        })
        .filter(page => queryTokens.length === 0 || (page.score && page.score > 0))
        .sort((a, b) => {
          if (filters?.sortBy === 'date') {
            return new Date(b.crawled_at || 0).getTime() - new Date(a.crawled_at || 0).getTime()
          }
          return (b.score || 0) - (a.score || 0)
        })

      // If no strict token match found, fallback to generic fuzzy search on title/snippet
      if (scoredResults.length === 0 && queryTokens.length > 0) {
        scoredResults = mockPages.filter(p =>
          p.title.toLowerCase().includes(trimmed.toLowerCase()) ||
          p.snippet.toLowerCase().includes(trimmed.toLowerCase())
        )
      }

      // Cache result in mock Redis
      mockRedisCache.set(cacheKey, { data: scoredResults, timestamp: Date.now() })
    }

    // Apply domain filtering if selected
    if (filters?.domain) {
      scoredResults = scoredResults.filter(r => r.domain === filters.domain)
    }

    const total_results = scoredResults.length
    const startIndex = (page - 1) * limit
    const paginatedResults = scoredResults.slice(startIndex, startIndex + limit)
    const endTime = performance.now()

    return {
      query: trimmed,
      total_results,
      page,
      limit,
      results: paginatedResults,
      execution_time_ms: Math.round(endTime - startTime),
      cached: isCached,
      tokens: queryTokens
    }
  },

  async getSuggestions(prefix: string): Promise<string[]> {
    if (!prefix.trim()) return []

    const pool = [
      'fastapi microservices',
      'fastapi vs nestjs',
      'nestjs microservices architecture',
      'postgresql inverted index',
      'redis caching search latency',
      'kafka crawler page_crawled event',
      'nginx gateway reverse proxy',
      'python web crawler beautifulsoup',
      'jwt auth stateless token',
      'click through rate analytics'
    ]

    const query = prefix.toLowerCase().trim()
    return pool.filter(item => item.toLowerCase().includes(query)).slice(0, 5)
  }
}
