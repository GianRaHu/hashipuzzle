import React, { Component, ErrorInfo, ReactNode } from 'react';
import { platformManager } from '../utils/platform';
import { toast } from './Toast';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console
    console.error('Uncaught error:', error, errorInfo);

    // Save error state
    this.setState({
      error,
      errorInfo
    });

    // Call error handler if provided
    this.props.onError?.(error, errorInfo);

    // Save game state if possible
    try {
      platformManager.pauseGame();
    } catch (e) {
      console.error('Failed to save game state:', e);
    }

    // Show error toast
    toast.show({
      title: 'Oops! Something went wrong',
      message: 'The game encountered an error. Your progress has been saved.',
      type: 'error',
      duration: 0,
      action: {
        label: 'Reload',
        onClick: () => window.location.reload()
      }
    });

    // Log error to analytics (if available)
    if (window.gtag) {
      window.gtag('event', 'error', {
        error_name: error.name,
        error_message: error.message,
        error_stack: error.stack,
        timestamp: new Date().toISOString(),
        user: 'GianRaHu',
        build_time: '2025-03-13 10:50:05'
      });
    }
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReportError = () => {
    const errorReport = {
      error: this.state.error?.toString(),
      errorInfo: this.state.errorInfo?.componentStack,
      timestamp: new Date().toISOString(),
      user: 'GianRaHu',
      buildTime: '2025-03-13 10:50:05'
    };

    // Copy error details to clipboard
    navigator.clipboard.writeText(JSON.stringify(errorReport, null, 2))
      .then(() => {
        window.open('https://github.com/GianRaHu/thehashipuzzle/issues/new', '_blank');
      })
      .catch(console.error);
  };

  public render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="error-screen">
          <div className="error-content">
            <h1>Oops! Something went wrong</h1>
            <p>Don't worry, your progress has been saved.</p>
            
            <div className="error-actions">
              <button 
                onClick={this.handleReload}
                className="primary-button"
              >
                Reload Game
              </button>
              
              <button 
                onClick={this.handleReportError}
                className="secondary-button"
              >
                Report Issue
              </button>
            </div>

            {process.env.NODE_ENV === 'development' && (
              <details className="error-details">
                <summary>Error Details</summary>
                <pre>{this.state.error?.toString()}</pre>
                <pre>{this.state.errorInfo?.componentStack}</pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
