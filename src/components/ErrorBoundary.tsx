import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryState {
  error?: Error
}

export class ErrorBoundary extends Component<{ children: ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = {}

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(_error: Error, _errorInfo: ErrorInfo): void {
    if (import.meta.env.DEV) console.error(_error, _errorInfo)
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <main className="grid min-h-screen place-items-center bg-[#08090d] p-6 text-white">
          <section className="max-w-md rounded-md border border-rose-300/30 bg-rose-950/30 p-5">
            <h1 className="text-lg font-semibold">Room VJ hit a rendering error.</h1>
            <p className="mt-2 text-sm text-rose-100">
              Reload the page, then try demo mode or a different browser rendering backend.
            </p>
          </section>
        </main>
      )
    }
    return this.props.children
  }
}
