'use client'

import React, { ReactNode } from 'react'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[v0] Error boundary caught:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-background p-4">
            <div className="max-w-md text-center">
              <div className="flex justify-center mb-4">
                <AlertCircle size={48} className="text-destructive" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Something went wrong</h1>
              <p className="text-muted-foreground mb-6">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <Button onClick={this.resetError} className="bg-primary hover:bg-primary/90">
                Try Again
              </Button>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
