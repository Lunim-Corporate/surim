'use client';

import React from 'react';

interface SpeechErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface SpeechErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SpeechErrorBoundary extends React.Component<
  SpeechErrorBoundaryProps,
  SpeechErrorBoundaryState
> {
  constructor(props: SpeechErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SpeechErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[SpeechErrorBoundary] Error caught:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default fallback UI
      return (
        <div className="flex flex-col items-center justify-center p-6 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg">
          <div className="text-center space-y-3">
            <p className="text-sm font-medium text-red-700 dark:text-red-300">
              Voice feature temporarily unavailable
            </p>
            <p className="text-sm text-red-600 dark:text-red-400">
              You can continue using text mode
            </p>
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Try Voice Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
