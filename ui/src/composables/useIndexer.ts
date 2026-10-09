import { ref } from 'vue'
import { indexerService } from '../services/indexerService'
import type { IndexStatusResponse, PaginatedTerms, PaginatedPostings } from '../types/indexer'

const status = ref<IndexStatusResponse>({
  total_indexed_pages: 0,
  total_unique_terms: 0,
  last_indexed_at: new Date().toISOString(),
  avg_terms_per_page: 0
})

const termsList = ref<PaginatedTerms['items']>([])
const currentTermsPage = ref(1)
const totalTermsPages = ref(1)

const selectedTerm = ref<PaginatedPostings | null>(null)
const currentPostingsPage = ref(1)
const totalPostingsPages = ref(1)

const searchTermQuery = ref('')
const isLoading = ref(false)

export function useIndexer() {
  async function refreshIndexStatus(page = currentTermsPage.value) {
    try {
      isLoading.value = true
      status.value = await indexerService.getIndexStatus()
      const termsRes = await indexerService.getAllTerms(page, 100)
      termsList.value = termsRes.items
      currentTermsPage.value = termsRes.page
      totalTermsPages.value = termsRes.total_pages
      
      if (termsList.value.length > 0 && !selectedTerm.value) {
        const firstTerm = termsList.value[0]
        if (firstTerm) {
          await inspectTerm(firstTerm.term, 1)
        }
      }
    } catch (err) {
      console.error('Indexer fetch failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function inspectTerm(term: string, page = currentPostingsPage.value) {
    if (!term.trim()) return
    try {
      const result = await indexerService.inspectTerm(term, page, 50)
      if (result) {
        selectedTerm.value = result
        currentPostingsPage.value = result.page
        totalPostingsPages.value = result.total_pages
      }
    } catch (err) {
      console.error('Term fetch failed:', err)
    }
  }

  async function selectPosting(item: {term: string}) {
    currentPostingsPage.value = 1
    await inspectTerm(item.term, 1)
  }

  function changeTermsPage(newPage: number) {
    if (newPage > 0 && newPage <= totalTermsPages.value) {
      refreshIndexStatus(newPage)
    }
  }

  function changePostingsPage(newPage: number) {
    if (selectedTerm.value && newPage > 0 && newPage <= totalPostingsPages.value) {
      inspectTerm(selectedTerm.value.term, newPage)
    }
  }

  return {
    status,
    termsList,
    currentTermsPage,
    totalTermsPages,
    selectedTerm,
    currentPostingsPage,
    totalPostingsPages,
    searchTermQuery,
    isLoading,
    refreshIndexStatus,
    inspectTerm,
    selectPosting,
    changeTermsPage,
    changePostingsPage
  }
}
