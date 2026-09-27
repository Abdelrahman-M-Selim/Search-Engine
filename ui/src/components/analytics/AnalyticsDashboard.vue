<script setup lang="ts">
import { onMounted } from 'vue'
import { useAnalytics } from '../../composables/useAnalytics'
import IconAnalytics from '../icons/IconAnalytics.vue'
import StatusBadge from '../common/StatusBadge.vue'

const {
  topQueries,
  ctrData,
  searchLogs,
  selectedWindow,
  refreshAnalytics,
  setWindow
} = useAnalytics()

onMounted(() => {
  refreshAnalytics()
})
</script>

<template>
  <div class="analytics-dashboard">
    <!-- Header Hero -->
    <div class="dashboard-header">
      <div class="header-icon-box">
        <IconAnalytics class="hero-icon" />
      </div>
      <div>
        <h2 class="section-title">Telemetry & Analytics Service</h2>
        <p class="section-desc">
          Asynchronously ingests <code class="code-pill">search_performed</code> and
          <code class="code-pill">result_clicked</code> events via Kafka/HTTP to compute click-through rates (CTR) and query rankings.
        </p>
      </div>
    </div>

    <!-- Stats Row with CTR Window Filter -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-card-header">
          <span class="stat-label">Click-Through Rate (CTR)</span>
          <div class="window-chips">
            <button
              v-for="w in ['24h', '7d', '30d']"
              :key="w"
              class="win-btn"
              :class="{ active: selectedWindow === w }"
              @click="setWindow(w)"
            >
              {{ w }}
            </button>
          </div>
        </div>
        <div class="stat-value num-emerald">
          {{ (ctrData.ctr * 100).toFixed(1) }}%
        </div>
        <div class="stat-sub">
          Based on {{ ctrData.total_clicks || 38 }} clicks / {{ ctrData.total_searches || 120 }} searches
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-label">Total Logged Searches</span>
        <div class="stat-value">{{ ctrData.total_searches || 120 }}</div>
        <div class="stat-sub">Aggregated in PostgreSQL <code class="code-pill-sm">search_logs</code></div>
      </div>

      <div class="stat-card">
        <span class="stat-label">Total Result Clicks</span>
        <div class="stat-value">{{ ctrData.total_clicks || 38 }}</div>
        <div class="stat-sub">Stored in <code class="code-pill-sm">click_logs</code></div>
      </div>

      <div class="stat-card">
        <span class="stat-label">Analytics Backend</span>
        <div class="stat-value">
          <StatusBadge status="healthy" size="md">NestJS Microservice</StatusBadge>
        </div>
        <div class="stat-sub">Kafka Topic: <code class="code-pill-sm">result_clicked</code></div>
      </div>
    </div>

    <!-- Analytics Breakdown -->
    <div class="analytics-columns">
      <!-- Left: Top Search Queries -->
      <div class="card">
        <div class="card-header-row">
          <h3 class="card-heading">🔥 Most Popular Search Queries</h3>
          <span class="card-sub-tag">GET /analytics/top-queries</span>
        </div>

        <div class="top-queries-list">
          <div
            v-for="(item, idx) in topQueries"
            :key="item.query"
            class="query-row"
          >
            <span class="rank-num">#{{ idx + 1 }}</span>
            <div class="query-info">
              <div class="query-text">{{ item.query }}</div>
              <div class="query-bar-track">
                <div
                  class="query-bar-fill"
                  :style="{ width: `${Math.min(100, (item.count / (topQueries[0]?.count || 1)) * 100)}%` }"
                ></div>
              </div>
            </div>
            <div class="query-count-badge">{{ item.count }} searches</div>
          </div>
        </div>
      </div>

      <!-- Right: Real-time Search Activity Stream -->
      <div class="card">
        <div class="card-header-row">
          <h3 class="card-heading">⚡ Recent Search Event Stream</h3>
          <span class="card-sub-tag">Live Ingestion</span>
        </div>

        <div class="activity-feed">
          <div
            v-for="log in searchLogs"
            :key="log.id"
            class="activity-item"
          >
            <div class="activity-dot"></div>
            <div class="activity-body">
              <div class="activity-query">"{{ log.query }}"</div>
              <div class="activity-meta">
                <span v-if="log.user_id" class="user-tag">User: {{ log.user_id }}</span>
                <span v-else class="anon-tag">Anonymous</span>
                <span>•</span>
                <span>{{ log.result_count }} results</span>
                <span>•</span>
                <span>{{ new Date(log.searched_at).toLocaleTimeString() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.analytics-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.dashboard-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-icon-box {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(16, 185, 129, 0.15);
  color: #10b981;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.hero-icon {
  width: 24px;
  height: 24px;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.section-desc {
  font-size: 0.88rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 0.2rem;
  line-height: 1.5;
}

.code-pill {
  background: rgba(255, 255, 255, 0.08);
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  color: #10b981;
  font-family: monospace;
}

.code-pill-sm {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
  color: #94a3b8;
  font-family: monospace;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 14px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.stat-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.window-chips {
  display: flex;
  gap: 0.2rem;
}

.win-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  color: var(--text-muted, #94a3b8);
  font-size: 0.68rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
}

.win-btn.active {
  background: rgba(16, 185, 129, 0.2);
  color: #10b981;
  border-color: rgba(16, 185, 129, 0.4);
  font-weight: 600;
}

.stat-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
}

.num-emerald {
  color: #10b981;
}

.stat-sub {
  font-size: 0.75rem;
  color: var(--text-muted, #64748b);
}

.analytics-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.card {
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 16px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-heading {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.card-sub-tag {
  font-size: 0.72rem;
  color: var(--text-muted, #64748b);
  font-family: monospace;
}

.top-queries-list {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.query-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.rank-num {
  font-size: 0.82rem;
  font-weight: 700;
  color: #818cf8;
  width: 24px;
  text-align: center;
}

.query-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.query-text {
  font-size: 0.88rem;
  font-weight: 500;
  color: var(--text-primary, #ffffff);
}

.query-bar-track {
  width: 100%;
  height: 5px;
  background: rgba(255, 255, 255, 0.06);
  border-radius: 3px;
  overflow: hidden;
}

.query-bar-fill {
  height: 100%;
  background: linear-gradient(90deg, #6366f1, #10b981);
  border-radius: 3px;
}

.query-count-badge {
  font-size: 0.75rem;
  color: var(--text-muted, #94a3b8);
  font-weight: 600;
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 380px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  padding: 0.65rem;
  background: var(--bg-card-soft, rgba(255, 255, 255, 0.02));
  border-radius: 8px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.05));
}

.activity-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background-color: #3b82f6;
  margin-top: 0.35rem;
  flex-shrink: 0;
}

.activity-body {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.activity-query {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.72rem;
  color: var(--text-muted, #64748b);
}

.user-tag {
  color: #818cf8;
}

.anon-tag {
  color: #94a3b8;
}

@media (max-width: 900px) {
  .analytics-columns {
    grid-template-columns: 1fr;
  }
}
</style>
