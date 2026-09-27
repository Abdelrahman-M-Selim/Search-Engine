<script setup lang="ts">
defineProps<{
  count?: number
  type?: 'card' | 'line' | 'text'
}>()
</script>

<template>
  <div class="skeleton-wrapper">
    <div
      v-for="i in (count || 3)"
      :key="i"
      class="skeleton-item"
      :class="`skeleton-${type || 'card'}`"
    >
      <div v-if="type === 'card' || !type" class="skeleton-card-inner">
        <div class="skeleton-line skeleton-title"></div>
        <div class="skeleton-line skeleton-url"></div>
        <div class="skeleton-line skeleton-text-1"></div>
        <div class="skeleton-line skeleton-text-2"></div>
      </div>
      <div v-else class="skeleton-line full-width"></div>
    </div>
  </div>
</template>

<style scoped>
.skeleton-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  width: 100%;
}

.skeleton-item {
  position: relative;
  overflow: hidden;
  background: var(--bg-card, rgba(255, 255, 255, 0.04));
  border-radius: 12px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  padding: 1.25rem;
}

.skeleton-card-inner {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-line {
  border-radius: 6px;
  background: linear-gradient(
    90deg,
    var(--skeleton-base, rgba(255, 255, 255, 0.05)) 25%,
    var(--skeleton-highlight, rgba(255, 255, 255, 0.12)) 50%,
    var(--skeleton-base, rgba(255, 255, 255, 0.05)) 75%
  );
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.8s infinite ease-in-out;
}

.skeleton-title {
  height: 20px;
  width: 60%;
}

.skeleton-url {
  height: 12px;
  width: 35%;
}

.skeleton-text-1 {
  height: 14px;
  width: 90%;
  margin-top: 0.25rem;
}

.skeleton-text-2 {
  height: 14px;
  width: 75%;
}

.full-width {
  height: 20px;
  width: 100%;
}

@keyframes skeleton-shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
</style>
