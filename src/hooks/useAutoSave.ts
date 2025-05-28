import { useState, useEffect, useCallback, useRef } from 'react';

export interface AutoSaveOptions {
  delay?: number; // Delay in milliseconds before auto-saving (default: 2000)
  onSave: (data: any) => Promise<void>; // Function to save the data
  onSuccess?: (data: any) => void; // Callback when save is successful
  onError?: (error: any) => void; // Callback when save fails
  enabled?: boolean; // Whether auto-save is enabled (default: true)
  showNotifications?: boolean; // Whether to show save notifications (default: true)
}

export interface AutoSaveState {
  isSaving: boolean;
  lastSaved: Date | null;
  hasUnsavedChanges: boolean;
  error: string | null;
  saveCount: number;
}

export function useAutoSave<T>(initialData: T, options: AutoSaveOptions) {
  const {
    delay = 2000,
    onSave,
    onSuccess,
    onError,
    enabled = true,
    showNotifications = true
  } = options;

  const [data, setData] = useState<T>(initialData);
  const [state, setState] = useState<AutoSaveState>({
    isSaving: false,
    lastSaved: null,
    hasUnsavedChanges: false,
    error: null,
    saveCount: 0
  });

  const timeoutRef = useRef<NodeJS.Timeout>();
  const lastSavedDataRef = useRef<T>(initialData);
  const mountedRef = useRef(true);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Show notification
  const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
    if (!showNotifications) return;
    
    // Create and show notification
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
      type === 'success' 
        ? 'bg-green-500 text-white' 
        : 'bg-red-500 text-white'
    }`;
    notification.innerHTML = `
      <div class="flex items-center">
        <svg class="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
          ${type === 'success' 
            ? '<path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"></path>'
            : '<path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>'
          }
        </svg>
        <span>${message}</span>
      </div>
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.transform = 'translateX(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(notification)) {
          document.body.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }, [showNotifications]);

  // Save function
  const save = useCallback(async (dataToSave: T, showNotif = true) => {
    if (!mountedRef.current) return;

    setState(prev => ({ ...prev, isSaving: true, error: null }));

    try {
      await onSave(dataToSave);
      
      if (!mountedRef.current) return;

      lastSavedDataRef.current = dataToSave;
      setState(prev => ({
        ...prev,
        isSaving: false,
        lastSaved: new Date(),
        hasUnsavedChanges: false,
        error: null,
        saveCount: prev.saveCount + 1
      }));

      if (showNotif) {
        showNotification('Changes saved automatically');
      }
      
      onSuccess?.(dataToSave);
    } catch (error) {
      if (!mountedRef.current) return;

      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: errorMessage
      }));

      if (showNotif) {
        showNotification(errorMessage, 'error');
      }
      
      onError?.(error);
    }
  }, [onSave, onSuccess, onError, showNotification]);

  // Auto-save effect
  useEffect(() => {
    if (!enabled) return;

    // Check if data has actually changed
    const hasChanged = JSON.stringify(data) !== JSON.stringify(lastSavedDataRef.current);
    
    if (!hasChanged) return;

    setState(prev => ({ ...prev, hasUnsavedChanges: true }));

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new timeout for auto-save
    timeoutRef.current = setTimeout(() => {
      save(data);
    }, delay);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, enabled, delay, save]);

  // Manual save function
  const saveNow = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    return save(data);
  }, [data, save]);

  // Update data function
  const updateData = useCallback((newData: T | ((prev: T) => T)) => {
    setData(prev => {
      const updated = typeof newData === 'function' ? (newData as (prev: T) => T)(prev) : newData;
      return updated;
    });
  }, []);

  // Reset function
  const reset = useCallback((newData?: T) => {
    const resetData = newData || initialData;
    setData(resetData);
    lastSavedDataRef.current = resetData;
    setState({
      isSaving: false,
      lastSaved: null,
      hasUnsavedChanges: false,
      error: null,
      saveCount: 0
    });
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  }, [initialData]);

  return {
    data,
    updateData,
    saveNow,
    reset,
    state,
    // Convenience getters
    isSaving: state.isSaving,
    lastSaved: state.lastSaved,
    hasUnsavedChanges: state.hasUnsavedChanges,
    error: state.error,
    saveCount: state.saveCount
  };
} 