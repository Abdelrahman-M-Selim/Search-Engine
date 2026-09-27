import { ref, computed } from 'vue'
import { searchService } from '../services/searchService'
import { analyticsService } from '../services/analyticsService'
import { useAuth } from './useAuth'
import type { SearchResponse, SearchResultItem, SearchFilters } from '../types/search'

const query = ref('')
const searchResponse = ref<SearchResponse | null>(null)
const isLoading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const suggestions = ref<string[]>([])
const recentSearches = ref<string[]>(JSON.parse(localStorage.getItem('se_recent_searches') || '[]'))

const filters = ref<SearchFilters>({
  sortBy: 'relevance',
  limit: 10
})

export function useSearch() {
  const { user } = useAuth()

  const hasSearched = computed(() => searchResponse.value !== null)
  const results = computed(() => searchResponse.value?.results || [])
  const totalResults = computed(() => searchResponse.value?.total_results || 0)
  const totalPages = computed(() => Math.ceil(totalResults.value / pageSize.value) || 1)
  const executionTimeMs = computed(() => searchResponse.value?.execution_time_ms || 0)
  const isCached = computed(() => !!searchResponse.value?.cached)
  const queryTokens = computed(() => searchResponse.value?.tokens || [])

  async function performSearch(newQuery?: string, page = 1) {
    if (newQuery !== undefined) {
      query.value = newQuery
    }

    const trimmed = query.value.trim()
    if (!trimmed) {
      searchResponse.value = null
      return
    }

    currentPage.value = page
    isLoading.value = true

    try {
      const response = await searchService.search(trimmed, page, pageSize.value, filters.value)
      searchResponse.value = response

      // Add to recent searches if unique
      if (!recentSearches.value.includes(trimmed)) {
        recentSearches.value.unshift(trimmed)
        if (recentSearches.value.length > 8) {
          recentSearches.value.pop()
        }
        localStorage.setItem('se_recent_searches', JSON.stringify(recentSearches.value))
      }

      // Log search telemetry
      await analyticsService.logSearch(trimmed, user.value?.id, response.total_results)
    } catch (err) {
      console.error('Search error:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function fetchSuggestions(text: string) {
    if (!text.trim()) {
      suggestions.value = []
      return
    }
    suggestions.value = await searchService.getSuggestions(text)
  }

  async function handleResultClick(item: SearchResultItem, index: number) {
    // Dispatch click telemetry to analytics service
    await analyticsService.logClick({
      search_log_id: Date.now(),
      page_id: item.page_id
    })
  }

  function clearSearch() {
    query.value = ''
    searchResponse.value = null
    suggestions.value = []
  }

  function clearRecentSearches() {
    recentSearches.value = []
    localStorage.removeItem('se_recent_searches')
  }

  function setPage(page: number) {
    if (page >= 1 && page <= totalPages.value) {
      performSearch(undefined, page)
    }
  }

  return {
    query,
    results,
    searchResponse,
    hasSearched,
    isLoading,
    currentPage,
    pageSize,
    totalPages,
    totalResults,
    executionTimeMs,
    isCached,
    queryTokens,
    suggestions,
    recentSearches,
    filters,
    performSearch,
    fetchSuggestions,
    handleResultClick,
    clearSearch,
    clearRecentSearches,
    setPage
  }
}
