<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuth } from './composables/useAuth'
import { initConfigFromStorage } from './services/config'
import AppHeader from './components/common/AppHeader.vue'
import AppFooter from './components/common/AppFooter.vue'
import AuthModal from './components/auth/AuthModal.vue'
import Toast from './components/common/Toast.vue'

import SearchView from './views/SearchView.vue'
import CrawlerView from './views/CrawlerView.vue'
import IndexerView from './views/IndexerView.vue'
import AnalyticsView from './views/AnalyticsView.vue'
import SystemView from './views/SystemView.vue'

const activeTab = ref<'search' | 'crawler' | 'indexer' | 'analytics' | 'system'>('search')
const { checkCurrentUser } = useAuth()

onMounted(() => {
  initConfigFromStorage()
  checkCurrentUser()
})
</script>

<template>
  <div class="app-layout">
    <!-- Background subtle gradient glows -->
    <div class="ambient-glow top-left"></div>
    <div class="ambient-glow bottom-right"></div>

    <!-- Top Navigation Header -->
    <AppHeader v-model:active-tab="activeTab" />

    <!-- Main View Content -->
    <main class="app-main">
      <Transition name="view-fade" mode="out-in">
        <SearchView v-if="activeTab === 'search'" key="search" />
        <CrawlerView v-else-if="activeTab === 'crawler'" key="crawler" />
        <IndexerView v-else-if="activeTab === 'indexer'" key="indexer" />
        <AnalyticsView v-else-if="activeTab === 'analytics'" key="analytics" />
        <SystemView v-else-if="activeTab === 'system'" key="system" />
      </Transition>
    </main>

    <!-- Global Footer -->
    <AppFooter />

    <!-- Global Auth Modal -->
    <AuthModal />

    <!-- Global Floating Toasts -->
    <Toast />
  </div>
</template>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow-x: hidden;
}

.ambient-glow {
  position: fixed;
  width: 600px;
  height: 600px;
  border-radius: 50%;
  pointer-events: none;
  z-index: 0;
  filter: blur(120px);
  opacity: 0.12;
}

.ambient-glow.top-left {
  top: -200px;
  left: -200px;
  background: radial-gradient(circle, #6366f1 0%, rgba(99, 102, 241, 0) 70%);
}

.ambient-glow.bottom-right {
  bottom: -200px;
  right: -200px;
  background: radial-gradient(circle, #06b6d4 0%, rgba(6, 182, 212, 0) 70%);
}

.app-main {
  flex: 1;
  padding: 1.5rem;
  position: relative;
  z-index: 1;
}

/* Smooth view transition */
.view-fade-enter-active,
.view-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.view-fade-enter-from {
  opacity: 0;
  transform: translateY(8px);
}

.view-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
