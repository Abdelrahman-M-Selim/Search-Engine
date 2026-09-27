import { ref } from 'vue'
import { analyticsService } from '../services/analyticsService'
import type { TopQueryItem, CTRResponse, SearchLogRecord } from '../types/analytics'

const topQueries = ref<TopQueryItem[]>([])
const ctrData = ref<CTRResponse>({
  ctr: 0.32,
  window: '7d',
  total_searches: 120,
  total_clicks: 38
})
const searchLogs = ref<SearchLogRecord[]>([])
const selectedWindow = ref('7d')
const isLoading = ref(false)

export function useAnalytics() {
  async function refreshAnalytics() {
    try {
      isLoading.value = true
      const [queries, ctr, logs] = await Promise.all([
        analyticsService.getTopQueries(),
        analyticsService.getCTR(selectedWindow.value),
        analyticsService.getRecentSearchLogs()
      ])
      topQueries.value = queries
      ctrData.value = ctr
      searchLogs.value = logs
    } catch (err) {
      console.error('Analytics refresh error:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function setWindow(window: string) {
    selectedWindow.value = window
    ctrData.value = await analyticsService.getCTR(window)
  }

  return {
    topQueries,
    ctrData,
    searchLogs,
    selectedWindow,
    isLoading,
    refreshAnalytics,
    setWindow
  }
}
