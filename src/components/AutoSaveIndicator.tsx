import React from 'react';
import { Save, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { AutoSaveState } from '../hooks/useAutoSave';

interface AutoSaveIndicatorProps {
  state: AutoSaveState;
  className?: string;
  showDetails?: boolean;
}

export function AutoSaveIndicator({ state, className = '', showDetails = true }: AutoSaveIndicatorProps) {
  const { isSaving, lastSaved, hasUnsavedChanges, error, saveCount } = state;

  const getStatusInfo = () => {
    if (isSaving) {
      return {
        icon: <Loader2 className="h-4 w-4 animate-spin" />,
        text: 'Saving...',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      };
    }

    if (error) {
      return {
        icon: <AlertCircle className="h-4 w-4" />,
        text: 'Save failed',
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      };
    }

    if (hasUnsavedChanges) {
      return {
        icon: <Clock className="h-4 w-4" />,
        text: 'Unsaved changes',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50'
      };
    }

    if (lastSaved) {
      return {
        icon: <CheckCircle className="h-4 w-4" />,
        text: 'All changes saved',
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      };
    }

    return {
      icon: <Save className="h-4 w-4" />,
      text: 'Ready to save',
      color: 'text-gray-600',
      bgColor: 'bg-gray-50'
    };
  };

  const statusInfo = getStatusInfo();

  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      <div className={`flex items-center px-3 py-1 rounded-full text-sm ${statusInfo.color} ${statusInfo.bgColor}`}>
        {statusInfo.icon}
        <span className="ml-2">{statusInfo.text}</span>
      </div>
      
      {showDetails && (
        <div className="text-xs text-gray-500 space-y-1">
          {lastSaved && (
            <div className="flex items-center">
              <span>Last saved: {formatLastSaved(lastSaved)}</span>
            </div>
          )}
          {saveCount > 0 && (
            <div className="flex items-center">
              <span>Saves: {saveCount}</span>
            </div>
          )}
          {error && (
            <div className="text-red-500 text-xs">
              {error}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 