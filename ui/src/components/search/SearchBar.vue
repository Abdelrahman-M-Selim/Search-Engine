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
  transition: all 0.3s ease;
}

.search-input-box {
  display: flex;
  align-items: center;
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.15));
  border-radius: 16px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.05);
  transition: all 0.25s ease;
  position: relative;
  z-index: 10;
}

.mode-hero .search-input-box {
  height: 62px;
  padding: 0 0.75rem 0 1.25rem;
  border-radius: 20px;
}

.mode-compact .search-input-box {
  height: 48px;
  padding: 0 0.5rem 0 1rem;
  border-radius: 12px;
}

.search-bar-container.focused .search-input-box {
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.2), 0 15px 30px -5px rgba(0, 0, 0, 0.4);
}

.search-icon-wrapper {
  display: flex;
  align-items: center;
  color: var(--text-muted, #94a3b8);
  margin-right: 0.75rem;
}

.search-input {
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  font-size: 1.05rem;
  color: var(--text-primary, #ffffff);
  font-family: inherit;
}

.mode-compact .search-input {
  font-size: 0.95rem;
}

.search-input::placeholder {
  color: var(--text-muted, #64748b);
  font-size: 0.92rem;
}

.search-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-muted, #94a3b8);
  cursor: pointer;
  padding: 0.35rem 0.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.clear-btn:hover {
  color: var(--text-primary, #ffffff);
  background: rgba(255, 255, 255, 0.08);
}

.submit-search-btn {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border: none;
  font-weight: 600;
  font-size: 0.88rem;
  padding: 0.55rem 1.15rem;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.mode-compact .submit-search-btn {
  padding: 0.4rem 0.85rem;
  font-size: 0.82rem;
  border-radius: 8px;
}

.submit-search-btn:hover {
  opacity: 0.92;
  transform: translateY(-1px);
}

/* Suggestions Dropdown */
.suggestions-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--bg-surface, #1e293b);
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  border-radius: 16px;
  box-shadow: 0 20px 35px -10px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  z-index: 50;
  padding: 0.4rem 0;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.65rem 1.25rem;
  color: var(--text-primary, #e2e8f0);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.15s ease;
}

.suggestion-item:hover,
.suggestion-item.active {
  background: rgba(99, 102, 241, 0.15);
  color: #818cf8;
}

.suggestion-icon {
  width: 14px;
  height: 14px;
  opacity: 0.6;
}
</style>
