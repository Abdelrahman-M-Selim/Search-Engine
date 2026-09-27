<script setup lang="ts">
defineProps<{
  status?: string
  label?: string
  size?: 'sm' | 'md' | 'lg'
  pulse?: boolean
}>()
</script>

<template>
  <span
    class="status-badge"
    :class="[
      `status-${status || 'default'}`,
      `size-${size || 'md'}`,
      { 'with-pulse': pulse }
    ]"
  >
    <span v-if="pulse" class="pulse-dot"></span>
    <slot>{{ label || status }}</slot>
  </span>
</template>

<style scoped>
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  font-weight: 600;
  border-radius: 9999px;
  text-transform: capitalize;
  letter-spacing: 0.02em;
  white-space: nowrap;
  transition: all 0.2s ease;
}

.size-sm {
  font-size: 0.72rem;
  padding: 0.15rem 0.55rem;
}

.size-md {
  font-size: 0.8rem;
  padding: 0.25rem 0.75rem;
}

.size-lg {
  font-size: 0.9rem;
  padding: 0.35rem 0.95rem;
}

/* Status variants */
.status-healthy,
.status-success,
.status-ok {
  background: rgba(16, 185, 129, 0.12);
  color: #10b981;
  border: 1px solid rgba(16, 185, 129, 0.25);
}

.status-running,
.status-in_progress,
.status-progress {
  background: rgba(245, 158, 11, 0.12);
  color: #f59e0b;
  border: 1px solid rgba(245, 158, 11, 0.3);
}

.status-cached {
  background: rgba(14, 165, 233, 0.12);
  color: #0ea5e9;
  border: 1px solid rgba(14, 165, 233, 0.3);
}

.status-offline,
.status-error {
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.3);
}

.status-idle,
.status-default {
  background: rgba(100, 116, 139, 0.12);
  color: #94a3b8;
  border: 1px solid rgba(100, 116, 139, 0.25);
}

.status-core {
  background: rgba(99, 102, 241, 0.12);
  color: #818cf8;
  border: 1px solid rgba(99, 102, 241, 0.3);
}

.pulse-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
  animation: pulse-dot-anim 1.5s infinite;
}

@keyframes pulse-dot-anim {
  0% { transform: scale(0.95); opacity: 0.6; }
  50% { transform: scale(1.3); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.6; }
}
</style>
