// Loading state manager to prevent infinite loading and provide recovery
export class LoadingManager {
  private static instance: LoadingManager;
  private loadingStates: Map<string, { startTime: number; timeout?: NodeJS.Timeout }> = new Map();
  private readonly DEFAULT_TIMEOUT = 25000; // 25 seconds (increased for production)

  static getInstance(): LoadingManager {
    if (!LoadingManager.instance) {
      LoadingManager.instance = new LoadingManager();
    }
    return LoadingManager.instance;
  }

  // Start a loading operation with automatic timeout
  startLoading(key: string, timeoutMs: number = this.DEFAULT_TIMEOUT): void {
    // Clear any existing timeout for this key
    this.clearLoading(key);

    const startTime = Date.now();
    const timeout = setTimeout(() => {
      console.warn(`Loading operation '${key}' timed out after ${timeoutMs}ms`);
      this.handleTimeout(key);
    }, timeoutMs);

    this.loadingStates.set(key, { startTime, timeout });
    console.log(`Started loading: ${key}`);
  }

  // Stop a loading operation
  stopLoading(key: string): void {
    const state = this.loadingStates.get(key);
    if (state) {
      if (state.timeout) {
        clearTimeout(state.timeout);
      }
      const duration = Date.now() - state.startTime;
      console.log(`Stopped loading: ${key} (${duration}ms)`);
      this.loadingStates.delete(key);
    }
  }

  // Clear a loading operation without logging
  clearLoading(key: string): void {
    const state = this.loadingStates.get(key);
    if (state?.timeout) {
      clearTimeout(state.timeout);
    }
    this.loadingStates.delete(key);
  }

  // Check if a loading operation is active
  isLoading(key: string): boolean {
    return this.loadingStates.has(key);
  }

  // Get loading duration
  getLoadingDuration(key: string): number {
    const state = this.loadingStates.get(key);
    return state ? Date.now() - state.startTime : 0;
  }

  // Handle timeout - can be overridden for custom behavior
  private handleTimeout(key: string): void {
    this.stopLoading(key);
    
    // Emit a custom event that components can listen to
    window.dispatchEvent(new CustomEvent('loadingTimeout', { 
      detail: { key, timestamp: Date.now() } 
    }));
  }

  // Clear all loading states (useful for cleanup)
  clearAll(): void {
    for (const [key] of this.loadingStates) {
      this.clearLoading(key);
    }
  }

  // Get all active loading operations
  getActiveLoadings(): string[] {
    return Array.from(this.loadingStates.keys());
  }
}

// Convenience functions
export const loadingManager = LoadingManager.getInstance();

export const startLoading = (key: string, timeout?: number) => 
  loadingManager.startLoading(key, timeout);

export const stopLoading = (key: string) => 
  loadingManager.stopLoading(key);

export const isLoading = (key: string) => 
  loadingManager.isLoading(key);

// React hook for loading states
export function useLoadingState(key: string) {
  const [loading, setLoading] = React.useState(false);
  const [duration, setDuration] = React.useState(0);

  React.useEffect(() => {
    const checkLoading = () => {
      const isCurrentlyLoading = loadingManager.isLoading(key);
      setLoading(isCurrentlyLoading);
      if (isCurrentlyLoading) {
        setDuration(loadingManager.getLoadingDuration(key));
      }
    };

    // Check initial state
    checkLoading();

    // Set up interval to update duration
    const interval = setInterval(checkLoading, 100);

    // Listen for timeout events
    const handleTimeout = (event: CustomEvent) => {
      if (event.detail.key === key) {
        setLoading(false);
        setDuration(0);
      }
    };

    window.addEventListener('loadingTimeout', handleTimeout as EventListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('loadingTimeout', handleTimeout as EventListener);
    };
  }, [key]);

  const start = (timeout?: number) => {
    loadingManager.startLoading(key, timeout);
    setLoading(true);
  };

  const stop = () => {
    loadingManager.stopLoading(key);
    setLoading(false);
    setDuration(0);
  };

  return { loading, duration, start, stop };
}

// Add React import for the hook
import React from 'react'; 