import { ref } from 'vue'
import { healthService } from '../services/healthService'
import type { SystemHealthSummary } from '../types/system'

const healthSummary = ref<SystemHealthSummary>(healthService.getMockTopology(true))
const isPinging = ref(false)

export function useSystemHealth() {
  async function checkHealth() {
    try {
      isPinging.value = true
      healthSummary.value = await healthService.getSystemHealth()
    } catch (err) {
      console.error('Health ping error:', err)
    } finally {
      isPinging.value = false
    }
  }

  return {
    healthSummary,
    isPinging,
    checkHealth
  }
}
