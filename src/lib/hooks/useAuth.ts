import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { apiClient } from '@/lib/api/client'
import type { User, LoginPayload, RegisterPayload, TokenResponse } from '@/lib/types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (payload: LoginPayload) => Promise<boolean>
  register: (payload: RegisterPayload) => Promise<boolean>
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
          const { data } = await apiClient.post<TokenResponse>('/auth/login', payload)
          
          // Set cookie (expires in 7 days)
          const maxAge = 7 * 24 * 60 * 60
          document.cookie = `access_token=${data.access_token}; path=/; max-age=${maxAge}; SameSite=Lax`
          
          set({ 
            user: data.user, 
            token: data.access_token, 
            isAuthenticated: true,
            isLoading: false 
          })
          return true
        } catch (error: unknown) {
          const message = getErrorMessage(error)
          set({ error: message, isLoading: false })
          return false
        }
      },

      register: async (payload: RegisterPayload) => {
        set({ isLoading: true, error: null })
        try {
          await apiClient.post('/auth/register', payload)
          set({ isLoading: false })
          return true
        } catch (error: unknown) {
          const message = getErrorMessage(error)
          set({ error: message, isLoading: false })
          return false
        }
      },

      logout: () => {
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        set({ user: null, token: null, isAuthenticated: false, error: null })
        // Redirect to login
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
          // Token invalid or expired
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
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)

// Helper function to extract error message
function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } }).response
    if (response?.data?.detail) {
      const detail = response.data.detail
      if (typeof detail === 'string') return detail
      if (typeof detail === 'object' && detail !== null && 'message' in detail) {
        return String((detail as { message: unknown }).message)
      }
    }
  }
  return 'An unexpected error occurred'
}

export default useAuth
