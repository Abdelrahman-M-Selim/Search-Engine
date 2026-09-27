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
  gap: 1rem;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  margin-bottom: 1.25rem;
  font-size: 0.82rem;
  color: var(--text-muted, #94a3b8);
}

.stats-left {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.stats-text strong {
  color: var(--text-primary, #ffffff);
}

.latency {
  opacity: 0.8;
  margin-left: 0.25rem;
}

.token-tags {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.token-prefix {
  font-size: 0.75rem;
  opacity: 0.7;
}

.token-tag {
  font-size: 0.72rem;
  padding: 0.1rem 0.4rem;
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  border-radius: 4px;
}

.stats-right {
  display: flex;
  align-items: center;
}

.sort-controls {
  display: flex;
  align-items: center;
  gap: 0.45rem;
}

.sort-label {
  font-size: 0.78rem;
  color: var(--text-muted, #94a3b8);
}

.sort-select {
  background: var(--bg-card, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  color: var(--text-primary, #ffffff);
  border-radius: 8px;
  padding: 0.25rem 0.6rem;
  font-size: 0.8rem;
  outline: none;
  cursor: pointer;
}
</style>
