<script setup lang="ts">
import { onMounted } from 'vue'
import { useSystemHealth } from '../../composables/useSystemHealth'
import IconServer from '../icons/IconServer.vue'
import StatusBadge from '../common/StatusBadge.vue'

const {
  healthSummary,
  isPinging,
  isMock,
  checkHealth,
  toggleMockMode
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
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.header-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-icon {
  width: 24px;
  height: 24px;
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
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.actions-row {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.4rem 0.85rem;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
}

.ping-btn {
  background: rgba(99, 102, 241, 0.2);
  color: #818cf8;
  border-color: rgba(99, 102, 241, 0.4);
}

.ping-btn:hover:not(:disabled) {
  background: rgba(99, 102, 241, 0.35);
  color: #ffffff;
}

.mode-btn {
  background: rgba(255, 255, 255, 0.06);
  color: var(--text-secondary, #cbd5e1);
}

.mode-btn:hover {
  background: rgba(255, 255, 255, 0.12);
  color: #ffffff;
}

.section-desc {
  font-size: 0.88rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 0.35rem;
  line-height: 1.5;
}

.mode-notice {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1.25rem;
  border-radius: 12px;
  font-size: 0.82rem;
  line-height: 1.4;
}

.notice-mock {
  background: rgba(245, 158, 11, 0.1);
  border: 1px solid rgba(245, 158, 11, 0.25);
  color: #fbbf24;
}

.notice-live {
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.25);
  color: #34d399;
}

.notice-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  flex-shrink: 0;
}

.nodes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.25rem;
}

.service-node-card {
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 16px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  transition: all 0.2s ease;
}

.service-node-card:hover {
  transform: translateY(-2px);
  border-color: rgba(99, 102, 241, 0.35);
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);
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
  font-size: 0.68rem;
  font-weight: 700;
  text-transform: uppercase;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
}

.category-core .category-pill {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.category-support .category-pill {
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
}

.category-infra .category-pill {
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
}

.port-pill {
  font-size: 0.72rem;
  font-family: monospace;
  color: var(--text-muted, #94a3b8);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.node-name {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
}

.node-tech {
  font-size: 0.78rem;
  color: #818cf8;
  font-weight: 600;
}

.node-endpoint {
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
}

.node-endpoint code {
  color: #60a5fa;
  font-family: monospace;
  background: rgba(96, 165, 250, 0.1);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
}

.node-desc {
  font-size: 0.8rem;
  color: var(--text-secondary, #cbd5e1);
  line-height: 1.45;
  margin: 0.2rem 0;
  flex: 1;
}

.node-metrics-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  padding-top: 0.6rem;
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
}

.metric-chip {
  font-size: 0.72rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  padding: 0.15rem 0.45rem;
  border-radius: 4px;
  display: flex;
  gap: 0.25rem;
}

.metric-key {
  color: var(--text-muted, #94a3b8);
}

.metric-val {
  color: var(--text-primary, #ffffff);
  font-weight: 600;
}
</style>
