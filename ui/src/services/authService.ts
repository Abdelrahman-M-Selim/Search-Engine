import { httpClient } from './http'
import type { User, LoginRequest, RegisterRequest, LoginResponse } from '../types/auth'

const TOKEN_STORAGE_KEY = 'se_jwt_token'
const USER_STORAGE_KEY = 'se_user_data'

export const authService = {
  async login(req: LoginRequest): Promise<LoginResponse> {
    const res = await httpClient.post<LoginResponse>('/auth/login', req)
    localStorage.setItem(TOKEN_STORAGE_KEY, res.access_token)
    return res
  },

  async register(req: RegisterRequest): Promise<User> {
    return await httpClient.post<User>('/auth/register', req)
  },

  async getMe(): Promise<User | null> {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY)
    if (!token) return null

    try {
      return await httpClient.get<User>('/auth/me')
    } catch {
      const storedUser = localStorage.getItem(USER_STORAGE_KEY)
      if (storedUser) {
        try {
          return JSON.parse(storedUser) as User
        } catch {
          // ignore
        }
      }
      return null
    }
  },

  logout(): void {
    localStorage.removeItem(TOKEN_STORAGE_KEY)
    localStorage.removeItem(USER_STORAGE_KEY)
  },

  getToken(): string | null {
    return localStorage.getItem(TOKEN_STORAGE_KEY)
  }
}
