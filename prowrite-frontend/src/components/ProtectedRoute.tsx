import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

/**
 * ProtectedRoute component that checks authentication state
 * and redirects to login if not authenticated.
 * 
 * Requirements: 1.6 - Session expiry redirects to login
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()

  // Show loading skeleton while checking auth
  if (loading) {
    return (
      <div className="min-h-screen flex bg-background">
        {/* Sidebar skeleton */}
        <div className="hidden md:flex w-64 border-r border-border/50 flex-col p-4 space-y-4">
          <div className="h-8 w-32 bg-secondary/50 rounded-lg animate-pulse" />
          <div className="space-y-2 mt-6">
            {[85, 70, 90, 75, 80, 95, 72].map((w, i) => (
              <div key={i} className="h-9 bg-secondary/30 rounded-lg animate-pulse" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-auto space-y-2">
            <div className="h-9 bg-secondary/30 rounded-lg animate-pulse w-3/4" />
            <div className="h-9 bg-secondary/30 rounded-lg animate-pulse w-1/2" />
          </div>
        </div>
        {/* Main content skeleton */}
        <div className="flex-1 p-8 space-y-6">
          <div className="h-8 w-48 bg-secondary/50 rounded-lg animate-pulse" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-28 bg-secondary/30 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-secondary/20 rounded-xl animate-pulse" />
        </div>
      </div>
    )
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    // Save the attempted URL for redirecting after login
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
