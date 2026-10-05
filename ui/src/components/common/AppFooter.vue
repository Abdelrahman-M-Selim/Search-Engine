<script setup lang="ts">
import { useSystemHealth } from '../../composables/useSystemHealth'

const { healthSummary } = useSystemHealth()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-container">
      <div class="footer-brand">
        <div class="brand-logo">SE</div>
        <span class="brand-name">Search Engine</span>
      </div>

      <div class="footer-status">
        <span class="status-dot"></span>
        <span class="status-text">All Systems Operational</span>
        <span class="divider">·</span>
        <span class="mode-text">Live Gateway</span>
      </div>

      <div class="footer-copyright">
        &copy; 2026 Search Engine. All rights reserved.
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid var(--border-color);
  background: var(--bg-surface);
  padding: 1.25rem 1.5rem;
  margin-top: auto;
  font-size: 0.82rem;
  color: var(--text-muted);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.footer-brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.brand-logo {
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: #0f172a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
}

.dark-theme .brand-logo {
  background: #3b82f6;
}

.brand-name {
  font-weight: 600;
  color: var(--text-primary);
  font-size: 0.85rem;
}

.footer-status {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.78rem;
}

.status-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10b981;
}

.status-text {
  color: var(--text-secondary);
  font-weight: 500;
}

.divider {
  color: var(--border-color-hover);
}

.mode-text {
  color: var(--text-muted);
}

.footer-copyright {
  font-size: 0.78rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
}
</style>
