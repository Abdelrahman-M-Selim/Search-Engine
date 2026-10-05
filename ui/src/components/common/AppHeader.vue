<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../../composables/useAuth'
import { useSystemHealth } from '../../composables/useSystemHealth'
import { useTheme } from '../../composables/useTheme'
import IconSearch from '../icons/IconSearch.vue'
import IconCrawler from '../icons/IconCrawler.vue'
import IconIndexer from '../icons/IconIndexer.vue'
import IconAnalytics from '../icons/IconAnalytics.vue'
import IconServer from '../icons/IconServer.vue'
import IconSun from '../icons/IconSun.vue'
import IconMoon from '../icons/IconMoon.vue'
import IconUser from '../icons/IconUser.vue'
import StatusBadge from './StatusBadge.vue'

defineProps<{
  activeTab: 'search' | 'crawler' | 'indexer' | 'analytics' | 'system'
}>()

const emit = defineEmits<{
  (e: 'update:activeTab', tab: 'search' | 'crawler' | 'indexer' | 'analytics' | 'system'): void
}>()

const { user, isAuthenticated, logout, openAuthModal } = useAuth()
const { theme, toggleTheme } = useTheme()

const showUserMenu = ref(false)

function selectTab(tab: 'search' | 'crawler' | 'indexer' | 'analytics' | 'system') {
  emit('update:activeTab', tab)
}
</script>

<template>
  <header class="app-header">
    <div class="header-inner">
      <!-- Brand Logo -->
      <div class="brand" @click="selectTab('search')">
        <div class="brand-badge">
          <span class="brand-spark">SE</span>
        </div>
        <div class="brand-text">
          <span class="brand-title">VectorEngine</span>
          <span class="brand-subtitle">Microservices UI</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <nav class="nav-tabs">
        <button
          class="nav-tab"
          :class="{ active: activeTab === 'search' }"
          @click="selectTab('search')"
        >
          <IconSearch />
          <span>Search</span>
        </button>

        <button
          class="nav-tab"
          :class="{ active: activeTab === 'crawler' }"
          @click="selectTab('crawler')"
        >
          <IconCrawler />
          <span>Crawler</span>
        </button>

        <button
          class="nav-tab"
          :class="{ active: activeTab === 'indexer' }"
          @click="selectTab('indexer')"
        >
          <IconIndexer />
          <span>Inverted Index</span>
        </button>

        <button
          class="nav-tab"
          :class="{ active: activeTab === 'analytics' }"
          @click="selectTab('analytics')"
        >
          <IconAnalytics />
          <span>Analytics</span>
        </button>

        <button
          class="nav-tab"
          :class="{ active: activeTab === 'system' }"
          @click="selectTab('system')"
        >
          <IconServer />
          <span>Topology</span>
          <span class="live-dot"></span>
        </button>
      </nav>

      <!-- Right Action Bar -->
      <div class="header-actions">
        <!-- Theme Toggle -->
        <button class="icon-btn theme-btn" @click="toggleTheme" title="Toggle Light / Dark Mode">
          <IconSun v-if="theme === 'dark'" />
          <IconMoon v-else />
        </button>

        <!-- Auth / Profile -->
        <div class="user-menu-wrapper">
          <button
            v-if="isAuthenticated"
            class="user-btn"
            @click="showUserMenu = !showUserMenu"
          >
            <div class="user-avatar">
              {{ user?.email?.charAt(0).toUpperCase() || 'U' }}
            </div>
            <span class="user-email-text">{{ user?.email?.split('@')[0] }}</span>
          </button>

          <button
            v-else
            class="login-trigger-btn"
            @click="openAuthModal('login')"
          >
            <IconUser />
            <span>Sign In</span>
          </button>

          <!-- Dropdown menu -->
          <div v-if="showUserMenu && isAuthenticated" class="dropdown-menu" @click.outside="showUserMenu = false">
            <div class="dropdown-header">
              <div class="dropdown-user-email">{{ user?.email }}</div>
              <div class="dropdown-user-id">ID: {{ user?.id }}</div>
            </div>
            <div class="dropdown-divider"></div>
            <button class="dropdown-item danger" @click="logout(); showUserMenu = false">
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  position: sticky;
  top: 0;
  z-index: 1000;
  background: var(--nav-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color);
  padding: 0 1.5rem;
  transition: all 0.2s ease;
}

.header-inner {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 64px;
  gap: 1.5rem;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  cursor: pointer;
  user-select: none;
}

.brand-badge {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: #0f172a;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}

.dark-theme .brand-badge {
  background: #3b82f6;
}

.brand-spark {
  color: #ffffff;
  font-weight: 700;
  font-size: 0.85rem;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-weight: 700;
  font-size: 1.05rem;
  color: var(--text-primary);
  line-height: 1.1;
}

.brand-subtitle {
  font-size: 0.68rem;
  font-weight: 600;
  color: var(--text-muted);
  letter-spacing: 0.03em;
  text-transform: uppercase;
}

/* Nav tabs */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: var(--bg-surface-soft);
  padding: 0.25rem;
  border-radius: 10px;
  border: 1px solid var(--border-color);
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.85rem;
  font-size: 0.84rem;
  font-weight: 500;
  color: var(--text-muted);
  background: transparent;
  border: none;
  border-radius: 7px;
  cursor: pointer;
  transition: all 0.15s ease;
  position: relative;
}

.nav-tab:hover {
  color: var(--text-primary);
  background: rgba(0, 0, 0, 0.04);
}

.dark-theme .nav-tab:hover {
  background: rgba(255, 255, 255, 0.05);
}

.nav-tab.active {
  color: var(--text-primary);
  background: var(--bg-surface);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.live-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background-color: #10b981;
}

/* Actions */
.header-actions {
  display: flex;
  align-items: center;
  gap: 0.65rem;
}

.mode-toggle-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
}

.icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.icon-btn:hover {
  color: var(--text-primary);
  background: var(--border-color);
}

.login-trigger-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.4rem 0.9rem;
  font-size: 0.84rem;
  font-weight: 600;
  border-radius: 8px;
  color: #ffffff;
  background: #0f172a;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.15s ease;
  box-shadow: var(--shadow-sm);
}

.dark-theme .login-trigger-btn {
  background: #2563eb;
}

.login-trigger-btn:hover {
  opacity: 0.9;
}

.user-menu-wrapper {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.25rem 0.6rem 0.25rem 0.25rem;
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  border-radius: 20px;
  cursor: pointer;
  color: var(--text-primary);
}

.user-avatar {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: #0f172a;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.72rem;
  font-weight: 700;
}

.dark-theme .user-avatar {
  background: #2563eb;
}

.user-email-text {
  font-size: 0.8rem;
  font-weight: 500;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 10px;
  box-shadow: var(--shadow-lg);
  padding: 0.75rem;
  z-index: 1001;
}

.dropdown-user-email {
  font-size: 0.84rem;
  font-weight: 600;
  color: var(--text-primary);
  word-break: break-all;
}

.dropdown-user-id {
  font-size: 0.72rem;
  color: var(--text-muted);
  margin-top: 0.2rem;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: 0.6rem 0;
}

.dropdown-item {
  width: 100%;
  text-align: left;
  background: none;
  border: none;
  padding: 0.4rem 0.6rem;
  font-size: 0.82rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dropdown-item.danger {
  color: #ef4444;
}

.dropdown-item.danger:hover {
  background: rgba(239, 68, 68, 0.08);
}

@media (max-width: 900px) {
  .nav-tab span {
    display: none;
  }
  .nav-tab {
    padding: 0.4rem 0.55rem;
  }
  .brand-subtitle {
    display: none;
  }
}
</style>
