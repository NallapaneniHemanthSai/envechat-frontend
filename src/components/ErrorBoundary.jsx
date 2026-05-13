import { Component } from 'react'
import { Link } from 'react-router-dom'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-full flex-col items-center justify-center gap-4 bg-[#040d1a] px-6 py-16 text-center text-slate-200">
          <div className="max-w-md rounded-2xl border border-white/10 bg-[#07111f]/90 p-8 shadow-2xl backdrop-blur">
            <h1 className="text-lg font-semibold tracking-tight text-white">
              Something went wrong
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              The UI hit an unexpected error. Your session is unchanged — try
              reloading this view.
            </p>
            {this.state.error?.message && (
              <pre className="mt-4 max-h-28 overflow-auto rounded-lg border border-white/5 bg-black/40 p-3 text-left text-xs text-slate-500">
                {this.state.error.message}
              </pre>
            )}
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500"
                onClick={this.handleRetry}
              >
                Try again
              </button>
              <Link
                to="/chat"
                className="rounded-lg border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:bg-white/5"
              >
                Go to chat
              </Link>
            </div>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
