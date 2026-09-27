<script setup lang="ts">
import { useSearch } from '../composables/useSearch'
import SearchBar from '../components/search/SearchBar.vue'
import SearchResultCard from '../components/search/SearchResultCard.vue'
import SearchStatsBar from '../components/search/SearchStatsBar.vue'
import SearchPagination from '../components/search/SearchPagination.vue'
import RecentSearches from '../components/search/RecentSearches.vue'
import LoadingSkeleton from '../components/common/LoadingSkeleton.vue'
import IconSparkles from '../components/icons/IconSparkles.vue'

const {
  query,
  results,
  hasSearched,
  isLoading,
  currentPage,
  totalPages,
  totalResults,
  executionTimeMs,
  isCached,
  queryTokens,
  filters,
  performSearch,
  handleResultClick,
  setPage
} = useSearch()

function onSearchExecuted(q: string) {
  performSearch(q, 1)
}

function onChangeSort(sortBy: 'relevance' | 'date') {
  filters.value.sortBy = sortBy
  performSearch(query.value, 1)
}
</script>

<template>
  <div class="search-view-container">
    <!-- HERO STATE (Initial landing before query) -->
    <section v-if="!hasSearched" class="hero-section">
      <div class="hero-brand">
        <div class="hero-badge">
          <IconSparkles class="hero-sparkle" />
          <span>Vector & Inverted-Index Powered</span>
        </div>
        <h1 class="hero-title">
          Explore the Knowledge Graph
        </h1>
        <p class="hero-subtitle">
          Lightning-fast document discovery across indexed microservice architectures, technical docs, and web pages.
        </p>
      </div>

      <div class="hero-search-wrapper">
        <SearchBar size="hero" auto-focus @search="onSearchExecuted" />
      </div>

      <div class="hero-recent-wrapper">
        <RecentSearches />
      </div>
    </section>

    <!-- RESULTS STATE (When query is active) -->
    <section v-else class="results-section">
      <!-- Top Compact Search Bar -->
      <div class="results-search-topbar">
        <SearchBar size="compact" @search="onSearchExecuted" />
      </div>

      <!-- Stats Bar (Results count, Latency, Cache Hit/Miss, Sort) -->
      <SearchStatsBar
        :total-results="totalResults"
        :execution-time-ms="executionTimeMs"
        :is-cached="isCached"
        :query-tokens="queryTokens"
        :filters="filters"
        @change-sort="onChangeSort"
      />

      <!-- Loading Skeleton -->
      <div v-if="isLoading" class="results-loading">
        <LoadingSkeleton :count="4" type="card" />
      </div>

      <!-- Empty State -->
      <div v-else-if="results.length === 0" class="empty-results-card">
        <div class="empty-icon">🔍</div>
        <h3 class="empty-title">No matching indexed documents found</h3>
        <p class="empty-text">
          No records matched your search terms: <strong>"{{ query }}"</strong>.
        </p>
        <div class="empty-suggestions">
          <span>Suggestions:</span>
          <ul>
            <li>Check for spelling mistakes or try broader keywords.</li>
            <li>Head to the <strong>Crawler Hub</strong> tab to crawl new seed domains.</li>
            <li>Inspect indexed terms in the <strong>Inverted Index</strong> tab.</li>
          </ul>
        </div>
      </div>

      <!-- Results List -->
      <div v-else class="results-list">
        <SearchResultCard
          v-for="(item, idx) in results"
          :key="item.page_id || idx"
          :item="item"
          :index="idx"
          :query-tokens="queryTokens"
          @click-result="handleResultClick"
        />

        <!-- Pagination -->
        <SearchPagination
          :current-page="currentPage"
          :total-pages="totalPages"
          @change-page="setPage"
        />
      </div>
    </section>
  </div>
</template>

<style scoped>
.search-view-container {
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
}

/* Hero Section */
.hero-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: calc(80vh - 140px);
  gap: 2rem;
  padding: 2rem 0;
}

.hero-brand {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.35rem 0.85rem;
  border-radius: 9999px;
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  color: #818cf8;
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.02em;
}

.hero-sparkle {
  width: 14px;
  height: 14px;
}

.hero-title {
  font-size: 2.75rem;
  font-weight: 800;
  line-height: 1.15;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 50%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
}

.hero-subtitle {
  font-size: 1.05rem;
  color: var(--text-muted, #94a3b8);
  max-width: 580px;
  line-height: 1.6;
  margin: 0;
}

.hero-search-wrapper {
  width: 100%;
  max-width: 720px;
}

.hero-recent-wrapper {
  width: 100%;
  max-width: 720px;
}

/* Results Section */
.results-section {
  display: flex;
  flex-direction: column;
  padding: 1.5rem 0 3rem 0;
}

.results-search-topbar {
  margin-bottom: 1rem;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.empty-results-card {
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 16px;
  padding: 3rem 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.empty-icon {
  font-size: 2.5rem;
}

.empty-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.empty-text {
  font-size: 0.92rem;
  color: var(--text-muted, #94a3b8);
  margin: 0;
}

.empty-suggestions {
  margin-top: 1rem;
  text-align: left;
  background: var(--bg-card-soft, rgba(255, 255, 255, 0.03));
  border-radius: 12px;
  padding: 1rem 1.5rem;
  font-size: 0.85rem;
  color: var(--text-secondary, #cbd5e1);
}

.empty-suggestions ul {
  margin: 0.5rem 0 0 1rem;
  padding: 0;
}

.empty-suggestions li {
  margin-bottom: 0.35rem;
}

@media (max-width: 768px) {
  .hero-title {
    font-size: 2rem;
  }
}
</style>
