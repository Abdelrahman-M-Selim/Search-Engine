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
  refreshStatus,
  currentPage,
  totalPages,
  totalItems,
  changePage
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
            <span>Discovered Pages Feed ({{ totalItems }})</span>
          </h3>
          <button class="refresh-btn" @click="refreshStatus()" title="Refresh Feed">
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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

.stat-label {
  font-size: 0.74rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-weight: 600;
}

.stat-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.num-highlight {
  color: var(--accent-primary);
}

.dashboard-columns {
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
  gap: 1rem;
  box-shadow: var(--shadow-sm);
}

.card-heading {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.small-icon {
  color: var(--accent-primary);
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-row {
  display: flex;
  gap: 1rem;
}

.half {
  flex: 1;
}

.form-label {
  font-size: 0.8rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.form-label strong {
  color: var(--text-primary);
}

.textarea-input {
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  color: var(--text-primary);
  padding: 0.65rem;
  font-family: monospace;
  font-size: 0.82rem;
  outline: none;
  resize: vertical;
}

.textarea-input:focus {
  border-color: var(--accent-primary);
}

.range-slider {
  width: 100%;
  accent-color: var(--accent-primary);
  cursor: pointer;
}

.btn {
  padding: 0.55rem 1rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  width: 100%;
}

.btn-primary {
  background: #0f172a;
  color: #ffffff;
}

.dark-theme .btn-primary {
  background: #2563eb;
}

.btn-primary:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-danger {
  background: #dc2626;
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
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  font-size: 0.75rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  cursor: pointer;
}

.refresh-btn:hover {
  color: var(--text-primary);
  background: var(--bg-surface-soft);
}

.feed-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  max-height: 340px;
  overflow-y: auto;
}

.feed-item {
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.65rem;
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.feed-item-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.feed-url {
  font-size: 0.74rem;
  color: var(--link-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.feed-title {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--text-primary);
}

.feed-meta {
  font-size: 0.7rem;
  color: var(--text-muted);
  display: flex;
  gap: 0.35rem;
}

.empty-feed {
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
  font-size: 0.82rem;
}

@media (max-width: 900px) {
  .dashboard-columns {
    grid-template-columns: 1fr;
  }
}
</style>
