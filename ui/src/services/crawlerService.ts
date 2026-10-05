import { httpClient } from './http'
import type { CrawlJobRequest, CrawlStatusResponse, CrawledPageRecord } from '../types/crawler'

export const crawlerService = {
  async startCrawl(req: CrawlJobRequest): Promise<{ status: string; url?: string }> {
    const seedUrl = req.seed_urls[0]
    return await httpClient.post<{ status: string; url?: string }>('/crawl/seed', {
      url: seedUrl
    })
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
    return { status: 'stopped' }
  },

  async getCrawledPages(): Promise<CrawledPageRecord[]> {
    return []
  }
}
