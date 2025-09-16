import React, { Component, ErrorInfo, ReactNode } from 'react';
import logger from '../lib/logger';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console and logging service
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Log to our logging service
    logger.error('React Error Boundary caught error', error, {
      errorInfo: errorInfo.componentStack,
      errorBoundary: 'ErrorBoundary',
    });

    this.setState({
      error,
      errorInfo,
    });
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div 
          className="card" 
          style={{ 
            margin: '2rem auto', 
            maxWidth: '600px',
            textAlign: 'center',
            border: '1px solid #dc2626',
            backgroundColor: '#fef2f2'
          }}
          role="alert"
          aria-live="assertive"
        >
          <h2 style={{ color: '#dc2626', marginTop: 0 }}>
            Something went wrong
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>
            We&apos;re sorry, but something unexpected happened. Please try refreshing the page.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <button
              className="primary"
              onClick={() => window.location.reload()}
              style={{ marginRight: '0.5rem' }}
            >
              Refresh Page
            </button>
            <button
              className="ghost-button"
              onClick={() => this.setState({ hasError: false, error: undefined, errorInfo: undefined })}
            >
              Try Again
            </button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <details style={{ marginTop: '1.5rem', textAlign: 'left' }}>
              <summary style={{ cursor: 'pointer', fontWeight: '600' }}>
                Error Details (Development Only)
              </summary>
              <pre style={{ 
                marginTop: '0.5rem', 
                padding: '1rem', 
                backgroundColor: '#f3f4f6', 
                borderRadius: '8px',
                overflow: 'auto',
                fontSize: '0.85rem'
              }}>
                {this.state.error.toString()}
                {this.state.errorInfo?.componentStack}
              </pre>
            </details>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
