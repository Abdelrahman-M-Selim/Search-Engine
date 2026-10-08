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

export interface PaginatedTerms {
  items: Array<{term: string, doc_count: number}>
  total: number
  page: number
  size: number
  total_pages: number
}

export interface PaginatedPostings {
  term: string
  doc_count: number
  occurrences: Array<{
    page_id: number
    title: string
    url: string
    term_frequency: number
  }>
  page: number
  size: number
  total_pages: number
}
