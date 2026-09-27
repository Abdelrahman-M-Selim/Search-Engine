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
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.status-running,
.status-in_progress,
.status-progress {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.status-cached {
  background: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.status-offline,
.status-error {
  background: #fef2f2;
  color: #dc2626;
  border: 1px solid #fecaca;
}

.status-idle,
.status-default {
  background: #f1f5f9;
  color: #64748b;
  border: 1px solid #e2e8f0;
}

.status-core {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.dark-theme .status-healthy,
.dark-theme .status-success,
.dark-theme .status-ok {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.3);
}

.dark-theme .status-running,
.dark-theme .status-in_progress,
.dark-theme .status-progress {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}

.dark-theme .status-cached {
  background: rgba(14, 165, 233, 0.15);
  color: #38bdf8;
  border-color: rgba(14, 165, 233, 0.3);
}

.dark-theme .status-offline,
.dark-theme .status-error {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
  border-color: rgba(239, 68, 68, 0.3);
}

.dark-theme .status-idle,
.dark-theme .status-default {
  background: rgba(100, 116, 139, 0.15);
  color: #94a3b8;
  border-color: rgba(100, 116, 139, 0.3);
}

.dark-theme .status-core {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
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
