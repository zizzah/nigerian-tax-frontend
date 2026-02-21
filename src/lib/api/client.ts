import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
})

// Attach token to every request
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Only access cookies on client-side
    if (typeof document !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find(row => row.startsWith('access_token='))
        ?.split('=')[1]
      
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Handle 401 globally → redirect to login
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear token and redirect
      if (typeof document !== 'undefined') {
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Helper to parse API errors
export function parseApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Record<string, unknown>
    if (typeof data?.detail === 'string') return data.detail
    if (typeof data?.detail === 'object' && data?.detail !== null) {
      const detail = data.detail as Record<string, unknown>
      if (detail.message) return detail.message as string
    }
    if (Array.isArray(data?.detail)) {
      return data.detail.map((e: unknown) => {
        if (typeof e === 'object' && e !== null && 'msg' in e) {
          return (e as { msg: string }).msg
        }
        return String(e)
      }).join(', ')
    }
  }
  return 'An unexpected error occurred'
}

export default apiClient
