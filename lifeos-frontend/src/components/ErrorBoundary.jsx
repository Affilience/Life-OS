import React from 'react';
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp, Bug } from 'lucide-react';

/**
 * Enhanced Error Boundary with user-friendly UI
 *
 * Features:
 * - Beautiful error display matching design system
 * - Retry functionality to reset error state
 * - Navigate home option
 * - Collapsible error details for developers
 * - Error reporting support
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    console.error('ErrorBoundary caught:', error, errorInfo);

    // If an onError callback is provided, call it
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    // If onRetry callback is provided, call it
    if (this.props.onRetry) {
      this.props.onRetry();
    }
  };

  handleGoHome = () => {
    this.setState({ hasError: false, error: null, errorInfo: null, showDetails: false });
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState((prev) => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      const { error, errorInfo, showDetails } = this.state;
      const { fallback, compact = false } = this.props;

      // If custom fallback provided, use it
      if (fallback) {
        return typeof fallback === 'function'
          ? fallback({ error, retry: this.handleRetry })
          : fallback;
      }

      // Compact error display for smaller sections
      if (compact) {
        return (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/10 flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <p className="text-white/70 text-sm mb-3">Something went wrong</p>
            <button
              onClick={this.handleRetry}
              className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-violet-400 hover:text-violet-300 hover:bg-violet-500/10 rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
          </div>
        );
      }

      // Full error display
      return (
        <div className="min-h-[400px] flex items-center justify-center p-6">
          <div className="max-w-md w-full">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 rounded-full bg-rose-500/10 flex items-center justify-center">
                <AlertTriangle className="w-10 h-10 text-rose-400" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-white mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-white/60 text-sm">
                We encountered an unexpected error. Don't worry, your data is safe.
                Try refreshing or go back to the home page.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
              <button
                onClick={this.handleRetry}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center justify-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-medium rounded-lg transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            {/* Error Details (Collapsible) */}
            <div className="bg-[var(--bg-2,#1a1724)] border border-white/10 rounded-xl overflow-hidden">
              <button
                onClick={this.toggleDetails}
                className="w-full flex items-center justify-between px-4 py-3 text-sm text-white/60 hover:text-white/80 hover:bg-white/5 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <Bug className="w-4 h-4" />
                  Technical Details
                </span>
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </button>

              {showDetails && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Error Message */}
                  <div>
                    <p className="text-xs text-white/40 mb-1">Error Message</p>
                    <p className="text-sm text-rose-400 font-mono">
                      {error?.message || 'Unknown error'}
                    </p>
                  </div>

                  {/* Stack Trace */}
                  {error?.stack && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Stack Trace</p>
                      <pre className="text-xs text-white/50 font-mono bg-black/20 p-3 rounded-lg overflow-x-auto max-h-40">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {/* Component Stack */}
                  {errorInfo?.componentStack && (
                    <div>
                      <p className="text-xs text-white/40 mb-1">Component Stack</p>
                      <pre className="text-xs text-white/50 font-mono bg-black/20 p-3 rounded-lg overflow-x-auto max-h-40">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}

                  {/* Copy Error Button */}
                  <button
                    onClick={() => {
                      const errorText = `Error: ${error?.message}\n\nStack: ${error?.stack}\n\nComponent Stack: ${errorInfo?.componentStack}`;
                      navigator.clipboard.writeText(errorText);
                    }}
                    className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
                  >
                    Copy error to clipboard
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * withErrorBoundary - HOC to wrap components with ErrorBoundary
 */
export function withErrorBoundary(Component, errorBoundaryProps = {}) {
  return function WrappedComponent(props) {
    return (
      <ErrorBoundary {...errorBoundaryProps}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}

/**
 * ErrorFallback - Standalone error fallback component
 * Use when you need an error display outside of ErrorBoundary
 */
export function ErrorFallback({
  title = 'Something went wrong',
  message = 'An unexpected error occurred. Please try again.',
  onRetry,
  compact = false,
}) {
  if (compact) {
    return (
      <div className="flex flex-col items-center justify-center p-4 text-center">
        <AlertTriangle className="w-8 h-8 text-rose-400 mb-2" />
        <p className="text-white/70 text-sm mb-2">{title}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-sm text-violet-400 hover:text-violet-300"
          >
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center">
      <div className="w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center mb-4">
        <AlertTriangle className="w-8 h-8 text-rose-400" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-white/60 text-sm mb-4 max-w-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-4 py-2 bg-violet-500 hover:bg-violet-600 text-white font-medium rounded-lg transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      )}
    </div>
  );
}

export default ErrorBoundary;
