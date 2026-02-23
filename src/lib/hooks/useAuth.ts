import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient, loginRequest } from '@/lib/api/client'
import type { User, LoginPayload, RegisterPayload, TokenResponse } from '@/lib/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (payload: LoginPayload) => Promise<{ success: boolean; error?: string }>
  register: (payload: RegisterPayload) => Promise<{ success: boolean; error?: string }>
  forgotPassword: (email: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
  setUser: (user: User) => void
  clearError: () => void
  checkAuth: () => Promise<void>
}

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (payload: LoginPayload) => {
        set({ isLoading: true, error: null })
        try {
          const { data } = await loginRequest(payload.email, payload.password) as { data: TokenResponse }

          // Set cookie (expires in 7 days)
          const maxAge = 7 * 24 * 60 * 60
          document.cookie = `access_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`

          set({
            user: data.user,
            token: data.access_token,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          })
          return { success: true }
        } catch (error: unknown) {
          const message = getErrorMessage(error)
          set({ error: message, isLoading: false, isAuthenticated: false })
          return { success: false, error: message }
        }
      },

      register: async (payload: RegisterPayload) => {
        set({ isLoading: true, error: null })
        try {
          await apiClient.post('/auth/register', payload)
          set({ isLoading: false })
          return { success: true }
        } catch (error: unknown) {
          const message = getErrorMessage(error)
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      forgotPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        try {
          await apiClient.post('/auth/forgot-password', { email })
          set({ isLoading: false })
          return { success: true }
        } catch (error: unknown) {
          const message = getErrorMessage(error)
          set({ error: message, isLoading: false })
          return { success: false, error: message }
        }
      },

      logout: () => {
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        set({ user: null, token: null, isAuthenticated: false, error: null })
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      },

      setUser: (user: User) => set({ user }),

      clearError: () => set({ error: null }),

      checkAuth: async () => {
        const token = get().token
        if (!token) {
          set({ isAuthenticated: false, user: null })
          return
        }

        try {
          const { data } = await apiClient.get<User>('/users/me')
          set({ user: data, isAuthenticated: true })
        } catch {
          document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
          set({ user: null, token: null, isAuthenticated: false })
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as {
      response?: {
        status?: number
        data?: {
          detail?: unknown
          message?: string
        }
      }
    }

    const status = axiosError.response?.status
    const detail = axiosError.response?.data?.detail

    if (status === 401) return 'Invalid email or password'
    if (status === 422) return 'Please check your input and try again'
    if (status === 429) return 'Too many attempts. Please try again later'
    if (status === 404) return 'Service not found. Please try again later'

    if (typeof detail === 'string') return detail
    if (typeof detail === 'object' && detail !== null && 'message' in detail) {
      return String((detail as { message: unknown }).message)
    }
    if (Array.isArray(detail)) {
      return detail
        .map((e: unknown) => {
          if (typeof e === 'object' && e !== null && 'msg' in e) {
            return (e as { msg: string }).msg
          }
          return String(e)
        })
        .join(', ')
    }

    if (axiosError.response?.data?.message) {
      return axiosError.response.data.message
    }
  }

  if (typeof error === 'object' && error !== null && 'message' in error) {
    const msg = (error as { message: string }).message
    if (msg.includes('Network Error') || msg.includes('ECONNREFUSED')) {
      return 'Cannot connect to server. Please check your internet connection.'
    }
    if (msg.includes('timeout')) {
      return 'Request timed out. Please try again.'
    }
  }

  return 'An unexpected error occurred. Please try again.'
}

export default useAuth