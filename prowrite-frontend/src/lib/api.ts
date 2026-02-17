import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios'
import { supabase } from './supabase'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

// Store for backend JWT token
let backendToken: string | null = null

export const setBackendToken = (token: string | null) => {
  backendToken = token
  if (token) {
    localStorage.setItem('backend_token', token)
  } else {
    localStorage.removeItem('backend_token')
  }
}

export const getBackendToken = (): string | null => {
  if (!backendToken) {
    backendToken = localStorage.getItem('backend_token')
  }
  return backendToken
}

export const clearBackendToken = () => {
  backendToken = null
  localStorage.removeItem('backend_token')
}

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Auth interceptor - adds JWT token to requests
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    // First try to use backend token
    const token = getBackendToken()
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      // Fallback to Supabase token for initial auth
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`
      }
    }
    
    return config
  },
  (error) => {
    console.error('[API] Request interceptor error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor - handles auth errors
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status
    const url = error.config?.url
    console.error(`[API] Response error: ${status} ${error.message} (${url})`, error.response?.data)

    if (status === 401) {
      // Token expired or invalid - clear and redirect to login
      console.warn('[API] 401 Unauthorized - clearing token and redirecting to login')
      clearBackendToken()
      window.location.href = '/login'
    }

    return Promise.reject(error)
  }
)

export default api
