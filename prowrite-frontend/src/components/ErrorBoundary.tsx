import * as React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
  children: React.ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  handleReload = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="mx-auto h-16 w-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Something went wrong</h1>
              <p className="text-muted-foreground text-sm">
                An unexpected error occurred. Please try refreshing the page or returning to the home page.
              </p>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <pre className="text-left text-xs bg-secondary/50 rounded-lg p-4 overflow-auto max-h-40 text-muted-foreground border border-border/50">
                {this.state.error.message}
              </pre>
            )}
            <div className="flex gap-3 justify-center">
              <Button
                variant="outline"
                onClick={this.handleReset}
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </Button>
              <Button
                onClick={this.handleReload}
                className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white"
              >
                Go to Home
              </Button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
