import { ref, computed } from 'vue'
import { authService } from '../services/authService'
import { useToast } from './useToast'
import type { User, LoginRequest, RegisterRequest } from '../types/auth'

const user = ref<User | null>(null)
const token = ref<string | null>(authService.getToken())
const isLoading = ref(false)
const isAuthModalOpen = ref(false)
const authModalMode = ref<'login' | 'register'>('login')

export function useAuth() {
  const toast = useToast()

  const isAuthenticated = computed(() => !!token.value)

  async function checkCurrentUser() {
    if (!token.value) return
    try {
      isLoading.value = true
      user.value = await authService.getMe()
    } catch {
      logout()
    } finally {
      isLoading.value = false
    }
  }

  async function login(req: LoginRequest): Promise<boolean> {
    try {
      isLoading.value = true
      const res = await authService.login(req)
      token.value = res.access_token
      await checkCurrentUser()
      isAuthModalOpen.value = false
      toast.success('Welcome back!', `Logged in successfully as ${req.email}`)
      return true
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Login failed'
      toast.error('Authentication Error', msg)
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function register(req: RegisterRequest): Promise<boolean> {
    try {
      isLoading.value = true
      await authService.register(req)
      toast.success('Account Created', 'Your account has been registered. Logging you in...')
      // Auto-login after registration
      return await login({ email: req.email, password: req.password })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Registration failed'
      toast.error('Registration Error', msg)
      return false
    } finally {
      isLoading.value = false
    }
  }

  function logout() {
    authService.logout()
    user.value = null
    token.value = null
    toast.info('Logged Out', 'You have been signed out.')
  }

  function openAuthModal(mode: 'login' | 'register' = 'login') {
    authModalMode.value = mode
    isAuthModalOpen.value = true
  }

  function closeAuthModal() {
    isAuthModalOpen.value = false
  }

  return {
    user,
    token,
    isLoading,
    isAuthenticated,
    isAuthModalOpen,
    authModalMode,
    login,
    register,
    logout,
    openAuthModal,
    closeAuthModal,
    checkCurrentUser
  }
}
