'use client';
import { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center p-8">
              <h2 className="text-xl font-semibold text-red-600 mb-2">
                Une erreur est survenue
              </h2>
              <p className="text-gray-600 mb-4">{this.state.error?.message}</p>
              <button
                onClick={() => this.setState({ hasError: false })}
                className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        )
      );
    }
    return this.props.children;
  }
}
