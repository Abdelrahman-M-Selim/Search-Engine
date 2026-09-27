<script setup lang="ts">
import { useToast } from '../../composables/useToast'

const { toasts, dismiss } = useToast()
</script>

<template>
  <div class="toast-container">
    <TransitionGroup name="toast-slide">
      <div
        v-for="toast in toasts"
        :key="toast.id"
        class="toast-card"
        :class="`toast-${toast.type}`"
        @click="dismiss(toast.id)"
      >
        <div class="toast-indicator"></div>
        <div class="toast-content">
          <div class="toast-title">{{ toast.title }}</div>
          <div v-if="toast.message" class="toast-message">{{ toast.message }}</div>
        </div>
        <button class="toast-close" @click.stop="dismiss(toast.id)">✕</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-container {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-width: 380px;
  pointer-events: none;
}

.toast-card {
  pointer-events: auto;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  border-radius: 12px;
  padding: 0.85rem 1rem;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
}

.toast-card:hover {
  transform: translateY(-2px);
}

.toast-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-top: 0.35rem;
  flex-shrink: 0;
}

.toast-success .toast-indicator { background: #10b981; }
.toast-error .toast-indicator { background: #ef4444; }
.toast-info .toast-indicator { background: #3b82f6; }
.toast-warning .toast-indicator { background: #f59e0b; }

.toast-content {
  flex: 1;
}

.toast-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary, #f8fafc);
}

.toast-message {
  font-size: 0.78rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 0.15rem;
  line-height: 1.4;
}

.toast-close {
  background: none;
  border: none;
  color: var(--text-muted, #94a3b8);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0;
  opacity: 0.6;
}

.toast-close:hover {
  opacity: 1;
}

.toast-slide-enter-active,
.toast-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.toast-slide-enter-from {
  opacity: 0;
  transform: translateX(50px) scale(0.9);
}

.toast-slide-leave-to {
  opacity: 0;
  transform: translateY(20px) scale(0.9);
}
</style>
