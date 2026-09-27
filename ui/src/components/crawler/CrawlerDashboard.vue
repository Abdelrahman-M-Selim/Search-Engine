<script setup lang="ts">
import { onMounted } from 'vue'
import { useCrawler } from '../../composables/useCrawler'
import IconCrawler from '../icons/IconCrawler.vue'
import IconSparkles from '../icons/IconSparkles.vue'
import StatusBadge from '../common/StatusBadge.vue'

const {
  status,
  crawledPages,
  isLoading,
  seedUrlsInput,
  maxPages,
  delaySeconds,
  startCrawl,
  stopCrawl,
  refreshStatus
} = useCrawler()

onMounted(() => {
  refreshStatus()
})
</script>

<template>
  <div class="crawler-dashboard">
    <!-- Header Hero -->
    <div class="dashboard-header">
      <div class="header-icon-box">
        <IconCrawler class="hero-icon" />
      </div>
      <div>
        <h2 class="section-title">Crawler Service Control Hub</h2>
        <p class="section-desc">
          Discovers web content, parses HTML into clean text tokens, obeys domain politeness delays, and publishes
          <code class="code-pill">page_crawled</code> events to Kafka for automatic indexing.
        </p>
      </div>
    </div>

    <!-- Status Cards Grid -->
    <div class="stats-grid">
      <div class="stat-card">
        <span class="stat-label">Crawler State</span>
        <div class="stat-value">
          <StatusBadge :status="status.in_progress ? 'running' : 'idle'" size="md" pulse>
            {{ status.in_progress ? 'Crawling Active' : 'Idle / Ready' }}
          </StatusBadge>
        </div>
      </div>

      <div class="stat-card">
        <span class="stat-label">Total Pages Crawled</span>
        <div class="stat-value num-highlight">{{ status.pages_crawled }}</div>
      </div>

      <div class="stat-card">
        <span class="stat-label">Queue Depth</span>
        <div class="stat-value">{{ status.total_in_queue || 0 }} URLs</div>
      </div>

      <div class="stat-card">
        <span class="stat-label">Politeness Throttling</span>
        <div class="stat-value">{{ delaySeconds }}s per domain</div>
      </div>
    </div>

    <div class="dashboard-columns">
      <!-- Left Column: Crawler Controls & Parameters -->
      <div class="control-panel card">
        <h3 class="card-heading">
          <IconSparkles class="small-icon" />
          <span>Launch New Crawl Job</span>
        </h3>

        <div class="form-group">
          <label class="form-label" for="seed-urls">Seed URLs (one per line):</label>
          <textarea
            id="seed-urls"
            v-model="seedUrlsInput"
            class="textarea-input"
            rows="6"
            placeholder="https://example.com/docs&#10;https://another.org"
          ></textarea>
        </div>

        <div class="form-row">
          <div class="form-group half">
            <label class="form-label" for="max-pages">Max Pages Cap: <strong>{{ maxPages }}</strong></label>
            <input
              id="max-pages"
              v-model.number="maxPages"
              type="range"
              min="5"
              max="200"
              step="5"
              class="range-slider"
            />
          </div>

          <div class="form-group half">
            <label class="form-label" for="delay-sec">Politeness Delay: <strong>{{ delaySeconds }}s</strong></label>
            <input
              id="delay-sec"
              v-model.number="delaySeconds"
              type="range"
              min="0.5"
              max="5"
              step="0.5"
              class="range-slider"
            />
          </div>
        </div>

        <div class="action-buttons">
          <button
            v-if="!status.in_progress"
            class="btn btn-primary"
            :disabled="isLoading"
            @click="startCrawl"
          >
            <span v-if="isLoading">Starting Crawler...</span>
            <span v-else>🚀 Start Crawl Job</span>
          </button>

          <button
            v-else
            class="btn btn-danger"
            @click="stopCrawl"
          >
            ⏹ Stop Crawling
          </button>
        </div>
      </div>

      <!-- Right Column: Live Feed of Discovered & Crawled Pages -->
      <div class="feed-panel card">
        <div class="feed-header">
          <h3 class="card-heading">
            <span>Discovered Pages Feed</span>
          </h3>
          <button class="refresh-btn" @click="refreshStatus" title="Refresh Feed">
            ↻ Refresh
          </button>
        </div>

        <div v-if="crawledPages.length === 0" class="empty-feed">
          No crawled pages in memory. Click "Start Crawl Job" to populate the database.
        </div>

        <div v-else class="feed-list">
          <div
            v-for="page in crawledPages"
            :key="page.id"
            class="feed-item"
          >
            <div class="feed-item-top">
              <span class="feed-url">{{ page.url }}</span>
              <StatusBadge status="healthy" size="sm">HTTP {{ page.status_code }}</StatusBadge>
            </div>
            <div class="feed-title">{{ page.title }}</div>
            <div class="feed-meta">
              <span>{{ page.word_count }} words</span>
              <span>•</span>
              <span>Crawled {{ new Date(page.crawled_at).toLocaleTimeString() }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.crawler-dashboard {
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
  background: rgba(245, 158, 11, 0.15);
  color: #f59e0b;
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
  color: #818cf8;
  font-family: monospace;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.stat-card {
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  border-radius: 14px;
  padding: 1.1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.stat-label {
  font-size: 0.78rem;
  color: var(--text-muted, #94a3b8);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.stat-value {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--text-primary, #ffffff);
}

.num-highlight {
  color: #f59e0b;
}

.dashboard-columns {
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

.card-heading {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  margin: 0;
}

.small-icon {
  color: #f59e0b;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.half {
  flex: 1;
}

.form-label {
  font-size: 0.82rem;
  color: var(--text-secondary, #cbd5e1);
  font-weight: 500;
}

.form-label strong {
  color: #818cf8;
}

.textarea-input {
  background: var(--bg-card-soft, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  border-radius: 10px;
  color: var(--text-primary, #ffffff);
  padding: 0.75rem;
  font-family: monospace;
  font-size: 0.85rem;
  outline: none;
  resize: vertical;
}

.textarea-input:focus {
  border-color: #6366f1;
}

.range-slider {
  width: 100%;
  accent-color: #6366f1;
  cursor: pointer;
}

.btn {
  padding: 0.65rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  font-size: 0.9rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
}

.btn-primary {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  color: #ffffff;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.feed-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.refresh-btn {
  background: none;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  color: var(--text-muted, #94a3b8);
  font-size: 0.78rem;
  padding: 0.25rem 0.6rem;
  border-radius: 6px;
  cursor: pointer;
}

.refresh-btn:hover {
  color: var(--text-primary, #ffffff);
  border-color: rgba(255, 255, 255, 0.2);
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  max-height: 380px;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.feed-item {
  background: var(--bg-card-soft, rgba(255, 255, 255, 0.03));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
  border-radius: 10px;
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.feed-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.feed-url {
  font-size: 0.76rem;
  color: #60a5fa;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-title {
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
}

.feed-meta {
  font-size: 0.72rem;
  color: var(--text-muted, #64748b);
  display: flex;
  gap: 0.4rem;
}

.empty-feed {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted, #64748b);
  font-size: 0.85rem;
}

@media (max-width: 900px) {
  .dashboard-columns {
    grid-template-columns: 1fr;
  }
}
</style>
