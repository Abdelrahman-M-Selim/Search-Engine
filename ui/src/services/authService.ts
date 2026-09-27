import { config } from './config'
import { httpClient, simulateDelay } from './http'
import { mockUser } from './mockData'
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '../types/auth'

const TOKEN_STORAGE_KEY = 'se_jwt_token'
const USER_STORAGE_KEY = 'se_user_data'

export const authService = {
  async login(req: LoginRequest): Promise<LoginResponse> {
    if (!config.useMock) {
      try {
        const res = await httpClient.post<LoginResponse>('/auth/login', req)
        localStorage.setItem(TOKEN_STORAGE_KEY, res.access_token)
        return res
      } catch (err) {
        console.warn('Backend auth unreachable, falling back to mock login:', err)
      }
    }

    await simulateDelay(250)
    if (!req.email || !req.password) {
      throw new Error('Email and password are required.')
    }
    if (req.password.length < 6) {
      throw new Error('Password must be at least 6 characters.')
    }

    const mockToken = `mock-jwt-${btoa(req.email)}-${Date.now()}`
    const user: User = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      email: req.email,
      created_at: new Date().toISOString()
    }

    localStorage.setItem(TOKEN_STORAGE_KEY, mockToken)
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user))

    return {
      access_token: mockToken,
      expires_in: 3600
    }
  },

  async register(req: RegisterRequest): Promise<User> {
    if (!config.useMock) {
      try {
        return await httpClient.post<User>('/auth/register', req)
      } catch (err) {
        console.warn('Backend auth unreachable, falling back to mock register:', err)
      }
    }

    await simulateDelay(300)
    if (!req.email || !req.password) {
      throw new Error('Email and password are required.')
    }
    if (req.password.length < 8) {
      throw new Error('Password must be at least 8 characters according to system specs.')
    }

    const newUser: User = {
      id: `usr-${Math.random().toString(36).substring(2, 9)}`,
      email: req.email,
      created_at: new Date().toISOString()
    }

    return newUser
  },

  async getMe(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) return null

    if (!config.useMock) {
      try {
        return await httpClient.get<User>('/auth/me')
      } catch (err) {
        console.warn('Backend auth /me failed, fallback to local user data:', err)
      }
    }

    await simulateDelay(100)
    const storedUser = localStorage.getItem(USER_STORAGE_KEY)
    if (storedUser) {
      try {
        return JSON.parse(storedUser) as User
      } catch {
        // ignore
      }
    }
    return mockUser
  },

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  }
}
