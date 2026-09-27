<script setup lang="ts">
import StatusBadge from '../common/StatusBadge.vue'
import type { SearchFilters } from '../../types/search'

defineProps<{
  totalResults: number
  executionTimeMs: number
  isCached: boolean
  queryTokens: string[]
  filters: SearchFilters
}>()

const emit = defineEmits<{
  (e: 'changeSort', sort: 'relevance' | 'date'): void
}>()
</script>

<template>
  <div class="search-stats-bar">
    <div class="stats-left">
      <span class="stats-text">
        About <strong>{{ totalResults }}</strong> results
        <span class="latency">({{ (executionTimeMs / 1000).toFixed(3) }} seconds)</span>
      </span>

      <!-- Redis Cache Indicator -->
      <StatusBadge
        :status="isCached ? 'cached' : 'idle'"
        size="sm"
        :pulse="isCached"
      >
        {{ isCached ? 'Redis Cache HIT' : 'PostgreSQL Index MISS' }}
      </StatusBadge>

      <!-- Token tags -->
      <div v-if="queryTokens.length > 0" class="token-tags">
        <span class="token-prefix">Tokens:</span>
        <span v-for="t in queryTokens" :key="t" class="token-tag">#{{ t }}</span>
      </div>
    </div>

    <div class="stats-right">
      <div class="sort-controls">
        <label for="sort-select" class="sort-label">Sort by:</label>
        <select
          id="sort-select"
          class="sort-select"
          :value="filters.sortBy"
          @change="emit('changeSort', ($event.target as HTMLSelectElement).value as any)"
        >
          <option value="relevance">Relevance (Score)</option>
          <option value="date">Most Recent</option>
        </select>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-stats-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
  padding: 0.65rem 0;
  border-bottom: 1px solid var(--border-color);
  margin-bottom: 1rem;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.stats-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.65rem;
}

.stats-text strong {
  color: var(--text-primary);
}

.latency {
  opacity: 0.8;
  margin-left: 0.2rem;
}

.token-tags {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.token-prefix {
  font-size: 0.72rem;
  opacity: 0.7;
}

.token-tag {
  font-size: 0.7rem;
  padding: 0.1rem 0.35rem;
  background: var(--bg-surface-soft);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  border-radius: 4px;
}

.stats-right {
  display: flex;
  align-items: center;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.sort-label {
  font-size: 0.78rem;
  color: var(--text-muted);
}

.sort-select {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  border-radius: 6px;
  padding: 0.2rem 0.5rem;
  font-size: 0.78rem;
  outline: none;
  cursor: pointer;
}
</style>
