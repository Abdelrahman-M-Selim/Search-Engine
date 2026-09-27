import { ref, watchEffect } from 'vue'

export type Theme = 'dark' | 'light'

const currentTheme = ref<Theme>((localStorage.getItem('se_theme') as Theme) || 'dark')

export function useTheme() {
  function toggleTheme() {
    currentTheme.value = currentTheme.value === 'dark' ? 'light' : 'dark'
    localStorage.setItem('se_theme', currentTheme.value)
  }

  function setTheme(theme: Theme) {
    currentTheme.value = theme
    localStorage.setItem('se_theme', theme)
  }

  watchEffect(() => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement
      if (currentTheme.value === 'dark') {
        root.classList.add('dark-theme')
        root.classList.remove('light-theme')
      } else {
        root.classList.add('light-theme')
        root.classList.remove('dark-theme')
      }
    }
  })

  return {
    theme: currentTheme,
    toggleTheme,
    setTheme
  }
}
