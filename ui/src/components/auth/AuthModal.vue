<script setup lang="ts">
import { ref } from 'vue'
import { useAuth } from '../../composables/useAuth'
import Modal from '../common/Modal.vue'

const {
  isAuthModalOpen,
  authModalMode,
  isLoading,
  login,
  register,
  closeAuthModal
} = useAuth()

const email = ref('')
const password = ref('')
const formError = ref('')

function fillDemoAccount() {
  email.value = 'developer@searchengine.internal'
  password.value = 'SecretPass123'
  formError.value = ''
}

async function handleSubmit() {
  formError.value = ''
  if (!email.value || !password.value) {
    formError.value = 'Please provide both email and password.'
    return
  }

  if (authModalMode.value === 'login') {
    const success = await login({ email: email.value, password: password.value })
    if (success) {
      email.value = ''
      password.value = ''
    }
  } else {
    if (password.value.length < 8) {
      formError.value = 'Password must be at least 8 characters long.'
      return
    }
    const success = await register({ email: email.value, password: password.value })
    if (success) {
      email.value = ''
      password.value = ''
    }
  }
}
</script>

<template>
  <Modal
    :is-open="isAuthModalOpen"
    :title="authModalMode === 'login' ? 'Sign In to Account' : 'Register New Account'"
    width="420px"
    @close="closeAuthModal"
  >
    <div class="auth-modal-content">
      <!-- Mode Tabs -->
      <div class="auth-tabs">
        <button
          class="auth-tab"
          :class="{ active: authModalMode === 'login' }"
          @click="authModalMode = 'login'; formError = ''"
        >
          Sign In
        </button>
        <button
          class="auth-tab"
          :class="{ active: authModalMode === 'register' }"
          @click="authModalMode = 'register'; formError = ''"
        >
          Create Account
        </button>
      </div>

      <!-- Quick Demo Account Fill -->
      <div class="demo-account-box">
        <span>Need test credentials?</span>
        <button type="button" class="demo-fill-btn" @click="fillDemoAccount">
          ⚡ Auto-fill Demo User
        </button>
      </div>

      <!-- Form Error Alert -->
      <div v-if="formError" class="form-error-alert">
        {{ formError }}
      </div>

      <!-- Form -->
      <form class="auth-form" @submit.prevent="handleSubmit">
        <div class="form-group">
          <label class="form-label" for="auth-email">Email Address</label>
          <input
            id="auth-email"
            v-model="email"
            type="email"
            class="input-field"
            placeholder="developer@example.com"
            required
          />
        </div>

        <div class="form-group">
          <label class="form-label" for="auth-password">Password</label>
          <input
            id="auth-password"
            v-model="password"
            type="password"
            class="input-field"
            :placeholder="authModalMode === 'register' ? 'Min. 8 characters' : 'Enter password'"
            required
          />
        </div>

        <button
          type="submit"
          class="submit-auth-btn"
          :disabled="isLoading"
        >
          <span v-if="isLoading">Authenticating...</span>
          <span v-else>{{ authModalMode === 'login' ? 'Sign In' : 'Create Account' }}</span>
        </button>
      </form>
    </div>
  </Modal>
</template>

<style scoped>
.auth-modal-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.auth-tabs {
  display: flex;
  background: var(--bg-surface-soft);
  border-radius: 8px;
  padding: 0.2rem;
  border: 1px solid var(--border-color);
}

.auth-tab {
  flex: 1;
  padding: 0.45rem;
  background: transparent;
  border: none;
  border-radius: 6px;
  font-size: 0.84rem;
  font-weight: 500;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.15s ease;
}

.auth-tab.active {
  background: var(--bg-surface);
  color: var(--text-primary);
  font-weight: 600;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
}

.demo-account-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface-soft);
  border: 1px dashed var(--border-color);
  padding: 0.45rem 0.75rem;
  border-radius: 8px;
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.demo-fill-btn {
  background: var(--bg-surface);
  border: 1px solid var(--border-color);
  color: var(--accent-primary);
  font-size: 0.74rem;
  font-weight: 600;
  padding: 0.2rem 0.5rem;
  border-radius: 5px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.demo-fill-btn:hover {
  background: var(--bg-surface-soft);
  color: var(--text-primary);
}

.form-error-alert {
  background: #fef2f2;
  border: 1px solid #fecaca;
  color: #dc2626;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.78rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 0.85rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.form-label {
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.input-field {
  background: var(--bg-surface-soft);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 0.55rem 0.75rem;
  font-size: 0.86rem;
  color: var(--text-primary);
  outline: none;
  transition: border-color 0.15s ease;
}

.input-field:focus {
  border-color: var(--accent-primary);
}

.submit-auth-btn {
  background: #0f172a;
  color: #ffffff;
  border: none;
  padding: 0.65rem;
  border-radius: 8px;
  font-size: 0.88rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: all 0.15s ease;
  margin-top: 0.35rem;
}

.dark-theme .submit-auth-btn {
  background: #2563eb;
}

.submit-auth-btn:hover:not(:disabled) {
  opacity: 0.9;
}

.submit-auth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
