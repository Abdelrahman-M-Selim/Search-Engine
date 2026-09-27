<script setup lang="ts">
import { useSystemHealth } from '../../composables/useSystemHealth'

const { healthSummary, isMock } = useSystemHealth()
</script>

<template>
  <footer class="app-footer">
    <div class="footer-inner">
      <div class="footer-left">
        <span class="footer-badge">MVP Arch</span>
        <span class="footer-tech">Python FastAPI · NestJS · PostgreSQL · Redis · Kafka · Nginx</span>
      </div>

      <div class="footer-center">
        <span class="dot-indicator"></span>
        <span>Gateway Status: <strong>{{ healthSummary.gateway }}</strong></span>
        <span class="separator">|</span>
        <span>Mode: <strong :class="{ 'text-amber': isMock, 'text-emerald': !isMock }">{{ isMock ? 'Simulated Mock' : 'Live Gateway' }}</strong></span>
      </div>

      <div class="footer-right">
        <span>Search Engine Microservices &copy; 2026</span>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  background: var(--bg-surface-soft, rgba(15, 23, 42, 0.6));
  padding: 1rem 1.5rem;
  font-size: 0.78rem;
  color: var(--text-muted, #94a3b8);
  margin-top: auto;
}

.footer-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.footer-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.footer-badge {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  font-weight: 700;
  font-size: 0.7rem;
}

.footer-center {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.dot-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #10b981;
}

.separator {
  opacity: 0.3;
}

.text-amber {
  color: #f59e0b;
}

.text-emerald {
  color: #10b981;
}

@media (max-width: 768px) {
  .footer-inner {
    flex-direction: column;
    text-align: center;
  }
}
</style>
