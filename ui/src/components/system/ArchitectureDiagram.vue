<script setup lang="ts">
import { onMounted } from 'vue'
import { useSystemHealth } from '../../composables/useSystemHealth'
import IconServer from '../icons/IconServer.vue'
import StatusBadge from '../common/StatusBadge.vue'

const {
  healthSummary,
  isPinging,
  checkHealth
} = useSystemHealth()

onMounted(() => {
  checkHealth()
})
</script>

<template>
  <div class="system-topology">
    <!-- Header -->
    <div class="dashboard-header">
      <div class="header-icon-box">
        <IconServer class="hero-icon" />
      </div>
      <div class="header-text-group">
        <div class="title-row">
          <h2 class="section-title">Microservices Architecture Topology</h2>
          <div class="actions-row">
            <button
              class="btn-action ping-btn"
              :disabled="isPinging"
              @click="checkHealth"
            >
              <span v-if="isPinging">Pinging Services...</span>
              <span v-else>⚡ Ping All Services</span>
            </button>
            <button
              class="btn-action mode-btn"
              @click="toggleMockMode"
            >
              Switch to {{ isMock ? 'Live Gateway' : 'Mock Mode' }}
            </button>
          </div>
        </div>
        <p class="section-desc">
          Polyglot microservices stack communicating synchronously via Nginx Gateway HTTP routes and
          asynchronously via Kafka event streams.
        </p>
      </div>
    </div>

    <!-- Active Mode Notice -->
    <div class="mode-notice" :class="{ 'notice-mock': isMock, 'notice-live': !isMock }">
      <div class="notice-indicator"></div>
      <div class="notice-text">
        <strong v-if="isMock">Running in Simulated Mock Layer:</strong>
        <strong v-else>Connected to Live API Gateway:</strong>
        {{
          isMock
            ? 'All service contracts, inverted index algorithms, and event streams are running with full fidelity in-memory without needing Docker containers started.'
            : 'Requests are routed through http://localhost:8000 with CORS and JWT verification.'
        }}
      </div>
    </div>

    <!-- Microservices Topology Grid -->
    <div class="nodes-grid">
      <div
        v-for="service in Object.values(healthSummary.services)"
        :key="service.id"
        class="service-node-card"
        :class="`category-${service.category}`"
      >
        <div class="node-card-top">
          <div class="node-id-group">
            <span class="category-pill">{{ service.category }}</span>
            <span class="port-pill">:{{ service.port }}</span>
          </div>
          <StatusBadge :status="service.status" size="sm" pulse>
            {{ service.latencyMs }}ms
          </StatusBadge>
        </div>

        <div class="node-name">{{ service.name }}</div>
        <div class="node-tech">{{ service.technology }}</div>
        <div class="node-endpoint">Route: <code>{{ service.endpoint }}</code></div>
        <p class="node-desc">{{ service.description }}</p>

        <!-- Metric badges -->
        <div v-if="service.metrics" class="node-metrics-row">
          <div
            v-for="(val, label) in service.metrics"
            :key="label"
            class="metric-chip"
          >
            <span class="metric-key">{{ label }}:</span>
            <span class="metric-val">{{ val }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.system-topology {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  gap: 0.85rem;
}

.header-icon-box {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: var(--bg-surface-soft);
  color: var(--accent-primary);
  border: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-icon {
  width: 20px;
  height: 20px;
}

.header-text-group {
  flex: 1;
}

.title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.actions-row {
  display: flex;
  gap: 0.45rem;
}

.btn-action {
  padding: 0.35rem 0.75rem;
  border-radius: 6px;
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid var(--border-color);
}

.ping-btn {
  background: #0f172a;
  color: #ffffff;
  border-color: transparent;
}

.dark-theme .ping-btn {
  background: #2563eb;
}

.ping-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.mode-btn {
  background: var(--bg-surface);
  color: var(--text-secondary);
}

.mode-btn:hover {
  background: var(--bg-surface-soft);
  color: var(--text-primary);
}

.section-desc {
  font-size: 0.84rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
  line-height: 1.4;
}

.mode-notice {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.65rem 1rem;
  border-radius: 8px;
  font-size: 0.8rem;
  line-height: 1.4;
}

.notice-mock {
  background: #fffbeb;
  border: 1px solid #fde68a;
  color: #92400e;
}

.dark-theme .notice-mock {
  background: rgba(245, 158, 11, 0.1);
  border-color: rgba(245, 158, 11, 0.25);
  color: #fbbf24;
}

.notice-live {
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  color: #065f46;
}

.dark-theme .notice-live {
  background: rgba(16, 185, 129, 0.1);
  border-color: rgba(16, 185, 129, 0.25);
  color: #34d399;
}

.notice-indicator {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: currentColor;
  flex-shrink: 0;
}

.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
}

.service-node-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.15rem;
  display: flex;
  flex-direction: column;
  gap: 0.45rem;
  transition: all 0.15s ease;
  box-shadow: var(--shadow-sm);
}

.service-node-card:hover {
  transform: translateY(-1px);
  border-color: var(--border-color-hover);
  box-shadow: var(--shadow-md);
}

.node-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.node-id-group {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.category-pill {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.category-core .category-pill {
  background: #eff6ff;
  color: #2563eb;
  border: 1px solid #bfdbfe;
}

.category-support .category-pill {
  background: #ecfdf5;
  color: #059669;
  border: 1px solid #a7f3d0;
}

.category-infra .category-pill {
  background: #fffbeb;
  color: #d97706;
  border: 1px solid #fde68a;
}

.dark-theme .category-core .category-pill {
  background: rgba(59, 130, 246, 0.15);
  color: #60a5fa;
  border-color: rgba(59, 130, 246, 0.3);
}

.dark-theme .category-support .category-pill {
  background: rgba(16, 185, 129, 0.15);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.3);
}

.dark-theme .category-infra .category-pill {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border-color: rgba(245, 158, 11, 0.3);
}

.port-pill {
  font-size: 0.7rem;
  font-family: monospace;
  color: var(--text-muted);
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
}

.node-name {
  font-size: 0.98rem;
  font-weight: 700;
  color: var(--text-primary);
}

.node-tech {
  font-size: 0.76rem;
  color: var(--accent-primary);
  font-weight: 600;
}

.node-endpoint {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.node-endpoint code {
  color: var(--text-primary);
  font-family: monospace;
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  padding: 0.05rem 0.3rem;
  border-radius: 4px;
}

.node-desc {
  font-size: 0.78rem;
  color: var(--text-secondary);
  line-height: 1.4;
  margin: 0.15rem 0;
  flex: 1;
}

.node-metrics-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.35rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--border-color);
}

.metric-chip {
  font-size: 0.7rem;
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  display: flex;
  gap: 0.25rem;
}

.metric-key {
  color: var(--text-muted);
}

.metric-val {
  color: var(--text-primary);
  font-weight: 600;
}
</style>
