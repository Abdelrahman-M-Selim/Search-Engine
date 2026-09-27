import { ref } from 'vue'
import { indexerService } from '../services/indexerService'
import type { IndexStatusResponse, InvertedIndexPostings } from '../types/indexer'

const status = ref<IndexStatusResponse>({
  total_indexed_pages: 42,
  total_unique_terms: 1845,
  last_indexed_at: new Date().toISOString(),
  avg_terms_per_page: 164
})

const termsList = ref<InvertedIndexPostings[]>([])
const selectedTerm = ref<InvertedIndexPostings | null>(null)
const searchTermQuery = ref('')
const isLoading = ref(false)

export function useIndexer() {
  async function refreshIndexStatus() {
    try {
      isLoading.value = true
      status.value = await indexerService.getIndexStatus()
      termsList.value = await indexerService.getAllTerms()
      if (termsList.value.length > 0 && !selectedTerm.value) {
        selectedTerm.value = termsList.value[0] || null
      }
    } catch (err) {
      console.error('Indexer fetch failed:', err)
    } finally {
      isLoading.value = false
    }
  }

  async function inspectTerm(term: string) {
    if (!term.trim()) return
    const result = await indexerService.inspectTerm(term)
    if (result) {
      selectedTerm.value = result
    }
  }

  function selectPosting(item: InvertedIndexPostings) {
    selectedTerm.value = item
  }

  return {
    status,
    termsList,
    selectedTerm,
    searchTermQuery,
    isLoading,
    refreshIndexStatus,
    inspectTerm,
    selectPosting
  }
}
