<script setup lang="ts">
import { computed } from 'vue'
import type { SearchResultItem } from '../../types/search'
import IconExternal from '../icons/IconExternal.vue'
import StatusBadge from '../common/StatusBadge.vue'

const props = defineProps<{
  item: SearchResultItem
  index: number
  queryTokens?: string[]
}>()

const emit = defineEmits<{
  (e: 'clickResult', item: SearchResultItem, index: number): void
}>()

const domainName = computed(() => {
  if (props.item.domain) return props.item.domain
  try {
    const u = new URL(props.item.url)
    return u.hostname
  } catch {
    return 'web'
  }
})

function handleClick() {
  emit('clickResult', props.item, props.index)
}
</script>

<template>
  <article class="search-result-card" @click="handleClick">
    <!-- Domain Header & URL -->
    <div class="result-header">
      <div class="domain-badge">
        <span class="domain-avatar">{{ domainName.charAt(0).toUpperCase() }}</span>
        <span class="domain-url">{{ item.url }}</span>
      </div>
      <div class="header-badges">
        <StatusBadge v-if="item.score" status="core" size="sm">
          Score: {{ item.score }}
        </StatusBadge>
      </div>
    </div>

    <!-- Title with External Link -->
    <h3 class="result-title">
      <a :href="item.url" target="_blank" rel="noopener noreferrer" @click.stop="handleClick">
        {{ item.title }}
        <IconExternal class="external-icon" />
      </a>
    </h3>

    <!-- Highlighted Snippet -->
    <p class="result-snippet">
      {{ item.snippet }}
    </p>

    <!-- Term Frequency Chips (Microservice Index Features) -->
    <div v-if="item.term_frequencies && Object.keys(item.term_frequencies).length > 0" class="tf-chips-row">
      <span class="tf-label">Indexed Terms:</span>
      <span
        v-for="(freq, term) in item.term_frequencies"
        :key="term"
        class="tf-chip"
      >
        <strong>{{ term }}</strong>: {{ freq }}x
      </span>
    </div>
  </article>
</template>

<style scoped>
.search-result-card {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  background: var(--bg-card, rgba(30, 41, 59, 0.5));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 16px;
  padding: 1.25rem 1.5rem;
  transition: all 0.2s ease;
  position: relative;
}

.search-result-card:hover {
  border-color: rgba(99, 102, 241, 0.35);
  background: var(--bg-card-hover, rgba(30, 41, 59, 0.8));
  transform: translateY(-2px);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.25);
}

.result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.domain-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  overflow: hidden;
}

.domain-avatar {
  width: 20px;
  height: 20px;
  border-radius: 6px;
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.68rem;
  font-weight: 700;
  flex-shrink: 0;
}

.domain-url {
  font-size: 0.78rem;
  color: var(--text-muted, #94a3b8);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 500px;
}

.result-title {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 600;
  line-height: 1.35;
}

.result-title a {
  color: var(--link-color, #60a5fa);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: color 0.15s ease;
}

.result-title a:hover {
  color: #93c5fd;
  text-decoration: underline;
}

.external-icon {
  opacity: 0;
  transition: opacity 0.2s ease;
}

.search-result-card:hover .external-icon {
  opacity: 0.7;
}

.result-snippet {
  font-size: 0.9rem;
  line-height: 1.55;
  color: var(--text-secondary, #cbd5e1);
  margin: 0;
}

.tf-chips-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.4rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
}

.tf-label {
  font-size: 0.72rem;
  color: var(--text-muted, #64748b);
  font-weight: 600;
}

.tf-chip {
  font-size: 0.72rem;
  padding: 0.12rem 0.5rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: #94a3b8;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.tf-chip strong {
  color: #e2e8f0;
}
</style>
