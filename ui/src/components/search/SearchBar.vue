<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useSearch } from '../../composables/useSearch'
import IconSearch from '../icons/IconSearch.vue'
import IconSparkles from '../icons/IconSparkles.vue'

const props = defineProps<{
  size?: 'hero' | 'compact'
  placeholder?: string
  autoFocus?: boolean
}>()

const emit = defineEmits<{
  (e: 'search', query: string): void
}>()

const {
  query,
  suggestions,
  fetchSuggestions,
  performSearch,
  clearSearch
} = useSearch()

const inputRef = ref<HTMLInputElement | null>(null)
const isFocused = ref(false)
const selectedSuggestionIndex = ref(-1)

function handleInput() {
  selectedSuggestionIndex.value = -1
  fetchSuggestions(query.value)
}

function handleSearch(customQuery?: string) {
  const finalQuery = customQuery !== undefined ? customQuery : query.value
  if (!finalQuery.trim()) return
  query.value = finalQuery
  suggestions.value = []
  emit('search', finalQuery)
  performSearch(finalQuery)
}

function selectSuggestion(item: string) {
  handleSearch(item)
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'ArrowDown') {
    e.preventDefault()
    if (suggestions.value.length > 0) {
      selectedSuggestionIndex.value = (selectedSuggestionIndex.value + 1) % suggestions.value.length
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault()
    if (suggestions.value.length > 0) {
      selectedSuggestionIndex.value =
        selectedSuggestionIndex.value <= 0
          ? suggestions.value.length - 1
          : selectedSuggestionIndex.value - 1
    }
  } else if (e.key === 'Enter') {
    e.preventDefault()
    if (selectedSuggestionIndex.value >= 0 && suggestions.value[selectedSuggestionIndex.value]) {
      handleSearch(suggestions.value[selectedSuggestionIndex.value])
    } else {
      handleSearch()
    }
  } else if (e.key === 'Escape') {
    suggestions.value = []
  }
}

function handleGlobalShortcut(e: KeyboardEvent) {
  if (e.key === '/' && document.activeElement !== inputRef.value) {
    e.preventDefault()
    inputRef.value?.focus()
  }
}

function handleBlur() {
  setTimeout(() => {
    isFocused.value = false
  }, 200)
}

onMounted(() => {
  window.addEventListener('keydown', handleGlobalShortcut)
  if (props.autoFocus) {
    inputRef.value?.focus()
  }
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalShortcut)
})
</script>

<template>
  <div class="search-bar-container" :class="[`mode-${size || 'hero'}`, { focused: isFocused }]">
    <div class="search-input-box">
      <div class="search-icon-wrapper">
        <IconSearch class="search-icon" />
      </div>

      <input
        ref="inputRef"
        v-model="query"
        type="text"
        class="search-input"
        :placeholder="placeholder || 'Search indexed documents, topics, or keywords... (Press \'/\' to focus)'"
        @input="handleInput"
        @focus="isFocused = true"
        @blur="handleBlur"
        @keydown="handleKeyDown"
      />

      <div class="search-actions">
        <button
          v-if="query"
          class="clear-btn"
          title="Clear search"
          @click="clearSearch"
        >
          ✕
        </button>

        <button
          class="submit-search-btn"
          @click="handleSearch()"
          title="Execute search"
        >
          <IconSparkles class="sparkle-icon" />
          <span>Search</span>
        </button>
      </div>
    </div>

    <!-- Suggestions Autocomplete Dropdown -->
    <div
      v-if="suggestions.length > 0 && isFocused"
      class="suggestions-dropdown"
    >
      <div
        v-for="(item, idx) in suggestions"
        :key="idx"
        class="suggestion-item"
        :class="{ active: selectedSuggestionIndex === idx }"
        @mousedown="selectSuggestion(item)"
      >
        <IconSearch class="suggestion-icon" />
        <span class="suggestion-text">{{ item }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.search-bar-container {
  position: relative;
  width: 100%;
  transition: all 0.2s ease;
}

.search-input-box {
  display: flex;
  align-items: center;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-sm);
  transition: all 0.2s ease;
  position: relative;
  z-index: 10;
}

.mode-hero .search-input-box {
  height: 56px;
  padding: 0 0.5rem 0 1rem;
  border-radius: 14px;
}

.mode-compact .search-input-box {
  height: 44px;
  padding: 0 0.4rem 0 0.85rem;
  border-radius: 10px;
}

.search-bar-container.focused .search-input-box {
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12), var(--shadow-md);
}

.search-icon-wrapper {
  display: flex;
  align-items: center;
  color: var(--text-muted);
  margin-right: 0.65rem;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 0.98rem;
  color: var(--text-primary);
  font-family: inherit;
}

.mode-compact .search-input {
  font-size: 0.9rem;
}

.search-input::placeholder {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0.3rem 0.45rem;
  border-radius: 6px;
  font-size: 0.85rem;
  transition: all 0.15s ease;
}

.clear-btn:hover {
  color: var(--text-primary);
  background: var(--bg-surface-soft);
}

.submit-search-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: #0f172a;
  color: #ffffff;
  border: none;
  font-weight: 600;
  font-size: 0.84rem;
  padding: 0.5rem 1rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.dark-theme .submit-search-btn {
  background: #2563eb;
}

.mode-compact .submit-search-btn {
  padding: 0.35rem 0.75rem;
  font-size: 0.8rem;
  border-radius: 7px;
}

.submit-search-btn:hover {
  opacity: 0.9;
}

.sparkle-icon {
  width: 14px;
  height: 14px;
}

/* Suggestions Dropdown */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: 50;
  padding: 0.35rem 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.65rem;
  padding: 0.55rem 1rem;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.88rem;
  transition: all 0.1s ease;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: var(--bg-surface-soft);
  color: var(--text-primary);
}

.suggestion-icon {
  width: 14px;
  height: 14px;
  color: var(--text-muted);
}
</style>
