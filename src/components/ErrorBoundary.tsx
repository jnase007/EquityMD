import React, { Component, ReactNode } from 'react';
import { RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  messageIndex: number;
}

// Fun real estate themed error messages
const ERROR_MESSAGES = [
  {
    emoji: '🏗️',
    title: "Under Construction!",
    subtitle: "Our code is getting a value-add renovation. Be right back!",
    cta: "Check Back In"
  },
  {
    emoji: '🔧',
    title: "Fixing a Leaky Pipe",
    subtitle: "Even the best properties need maintenance sometimes. We're on it!",
    cta: "Try Again"
  },
  {
    emoji: '🏚️',
    title: "This Page Needs a Flip",
    subtitle: "We found a fixer-upper in our code. Renovation in progress!",
    cta: "Refresh"
  },
  {
    emoji: '🚧',
    title: "Permit Pending",
    subtitle: "We're waiting on approval from the code inspector. Almost there!",
    cta: "Check Status"
  },
  {
    emoji: '🏠',
    title: "Wrong Address!",
    subtitle: "Looks like we took a wrong turn. Let's get you back on track.",
    cta: "Head Home"
  },
  {
    emoji: '📋',
    title: "Inspection Required",
    subtitle: "Our quality team is reviewing this page. Thanks for your patience!",
    cta: "Retry"
  },
  {
    emoji: '🔨',
    title: "Hammering Out the Details",
    subtitle: "We're putting the finishing touches on things. Hang tight!",
    cta: "Reload"
  },
];

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false,
      messageIndex: Math.floor(Math.random() * ERROR_MESSAGES.length)
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { 
      hasError: true, 
      error,
      messageIndex: Math.floor(Math.random() * ERROR_MESSAGES.length)
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const message = ERROR_MESSAGES[this.state.messageIndex];

      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            {/* Animated Icon */}
            <div className="mb-6 relative">
              <div className="text-8xl animate-bounce">
                {message.emoji}
              </div>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-16 h-2 bg-gray-200 rounded-full opacity-50 animate-pulse" />
            </div>
            
            {/* Logo */}
            <div className="flex items-center justify-center mb-6">
              <img 
                src="/logo-black.png" 
                alt="EquityMD" 
                className="h-10"
              />
            </div>

            {/* Message */}
            <h2 className="text-2xl font-bold text-gray-800 mb-3">
              {message.title}
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              {message.subtitle}
            </p>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => window.location.reload()}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-500/25"
              >
                <RefreshCw className="h-5 w-5" />
                {message.cta}
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-white text-gray-700 font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-all"
              >
                <Home className="h-5 w-5" />
                Go Home
              </button>
            </div>

            {/* Fun footer */}
            <p className="mt-8 text-sm text-gray-400">
              Don't worry, your investments are safe! 💰
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
} 