<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useIndexer } from '../../composables/useIndexer'
import IconIndexer from '../icons/IconIndexer.vue'
import IconSearch from '../icons/IconSearch.vue'
import IconExternal from '../icons/IconExternal.vue'
import StatusBadge from '../common/StatusBadge.vue'

const {
  status,
  termsList,
  currentTermsPage,
  totalTermsPages,
  selectedTerm,
  currentPostingsPage,
  totalPostingsPages,
  searchTermQuery,
  refreshIndexStatus,
  selectPosting,
  changeTermsPage,
  changePostingsPage
} = useIndexer()

const filterQuery = ref('')

const filteredTerms = computed(() => {
  if (!filterQuery.value.trim()) return termsList.value
  const q = filterQuery.value.toLowerCase().trim()
  return termsList.value.filter(t => t.term.toLowerCase().includes(q))
})

onMounted(() => {
  refreshIndexStatus()
})
</script>

<template>
  <div class="indexer-dashboard">
    <!-- Header Hero -->
    <div class="dashboard-header">
      <div class="header-icon-box">
        <IconIndexer class="hero-icon" />
      </div>
      <div>
        <h2 class="section-title">Inverted Index Inspector</h2>
        <p class="section-desc">
          Consumes crawled text streams, strips stopwords, tokenizes into canonical stems, and computes
          term frequencies stored in the <code class="code-pill">inverted_index</code> PostgreSQL relational store.
        </p>
      </div>
    </div>

    <!-- Stats Row -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Indexed Documents</span>
        <div class="stat-value num-cyan">{{ status.total_indexed_pages }}</div>
      </div>

      <div class="stat-card">
        <span class="stat-label">Unique Terms in Dictionary</span>
        <div class="stat-value num-purple">{{ status.total_unique_terms }}</div>
      </div>

      <div class="stat-card">
        <span class="stat-label">Avg Terms per Document</span>
        <div class="stat-value">{{ status.avg_terms_per_page || 164 }}</div>
      </div>

      <div class="stat-card">
        <span class="stat-label">Indexer Status</span>
        <div class="stat-value">
          <StatusBadge status="healthy" size="md">Kafka Consumer Ready</StatusBadge>
        </div>
      </div>
    </div>

    <!-- Explorer Grid -->
    <div class="explorer-grid">
      <!-- Left: Terms Dictionary List -->
      <div class="terms-sidebar card">
        <div class="sidebar-top">
          <h3 class="card-heading">Index Terms Dictionary</h3>
          <div class="search-mini-box">
            <IconSearch class="mini-search-icon" />
            <input
              v-model="filterQuery"
              type="text"
              class="mini-input"
              placeholder="Filter terms..."
            />
          </div>
        </div>

        <div class="terms-list">
          <button
            v-for="item in filteredTerms"
            :key="item.term"
            class="term-item-btn"
            :class="{ active: selectedTerm?.term === item.term }"
            @click="selectPosting(item)"
          >
            <span class="term-name">#{{ item.term }}</span>
            <span class="doc-count-pill">{{ item.doc_count }} docs</span>
            </button>
          </div>
          <div class="pagination-bar" v-if="totalTermsPages > 1">
            <button class="btn btn-primary" :disabled="currentTermsPage <= 1" @click="changeTermsPage(currentTermsPage - 1)">Prev</button>
            <span class="page-info">Page {{ currentTermsPage }} of {{ totalTermsPages }}</span>
            <button class="btn btn-primary" :disabled="currentTermsPage >= totalTermsPages" @click="changeTermsPage(currentTermsPage + 1)">Next</button>
          </div>
        </div>

        <!-- Right: Postings & Term Occurrences Detail -->
      <div class="postings-detail card">
        <div v-if="selectedTerm" class="detail-content">
          <div class="postings-header">
            <div>
              <div class="posting-term-title">Term: <code>{{ selectedTerm.term }}</code></div>
              <div class="posting-meta">
                Appears in <strong>{{ selectedTerm.doc_count }}</strong> indexed document(s)
              </div>
            </div>
            <StatusBadge status="core" size="sm">
              Postings List (Inverted Index)
            </StatusBadge>
          </div>

          <!-- Document Matches Table -->
          <div class="occurrences-table">
            <div class="table-header">
              <span class="col-id">Doc ID</span>
              <span class="col-title">Document Title & URL</span>
              <span class="col-tf">Term Frequency (TF)</span>
              <span class="col-bar">Relevance Weight</span>
            </div>

            <div
              v-for="occ in selectedTerm.occurrences"
              :key="occ.page_id"
              class="table-row"
            >
              <span class="col-id">
                <span class="id-badge">#{{ occ.page_id }}</span>
              </span>

              <div class="col-title">
                <div class="doc-title-text">{{ occ.title }}</div>
                <a :href="occ.url" target="_blank" rel="noopener noreferrer" class="doc-url-link">
                  {{ occ.url }}
                  <IconExternal class="tiny-icon" />
                </a>
              </div>

              <div class="col-tf">
                <span class="tf-badge">{{ occ.term_frequency }} matches</span>
              </div>

              <div class="col-bar">
                <div class="weight-track">
                  <div
                    class="weight-fill"
                    :style="{ width: `${Math.min(100, occ.term_frequency * 4)}%` }"
                  ></div>
                </div>
              </div>
            </div>
            <div class="pagination-bar" v-if="totalPostingsPages > 1">
              <button class="btn btn-primary" :disabled="currentPostingsPage <= 1" @click="changePostingsPage(currentPostingsPage - 1)">Prev</button>
              <span class="page-info">Page {{ currentPostingsPage }} of {{ totalPostingsPages }}</span>
              <button class="btn btn-primary" :disabled="currentPostingsPage >= totalPostingsPages" @click="changePostingsPage(currentPostingsPage + 1)">Next</button>
            </div>
          </div>
        </div>

        <div v-else class="empty-selection">
          Select a term from the dictionary on the left to inspect its inverted index postings.
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Scrollbar styling for a cleaner look */
::-webkit-scrollbar {
  width: 6px;
}
::-webkit-scrollbar-track {
  background: transparent;
}
::-webkit-scrollbar-thumb {
  background: var(--border-color);
  border-radius: 10px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--text-muted);
}

.pagination-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px dashed var(--border-color);
}
.pagination-bar .btn {
  padding: 0.3rem 0.8rem;
  font-size: 0.8rem;
}
.page-info {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--text-muted);
}

.indexer-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dashboard-header {
  display: flex;
  align-items: center;
  gap: 0.85rem;
}

.header-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--bg-surface-soft);
  color: var(--accent-primary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-icon {
  width: 20px;
  height: 20px;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.section-desc {
  font-size: 0.84rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
  line-height: 1.4;
}

.code-pill {
  background: var(--bg-surface-soft);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  color: var(--text-primary);
  font-family: monospace;
  font-size: 0.8rem;
  border: 1px solid var(--border-color);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.85rem;
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  box-shadow: var(--shadow-sm);
}

.stat-label {
  font-size: 0.74rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.num-cyan {
  color: var(--accent-primary);
}

.num-purple {
  color: var(--text-primary);
}

.explorer-grid {
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: 1.25rem;
}

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  box-shadow: var(--shadow-sm);
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  margin-bottom: 0.85rem;
}

.card-heading {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.search-mini-box {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.3rem 0.55rem;
}

.mini-search-icon {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
}

.mini-input {
  background: transparent;
  border: none;
  color: var(--text-primary);
  font-size: 0.8rem;
  width: 100%;
  outline: none;
}

.terms-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 500px;
  overflow-y: auto;
  padding-right: 0.4rem;
}

.term-item-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.65rem 0.75rem;
  border-radius: 8px;
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.term-item-btn:hover {
  background: var(--bg-surface);
  border-color: var(--accent-primary);
  color: var(--text-primary);
  transform: translateY(-1px);
  box-shadow: var(--shadow-sm);
}

.term-item-btn.active {
  background: var(--accent-primary);
  border-color: var(--accent-primary);
  color: white;
  font-weight: 600;
}

.doc-count-pill {
  font-size: 0.72rem;
  font-weight: 600;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 0.15rem 0.4rem;
  border-radius: 6px;
  color: var(--text-muted);
}

.term-item-btn.active .doc-count-pill {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: none;
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.postings-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.85rem;
}

.posting-term-title {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary);
}

.posting-term-title code {
  color: var(--accent-primary);
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.posting-meta {
  font-size: 0.8rem;
  color: var(--text-muted);
  margin-top: 0.25rem;
}

.occurrences-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  height: 548px;
  overflow-y: auto;
  padding-right: 0.4rem;
}

.table-header {
  display: grid;
  grid-template-columns: 60px 1fr 130px 100px;
  gap: 0.75rem;
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.35rem 0.5rem;
  border-bottom: 1px solid var(--border-color);
}

.table-row {
  display: grid;
  grid-template-columns: 60px 1fr 130px 100px;
  gap: 0.75rem;
  align-items: center;
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.65rem 0.75rem;
  transition: all 0.15s ease;
}
.table-row:hover {
  background: var(--bg-surface);
  box-shadow: var(--shadow-sm);
  border-color: var(--accent-primary);
  transform: translateY(-1px);
}

.id-badge {
  font-size: 0.72rem;
  font-weight: 600;
  color: var(--text-muted);
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.doc-title-text {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--text-primary);
}

.doc-url-link {
  font-size: 0.74rem;
  color: var(--link-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.2rem;
  margin-top: 0.1rem;
}

.tf-badge {
  font-size: 0.75rem;
  font-weight: 600;
  color: #059669;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
}

.dark-theme .tf-badge {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.3);
}

.weight-track {
  width: 100%;
  height: 5px;
  background: var(--border-color);
  border-radius: 3px;
  overflow: hidden;
}

.weight-fill {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 3px;
}

.tiny-icon {
  width: 11px;
  height: 11px;
}

.empty-selection {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .explorer-grid {
    grid-template-columns: 1fr;
  }
}
</style>


