import { httpClient } from './http'
import type { CrawlJobRequest, CrawlStatusResponse, CrawledPageRecord, PaginatedPages } from '../types/crawler'

export const crawlerService = {
  async startCrawl(req: CrawlJobRequest): Promise<{ status: string; message?: string; url?: string }> {
    const seedUrl = req.seed_urls[0]
    const res = await httpClient.post<{ status: string; message?: string; url?: string }>('/crawl/seed', {
      url: seedUrl
    })
    return {
      status: res.status,
      message: res.message || `Seed URL ${seedUrl} added successfully.`,
      url: res.url
    }
  },

  async getCrawlStatus(): Promise<CrawlStatusResponse> {
    try {
      const res = await httpClient.get<CrawlStatusResponse>('/crawl/status')
      return res
    } catch {
      return {
        pages_crawled: 0,
        in_progress: false
      }
    }
  },

  async stopCrawl(): Promise<{ status: string }> {
    try {
      return await httpClient.post<{ status: string }>('/crawl/stop')
    } catch {
      return { status: 'stopped' }
    }
  },

  async getCrawledPages(page: number = 1, limit: number = 20): Promise<PaginatedPages> {
    try {
      return await httpClient.get<PaginatedPages>('/crawl/pages', { page, limit })
    } catch {
      return { items: [], total: 0, page, size: limit, total_pages: 1 }
    }
  }
}
