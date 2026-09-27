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
  gap: 1.25rem;
}

.auth-tabs {
  display: flex;
  background: var(--bg-card-soft, rgba(0, 0, 0, 0.25));
  border-radius: 10px;
  padding: 0.25rem;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.08));
}

.auth-tab {
  flex: 1;
  padding: 0.5rem;
  background: transparent;
  border: none;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-muted, #94a3b8);
  cursor: pointer;
  transition: all 0.2s ease;
}

.auth-tab.active {
  background: rgba(99, 102, 241, 0.25);
  color: #ffffff;
  border: 1px solid rgba(99, 102, 241, 0.4);
}

.demo-account-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(99, 102, 241, 0.08);
  border: 1px dashed rgba(99, 102, 241, 0.3);
  padding: 0.55rem 0.85rem;
  border-radius: 8px;
  font-size: 0.78rem;
  color: var(--text-secondary, #cbd5e1);
}

.demo-fill-btn {
  background: rgba(99, 102, 241, 0.2);
  border: 1px solid rgba(99, 102, 241, 0.4);
  color: #818cf8;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.2rem 0.55rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.demo-fill-btn:hover {
  background: rgba(99, 102, 241, 0.35);
  color: #ffffff;
}

.form-error-alert {
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
  padding: 0.6rem;
  border-radius: 8px;
  font-size: 0.8rem;
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.form-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary, #cbd5e1);
}

.input-field {
  background: var(--bg-card-soft, rgba(0, 0, 0, 0.2));
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  border-radius: 10px;
  padding: 0.65rem 0.85rem;
  font-size: 0.88rem;
  color: var(--text-primary, #ffffff);
  outline: none;
  transition: border-color 0.2s ease;
}

.input-field:focus {
  border-color: #6366f1;
}

.submit-auth-btn {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: #ffffff;
  border: none;
  padding: 0.75rem;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.35);
  transition: all 0.2s ease;
  margin-top: 0.5rem;
}

.submit-auth-btn:hover:not(:disabled) {
  opacity: 0.92;
  transform: translateY(-1px);
}

.submit-auth-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
</style>
