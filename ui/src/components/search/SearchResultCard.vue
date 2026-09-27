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
  gap: 0.4rem;
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.15rem 1.35rem;
  transition: all 0.15s ease;
  position: relative;
  box-shadow: var(--shadow-sm);
}

.search-result-card:hover {
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-1px);
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
  gap: 0.45rem;
  overflow: hidden;
}

.domain-avatar {
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: var(--bg-surface-soft);
  color: var(--text-secondary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.65rem;
  font-weight: 700;
  flex-shrink: 0;
}

.domain-url {
  font-size: 0.76rem;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 500px;
}

.result-title {
  margin: 0;
  font-size: 1.05rem;
  font-weight: 600;
  line-height: 1.3;
}

.result-title a {
  color: var(--link-color);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  transition: color 0.15s ease;
}

.result-title a:hover {
  color: var(--link-color-hover);
  text-decoration: underline;
}

.external-icon {
  opacity: 0;
  transition: opacity 0.15s ease;
  width: 12px;
  height: 12px;
}

.search-result-card:hover .external-icon {
  opacity: 0.7;
}

.result-snippet {
  font-size: 0.88rem;
  line-height: 1.5;
  color: var(--text-secondary);
  margin: 0;
}

.tf-chips-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.35rem;
  margin-top: 0.25rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.tf-label {
  font-size: 0.7rem;
  color: var(--text-muted);
  font-weight: 600;
}

.tf-chip {
  font-size: 0.7rem;
  padding: 0.1rem 0.45rem;
  border-radius: 4px;
  background: var(--bg-surface-soft);
  color: var(--text-muted);
  border: 1px solid var(--border-color);
}

.tf-chip strong {
  color: var(--text-primary);
}
</style>
