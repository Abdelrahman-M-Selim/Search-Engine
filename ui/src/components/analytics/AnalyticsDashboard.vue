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
  gap: 1.25rem;
}

.dashboard-header {
  display: flex;
  align-items: center;
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

.section-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.section-desc {
  font-size: 0.84rem;
  color: var(--text-muted);
  margin-top: 0.15rem;
  line-height: 1.4;
}

.code-pill {
  background: var(--bg-surface-soft);
  padding: 0.1rem 0.35rem;
  border-radius: 4px;
  color: var(--text-primary);
  font-family: monospace;
  font-size: 0.8rem;
  border: 1px solid var(--border-color);
}

.code-pill-sm {
  background: var(--bg-surface-soft);
  padding: 0.05rem 0.3rem;
  border-radius: 3px;
  color: var(--text-muted);
  font-family: monospace;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 0.85rem;
}

.stat-card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  box-shadow: var(--shadow-sm);
}

.stat-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.stat-label {
  font-size: 0.74rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.window-chips {
  display: flex;
  gap: 0.2rem;
}

.win-btn {
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.68rem;
  padding: 0.1rem 0.4rem;
  border-radius: 4px;
  cursor: pointer;
}

.win-btn.active {
  background: #ecfdf5;
  color: #059669;
  border-color: #a7f3d0;
  font-weight: 600;
}

.dark-theme .win-btn.active {
  background: rgba(16, 185, 129, 0.2);
  color: #34d399;
  border-color: rgba(16, 185, 129, 0.4);
}

.stat-value {
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--text-primary);
}

.num-emerald {
  color: #059669;
}

.dark-theme .num-emerald {
  color: #34d399;
}

.stat-sub {
  font-size: 0.74rem;
  color: var(--text-muted);
}

.analytics-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.card {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
  box-shadow: var(--shadow-sm);
}

.card-header-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-heading {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.card-sub-tag {
  font-size: 0.72rem;
  color: var(--text-muted);
  font-family: monospace;
}

.top-queries-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.query-row {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.rank-num {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--accent-primary);
  width: 20px;
  text-align: center;
}

.query-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.query-text {
  font-size: 0.84rem;
  font-weight: 500;
  color: var(--text-primary);
}

.query-bar-track {
  width: 100%;
  height: 4px;
  background: var(--border-color);
  border-radius: 2px;
  overflow: hidden;
}

.query-bar-fill {
  height: 100%;
  background: var(--accent-primary);
  border-radius: 2px;
}

.query-count-badge {
  font-size: 0.74rem;
  color: var(--text-muted);
  font-weight: 500;
}

.activity-feed {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 340px;
  overflow-y: auto;
}

.activity-item {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  padding: 0.55rem;
  background: var(--bg-surface-soft);
  border-radius: 6px;
  border: 1px solid var(--border-color);
}

.activity-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: var(--accent-primary);
  margin-top: 0.35rem;
  flex-shrink: 0;
}

.activity-body {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
}

.activity-query {
  font-size: 0.82rem;
  font-weight: 600;
  color: var(--text-primary);
}

.activity-meta {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  font-size: 0.7rem;
  color: var(--text-muted);
}

.user-tag {
  color: var(--accent-primary);
}

.anon-tag {
  color: var(--text-muted);
}

@media (max-width: 900px) {
  .analytics-columns {
    grid-template-columns: 1fr;
  }
}
</style>
