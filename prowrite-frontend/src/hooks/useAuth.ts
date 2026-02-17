import { useState, useEffect, useCallback } from 'react'
import type { User, AuthError, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { api, setBackendToken, clearBackendToken, getBackendToken } from '@/lib/api'

interface AuthData {
  user: User | null
  session: Session | null
}

interface BackendAuthResponse {
  access_token: string
  workspace_id: string
  email: string
}

interface UseAuth {
  user: User | null
  loading: boolean
  error: string | null
  signUp: (email: string, password: string) => Promise<AuthData>
  login: (email: string, password: string) => Promise<AuthData>
  logout: () => Promise<void>
  isAuthenticated: boolean
}

export function useAuth(): UseAuth {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sync with backend to get/create workspace and get backend JWT
  const syncWithBackend = async (supabaseToken: string): Promise<boolean> => {
    try {
      const response = await api.post<BackendAuthResponse>('/auth/login', {
        access_token: supabaseToken,
      })

      // Store the backend JWT token
      setBackendToken(response.data.access_token)
      return true
    } catch (err) {
      console.error('[useAuth] syncWithBackend failed:', err)
      return false
    }
  }

  // Initialize auth state and listen for changes
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setUser(session?.user ?? null)

        // If we have a session but no backend token, sync with backend
        if (session?.access_token && !getBackendToken()) {
          await syncWithBackend(session.access_token)
        }
      } catch (err) {
        console.error('[useAuth] initializeAuth failed:', err)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle session expiry - redirect to login
      if (event === 'SIGNED_OUT') {
        clearBackendToken()
        window.location.href = '/login'
      }

      // On token refresh, re-sync with backend
      if (event === 'TOKEN_REFRESHED' && session?.access_token) {
        await syncWithBackend(session.access_token)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const signUp = useCallback(async (email: string, password: string): Promise<AuthData> => {
    setError(null)
    setLoading(true)

    try {
      console.log('[useAuth] signUp: attempting signup for', email)
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        console.error('[useAuth] signUp: Supabase auth error:', authError.message, authError)
        setError(authError.message || 'Unable to create account. Please try again.')
        setLoading(false)
        throw authError
      }

      console.log('[useAuth] signUp: Supabase response:', { user: !!data.user, session: !!data.session, userId: data.user?.id })

      // If signup successful and we have a session, sync with backend
      // Don't fail signup if backend sync fails
      if (data.session) {
        await syncWithBackend(data.session.access_token)
      }

      setLoading(false)
      return { user: data.user, session: data.session }
    } catch (err) {
      console.error('[useAuth] signUp: unexpected error:', err)
      setLoading(false)
      throw err
    }
  }, [])

  const login = useCallback(async (email: string, password: string): Promise<AuthData> => {
    setError(null)
    setLoading(true)

    try {
      console.log('[useAuth] login: attempting login for', email)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error('[useAuth] login: Supabase auth error:', authError.message, authError)
        setError('Invalid email or password')
        setLoading(false)
        throw authError
      }

      console.log('[useAuth] login: success, syncing with backend')

      // Sync with backend - don't fail login if backend sync fails
      if (data.session) {
        await syncWithBackend(data.session.access_token)
      }

      setLoading(false)
      return { user: data.user, session: data.session }
    } catch (err) {
      console.error('[useAuth] login: unexpected error:', err)
      setLoading(false)
      throw err
    }
  }, [])

  const logout = useCallback(async (): Promise<void> => {
    setError(null)
    setLoading(true)

    try {
      const { error: authError } = await supabase.auth.signOut()

      if (authError) {
        throw authError
      }

      setUser(null)
      clearBackendToken()
      window.location.href = '/login'
    } catch (err) {
      console.error('[useAuth] logout: failed:', err)
      const authErr = err as AuthError
      setError(authErr.message)
      throw authErr
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    user,
    loading,
    error,
    signUp,
    login,
    logout,
    isAuthenticated: !!user,
  }
}

export default useAuth
