<script setup lang="ts">
import { useSearch } from '../../composables/useSearch'
import IconSparkles from '../icons/IconSparkles.vue'

const {
  recentSearches,
  performSearch,
  clearRecentSearches
} = useSearch()

const trendingSearches = [
  'FastAPI microservices',
  'PostgreSQL Inverted Index',
  'Kafka Page Crawled Events',
  'Redis Latency Caching',
  'Nginx Gateway'
]
</script>

<template>
  <div class="recent-searches-container">
    <!-- Trending / Suggested queries -->
    <div class="search-tags-section">
      <div class="section-title">
        <IconSparkles class="spark-icon" />
        <span>Trending Topics</span>
      </div>
      <div class="tags-cloud">
        <button
          v-for="item in trendingSearches"
          :key="item"
          class="query-chip trending-chip"
          @click="performSearch(item)"
        >
          {{ item }}
        </button>
      </div>
    </div>

    <!-- Recent user queries -->
    <div v-if="recentSearches.length > 0" class="search-tags-section">
      <div class="section-title space-between">
        <span class="muted-title">Your Recent Searches</span>
        <button class="clear-history-link" @click="clearRecentSearches">Clear</button>
      </div>
      <div class="tags-cloud">
        <button
          v-for="item in recentSearches"
          :key="item"
          class="query-chip recent-chip"
          @click="performSearch(item)"
        >
          {{ item }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.recent-searches-container {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.search-tags-section {
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.82rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.section-title.space-between {
  justify-content: space-between;
}

.muted-title {
  color: var(--text-muted, #94a3b8);
}

.spark-icon {
  color: #818cf8;
  width: 14px;
  height: 14px;
}

.clear-history-link {
  background: none;
  border: none;
  font-size: 0.75rem;
  color: var(--text-muted, #64748b);
  cursor: pointer;
  padding: 0;
}

.clear-history-link:hover {
  color: #ef4444;
  text-decoration: underline;
}

.tags-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.query-chip {
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  color: var(--text-secondary, #cbd5e1);
  padding: 0.35rem 0.85rem;
  border-radius: 20px;
  font-size: 0.82rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.query-chip:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: rgba(99, 102, 241, 0.4);
  color: #ffffff;
  transform: translateY(-1px);
}

.trending-chip {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
}
</style>
