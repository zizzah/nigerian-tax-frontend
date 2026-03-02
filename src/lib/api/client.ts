import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'

function getBaseURL() {
  if (typeof window !== 'undefined') {
    return '/api/proxy'
  }
  return (
    process.env.NEXT_PUBLIC_API_URL ||
    `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000'}/api/v1`
  )
}

export const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
  maxRedirects: 5,
  withCredentials: true,
})

// Add trailing slash + attach token to prevent FastAPI 307 redirects
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Add trailing slash to prevent FastAPI 307 redirects
    if (config.url) {
      if (!config.url.includes('?') && !config.url.endsWith('/')) {
        config.url = config.url + '/'
      } else if (config.url.includes('?') && !config.url.split('?')[0].endsWith('/')) {
        const [path, query] = config.url.split('?')
        config.url = path + '/?' + query
      }
    }

    // Attach auth token
    if (typeof document !== 'undefined') {
      const token = document.cookie
        .split('; ')
        .find((row) => row.startsWith('access_token='))
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
      const isAuthEndpoint =
        error.config?.url?.includes('/auth/login') ||
        error.config?.url?.includes('/auth/register') ||
        error.config?.url?.includes('/auth/forgot-password')

      if (!isAuthEndpoint && typeof document !== 'undefined') {
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

// Login: try JSON first, fall back to OAuth2 form-encoded on 422
export async function loginRequest(email: string, password: string) {
  try {
    return await apiClient.post('/auth/login', { email, password })
  } catch (error: unknown) {
    const status =
      typeof error === 'object' && error !== null && 'response' in error
        ? (error as { response?: { status?: number } }).response?.status
        : null

    if (status === 422) {
      return await apiClient.post(
        '/auth/login',
        new URLSearchParams({ username: email, password }),
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
      )
    }
    throw error
  }
}

export function parseApiError(error: unknown): string {
  if (error instanceof AxiosError) {
    const data = error.response?.data as Record<string, unknown>
    if (typeof data?.detail === 'string') return data.detail
    if (typeof data?.detail === 'object' && data?.detail !== null) {
      const detail = data.detail as Record<string, unknown>
      if (detail.message) return detail.message as string
    }
    if (Array.isArray(data?.detail)) {
      return data.detail
        .map((e: unknown) => {
          if (typeof e === 'object' && e !== null && 'msg' in e) {
            return (e as { msg: string }).msg
          }
          return String(e)
        })
        .join(', ')
    }
  }
  return 'An unexpected error occurred'
}

export default apiClient