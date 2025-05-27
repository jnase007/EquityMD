import React, { Component, ReactNode } from 'react';
import { LoadingSpinner } from './LoadingSpinner';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: React.ErrorInfo;
}

export class AdminErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('AdminErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center p-8 max-w-md">
            <div className="mb-4">
              <LoadingSpinner variant="medical" size="lg" text="Admin Error" />
            </div>
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Admin Dashboard Error
            </h2>
            <p className="text-gray-600 mb-4">
              There was an issue loading the admin dashboard.
            </p>
            
            {/* Debug info for development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="text-left bg-red-50 p-4 rounded mb-4">
                <summary className="cursor-pointer text-red-700 font-medium">
                  Error Details (Development Mode)
                </summary>
                <pre className="text-xs text-red-600 mt-2 overflow-auto">
                  {this.state.error.message}
                  {this.state.error.stack}
                </pre>
              </details>
            )}

            <div className="space-y-2">
              <button
                onClick={() => window.location.href = '/dev-admin/dashboard'}
                className="block w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
              >
                Try Dev Admin Dashboard
              </button>
              
              <button
                onClick={() => window.location.href = '/admin'}
                className="block w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Use Access Code (777)
              </button>
              
              <button
                onClick={() => window.location.reload()}
                className="block w-full bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700 transition-colors"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 