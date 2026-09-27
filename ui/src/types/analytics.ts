export interface TopQueryItem {
  query: string
  count: number
  last_searched?: string
  avg_ctr?: number
}

export interface CTRResponse {
  ctr: number
  window: string
  total_searches?: number
  total_clicks?: number
}

export interface SearchLogRecord {
  id: number
  query: string
  user_id: string | null
  searched_at: string
  result_count: number
}

export interface ClickLogPayload {
  search_log_id: number
  page_id: number
}
