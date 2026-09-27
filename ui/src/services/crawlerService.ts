import { config } from './config'
import { httpClient, simulateDelay } from './http'
import { mockCrawledFeed } from './mockData'
import type { CrawlJobRequest, CrawlStatusResponse, CrawledPageRecord } from '../types/crawler'

let mockState = {
  in_progress: false,
  pages_crawled: 42,
  current_url: 'https://docs.python.org/3/library/asyncio.html',
  total_in_queue: 12,
  started_at: '2026-09-27T08:00:00Z',
  feed: [...mockCrawledFeed]
}

export const crawlerService = {
  async startCrawl(req: CrawlJobRequest): Promise<{ status: string; message: string }> {
    if (!config.useMock) {
      try {
        return await httpClient.post<{ status: string; message: string }>('/crawl/start', req)
      } catch (err) {
        console.warn('Backend crawler unreachable, falling back to mock:', err)
      }
    }

    await simulateDelay(300)
    mockState.in_progress = true
    mockState.started_at = new Date().toISOString()
    mockState.total_in_queue = (req.seed_urls.length * 5)

    // Simulate crawl progression in background
    setTimeout(() => {
      mockState.pages_crawled += 3
      mockState.feed.unshift({
        id: Date.now(),
        url: req.seed_urls[0] || 'https://news.ycombinator.com',
        title: 'Discovered Page from Seed Crawl',
        crawled_at: new Date().toISOString(),
        word_count: 850,
        status_code: 200
      })
    }, 1500)

    return {
      status: 'accepted',
      message: `Crawl job initiated for ${req.seed_urls.length} seed URL(s)`
    }
  },

  async getCrawlStatus(): Promise<CrawlStatusResponse> {
    if (!config.useMock) {
      try {
        return await httpClient.get<CrawlStatusResponse>('/crawl/status')
      } catch (err) {
        console.warn('Backend crawler unreachable, using mock status:', err)
      }
    }

    await simulateDelay(150)
    return {
      pages_crawled: mockState.pages_crawled,
      in_progress: mockState.in_progress,
      current_url: mockState.current_url,
      total_in_queue: mockState.total_in_queue,
      started_at: mockState.started_at
    }
  },

  async stopCrawl(): Promise<{ status: string }> {
    await simulateDelay(200)
    mockState.in_progress = false
    return { status: 'stopped' }
  },

  async getCrawledPages(): Promise<CrawledPageRecord[]> {
    await simulateDelay(200)
    return mockState.feed
  }
}
