export interface CrawlJobRequest {
  seed_urls: string[]
  max_pages?: number
  delay_seconds?: number
}

export interface CrawlStatusResponse {
  pages_crawled: number
  in_progress: boolean
  current_url?: string
  last_crawled_url?: string
  total_in_queue?: number
  started_at?: string
  elapsed_seconds?: number
}

export interface CrawledPageRecord {
  id: number
  url: string
  title: string
  crawled_at: string
  word_count: number
  status_code: number
}

export interface PaginatedPages {
  items: CrawledPageRecord[]
  total: number
  page: number
  size: number
  total_pages: number
}
