import { ref, onUnmounted } from 'vue'
import { crawlerService } from '../services/crawlerService'
import { useToast } from './useToast'
import type { CrawlStatusResponse, CrawledPageRecord, CrawlJobRequest } from '../types/crawler'

const status = ref<CrawlStatusResponse>({
  pages_crawled: 42,
  in_progress: false,
  current_url: '',
  total_in_queue: 0
})

const crawledPages = ref<CrawledPageRecord[]>([])
const currentPage = ref(1)
const totalPages = ref(1)
const totalItems = ref(0)
const isLoading = ref(false)
const seedUrlsInput = ref(
  'https://fastapi.tiangolo.com\nhttps://docs.nestjs.com\nhttps://www.postgresql.org/docs\nhttps://redis.io/docs\nhttps://kafka.apache.org'
)
const maxPages = ref(50)
const delaySeconds = ref(1.0)
let pollInterval: ReturnType<typeof setInterval> | null = null

export function useCrawler() {
  const toast = useToast()

  async function refreshStatus(page = currentPage.value) {
    try {
      status.value = await crawlerService.getCrawlStatus()
      const pagedData = await crawlerService.getCrawledPages(page, 10)
      crawledPages.value = pagedData.items
      currentPage.value = pagedData.page
      totalPages.value = pagedData.total_pages
      totalItems.value = pagedData.total
    } catch (err) {
      console.error('Crawler status fetch failed:', err)
    }
  }

  function changePage(newPage: number) {
    if (newPage > 0 && newPage <= totalPages.value) {
      refreshStatus(newPage)
    }
  }

  async function startCrawl() {
    const urls = seedUrlsInput.value
      .split('\n')
      .map(u => u.trim())
      .filter(u => u.startsWith('http://') || u.startsWith('https://'))

    if (urls.length === 0) {
      toast.warning('Invalid Seed URLs', 'Please enter at least one valid HTTP/HTTPS seed URL.')
      return
    }

    const payload: CrawlJobRequest = {
      seed_urls: urls,
      max_pages: maxPages.value,
      delay_seconds: delaySeconds.value
    }

    try {
      isLoading.value = true
      const res = await crawlerService.startCrawl(payload)
      toast.success('Crawl Job Started', res.message)
      await refreshStatus()
      startPolling()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to trigger crawler'
      toast.error('Crawl Error', msg)
    } finally {
      isLoading.value = false
    }
  }

  async function stopCrawl() {
    try {
      await crawlerService.stopCrawl()
      stopPolling()
      await refreshStatus()
      toast.info('Crawl Paused', 'The crawler run has been stopped.')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to stop'
      toast.error('Error', msg)
    }
  }

  function startPolling() {
    if (pollInterval) clearInterval(pollInterval)
    pollInterval = setInterval(refreshStatus, 3000)
  }

  function stopPolling() {
    if (pollInterval) {
      clearInterval(pollInterval)
      pollInterval = null
    }
  }

  onUnmounted(() => {
    stopPolling()
  })

  return {
    status,
    crawledPages,
    currentPage,
    totalPages,
    totalItems,
    isLoading,
    seedUrlsInput,
    maxPages,
    delaySeconds,
    startCrawl,
    stopCrawl,
    refreshStatus,
    changePage
  }
}
