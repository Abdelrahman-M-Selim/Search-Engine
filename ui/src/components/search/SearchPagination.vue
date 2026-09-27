<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  totalPages: number
}>()

const emit = defineEmits<{
  (e: 'changePage', page: number): void
}>()

const visiblePages = computed(() => {
  const pages: number[] = []
  const max = Math.min(props.totalPages, 5)
  for (let i = 1; i <= max; i++) {
    pages.push(i)
  }
  return pages
})
</script>

<template>
  <div v-if="totalPages > 1" class="pagination-wrapper">
    <button
      class="page-btn nav-btn"
      :disabled="currentPage <= 1"
      @click="emit('changePage', currentPage - 1)"
    >
      &larr; Prev
    </button>

    <div class="page-numbers">
      <button
        v-for="p in visiblePages"
        :key="p"
        class="page-btn num-btn"
        :class="{ active: p === currentPage }"
        @click="emit('changePage', p)"
      >
        {{ p }}
      </button>
    </div>

    <button
      class="page-btn nav-btn"
      :disabled="currentPage >= totalPages"
      @click="emit('changePage', currentPage + 1)"
    >
      Next &rarr;
    </button>
  </div>
</template>

<style scoped>
.pagination-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1rem 0;
}

.page-btn {
  background: var(--bg-card, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  color: var(--text-primary, #ffffff);
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-btn {
  padding: 0.45rem 0.95rem;
}

.num-btn {
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
}

.page-btn:hover:not(:disabled) {
  border-color: #6366f1;
  background: rgba(99, 102, 241, 0.15);
}

.page-btn.active {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border-color: #6366f1;
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.page-btn:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.page-numbers {
  display: flex;
  gap: 0.35rem;
}
</style>
