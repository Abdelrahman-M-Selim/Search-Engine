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
  selectedTerm,
  searchTermQuery,
  refreshIndexStatus,
  selectPosting
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
.indexer-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(147, 51, 234, 0.15);
  color: #a855f7;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-icon {
  width: 24px;
  height: 24px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.section-desc {
  font-size: 0.88rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 0.2rem;
  line-height: 1.5;
}

.code-pill {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  color: #a855f7;
  font-family: monospace;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 14px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
}

.num-cyan {
  color: #06b6d4;
}

.num-purple {
  color: #a855f7;
}

.explorer-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 1.5rem;
}

.card {
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 16px;
  padding: 1.5rem;
}

.sidebar-top {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1rem;
}

.card-heading {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.search-mini-box {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  background: var(--bg-card-soft, rgba(0, 0, 0, 0.25));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: 8px;
  padding: 0.35rem 0.6rem;
}

.mini-search-icon {
  width: 14px;
  height: 14px;
  color: var(--text-muted, #94a3b8);
}

.mini-input {
  background: transparent;
  border: none;
  color: var(--text-primary, #ffffff);
  font-size: 0.8rem;
  width: 100%;
  outline: none;
}

.terms-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  max-height: 440px;
  overflow-y: auto;
}

.term-item-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.55rem 0.75rem;
  border-radius: 8px;
  background: var(--bg-card-soft, rgba(255, 255, 255, 0.02));
  border: 1px solid transparent;
  color: var(--text-secondary, #cbd5e1);
  font-size: 0.84rem;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: left;
}

.term-item-btn:hover {
  background: rgba(147, 51, 234, 0.1);
  color: #c084fc;
}

.term-item-btn.active {
  background: rgba(147, 51, 234, 0.2);
  border-color: rgba(147, 51, 234, 0.4);
  color: #ffffff;
  font-weight: 600;
}

.doc-count-pill {
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  color: var(--text-muted, #94a3b8);
}

.detail-content {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.postings-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  padding-bottom: 1rem;
}

.posting-term-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
}

.posting-term-title code {
  color: #c084fc;
  background: rgba(147, 51, 234, 0.15);
  padding: 0.15rem 0.5rem;
  border-radius: 6px;
}

.posting-meta {
  font-size: 0.82rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 0.35rem;
}

.occurrences-table {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.table-header {
  display: grid;
  grid-template-columns: 70px 1fr 140px 120px;
  gap: 1rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
}

.table-row {
  display: grid;
  grid-template-columns: 70px 1fr 140px 120px;
  gap: 1rem;
  align-items: center;
  background: var(--bg-card-soft, rgba(255, 255, 255, 0.02));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
  border-radius: 10px;
  padding: 0.75rem;
}

.id-badge {
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
  background: rgba(255, 255, 255, 0.06);
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
}

.doc-title-text {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.doc-url-link {
  font-size: 0.75rem;
  color: #60a5fa;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.15rem;
}

.tf-badge {
  font-size: 0.78rem;
  font-weight: 600;
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
}

.weight-track {
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 3px;
  overflow: hidden;
}

.weight-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #a855f7);
  border-radius: 3px;
}

.tiny-icon {
  width: 11px;
  height: 11px;
}

.empty-selection {
  padding: 3rem;
  text-align: center;
  color: var(--text-muted, #64748b);
}

@media (max-width: 900px) {
  .explorer-grid {
    grid-template-columns: 1fr;
  }
}
</style>
