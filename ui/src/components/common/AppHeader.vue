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
const { isMock, toggleMockMode } = useSystemHealth()
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
        <!-- Mock / Live Mode Toggle -->
        <button
          class="mode-toggle-btn"
          :class="{ 'is-mock': isMock, 'is-live': !isMock }"
          @click="toggleMockMode"
          :title="isMock ? 'Running on Mock Service Layer. Click to switch to Live Backend.' : 'Running on Live Gateway. Click to switch to Mock Mode.'"
        >
          <StatusBadge :status="isMock ? 'running' : 'healthy'" size="sm" pulse>
            {{ isMock ? 'Mock Engine' : 'Live Gateway' }}
          </StatusBadge>
        </button>

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
  background: var(--nav-bg, rgba(15, 23, 42, 0.85));
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  padding: 0 1.5rem;
  transition: all 0.3s ease;
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 68px;
  gap: 1.5rem;
}

/* Brand */
.brand {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  user-select: none;
}

.brand-badge {
  width: 38px;
  height: 38px;
  border-radius: 10px;
  background: linear-gradient(135deg, #6366f1 0%, #3b82f6 50%, #06b6d4 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
}

.brand-spark {
  color: #ffffff;
  font-weight: 800;
  font-size: 0.95rem;
  letter-spacing: -0.05em;
}

.brand-text {
  display: flex;
  flex-direction: column;
}

.brand-title {
  font-weight: 800;
  font-size: 1.15rem;
  color: var(--text-primary, #ffffff);
  line-height: 1.1;
  background: linear-gradient(90deg, #ffffff 0%, #cbd5e1 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-subtitle {
  font-size: 0.7rem;
  font-weight: 600;
  color: #818cf8;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

/* Nav tabs */
.nav-tabs {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  background: var(--bg-card-soft, rgba(255, 255, 255, 0.04));
  padding: 0.3rem 0.4rem;
  border-radius: 12px;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.06));
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 0.95rem;
  font-size: 0.86rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  background: transparent;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
}

.nav-tab:hover {
  color: var(--text-primary, #ffffff);
  background: rgba(255, 255, 255, 0.05);
}

.nav-tab.active {
  color: #ffffff;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.25) 0%, rgba(59, 130, 246, 0.25) 100%);
  border: 1px solid rgba(99, 102, 241, 0.4);
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.15);
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
  gap: 0.75rem;
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
  width: 36px;
  height: 36px;
  border-radius: 9px;
  background: var(--bg-card-soft, rgba(255, 255, 255, 0.05));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
  color: var(--text-muted, #94a3b8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.icon-btn:hover {
  color: var(--text-primary, #ffffff);
  background: rgba(255, 255, 255, 0.1);
}

.login-trigger-btn {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.45rem 1rem;
  font-size: 0.85rem;
  font-weight: 600;
  border-radius: 9px;
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: 1px solid rgba(255, 255, 255, 0.15);
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(99, 102, 241, 0.3);
}

.login-trigger-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

.user-menu-wrapper {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.3rem 0.65rem 0.3rem 0.3rem;
  background: var(--bg-card-soft, rgba(255, 255, 255, 0.06));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.1));
  border-radius: 20px;
  cursor: pointer;
  color: var(--text-primary, #ffffff);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
}

.user-email-text {
  font-size: 0.82rem;
  font-weight: 600;
}

.dropdown-menu {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  width: 220px;
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  border-radius: 12px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);
  padding: 0.75rem;
  z-index: 1001;
}

.dropdown-user-email {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-primary, #ffffff);
  word-break: break-all;
}

.dropdown-user-id {
  font-size: 0.72rem;
  color: var(--text-muted, #94a3b8);
  margin-top: 0.2rem;
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color, rgba(255, 255, 255, 0.08));
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
  background: rgba(239, 68, 68, 0.1);
}

@media (max-width: 900px) {
  .nav-tab span {
    display: none;
  }
  .nav-tab {
    padding: 0.45rem 0.6rem;
  }
  .brand-subtitle {
    display: none;
  }
}
</style>
