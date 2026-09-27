export interface IndexStatusResponse {
  total_indexed_pages: number
  total_unique_terms: number
  last_indexed_at?: string
  avg_terms_per_page?: number
}

export interface InvertedIndexPostings {
  term: string
  doc_count: number
  occurrences: Array<{
    page_id: number
    title: string
    url: string
    term_frequency: number
  }>
}
