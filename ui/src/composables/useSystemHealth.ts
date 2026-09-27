import { ref } from 'vue'
import { healthService } from '../services/healthService'
import { config, setMockMode } from '../services/config'
import { useToast } from './useToast'
import type { SystemHealthSummary } from '../types/system'

const isMock = ref(config.useMock)
const healthSummary = ref<SystemHealthSummary>(healthService.getMockTopology(false))
const isPinging = ref(false)

export function useSystemHealth() {
  const toast = useToast()

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

  function toggleMockMode() {
    isMock.value = !isMock.value
    setMockMode(isMock.value)
    if (isMock.value) {
      toast.info('Mock Mode Active', 'Using simulated in-memory services and realistic search data.')
    } else {
      toast.warning('Live Gateway Mode Active', `Sending real HTTP requests to ${config.apiGatewayBaseUrl}`)
    }
    checkHealth()
  }

  return {
    isMock,
    healthSummary,
    isPinging,
    checkHealth,
    toggleMockMode
  }
}
