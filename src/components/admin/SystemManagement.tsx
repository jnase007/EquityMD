import React, { useState } from 'react';
import { Trash2, RefreshCw, Database, HardDrive, Globe, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

export function SystemManagement() {
  const [clearing, setClearing] = useState<string | null>(null);
  const [lastCleared, setLastCleared] = useState<Record<string, Date>>({});

  const clearBrowserCache = async () => {
    setClearing('browser');
    try {
      // Clear localStorage
      localStorage.clear();
      
      // Clear sessionStorage
      sessionStorage.clear();
      
      // Clear IndexedDB if available
      if ('indexedDB' in window) {
        const databases = await indexedDB.databases();
        await Promise.all(
          databases.map(db => {
            if (db.name) {
              return new Promise((resolve, reject) => {
                const deleteReq = indexedDB.deleteDatabase(db.name!);
                deleteReq.onsuccess = () => resolve(true);
                deleteReq.onerror = () => reject(deleteReq.error);
              });
            }
          })
        );
      }

      setLastCleared(prev => ({ ...prev, browser: new Date() }));
      alert('Browser cache cleared successfully!');
    } catch (error) {
      console.error('Error clearing browser cache:', error);
      alert('Error clearing browser cache. Check console for details.');
    } finally {
      setClearing(null);
    }
  };

  const clearApplicationCache = async () => {
    setClearing('application');
    try {
      // Clear service worker cache if available
      if ('serviceWorker' in navigator && 'caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      }

      // Clear any application-specific cache
      if (window.performance && window.performance.clearResourceTimings) {
        window.performance.clearResourceTimings();
      }

      setLastCleared(prev => ({ ...prev, application: new Date() }));
      alert('Application cache cleared successfully!');
    } catch (error) {
      console.error('Error clearing application cache:', error);
      alert('Error clearing application cache. Check console for details.');
    } finally {
      setClearing(null);
    }
  };

  const clearLoadingStates = async () => {
    setClearing('loading');
    try {
      // Import and use the loading manager
      const { loadingManager } = await import('../../utils/loadingManager');
      loadingManager.clearAll();
      
      setLastCleared(prev => ({ ...prev, loading: new Date() }));
      alert('Loading states cleared successfully!');
    } catch (error) {
      console.error('Error clearing loading states:', error);
      alert('Error clearing loading states. Check console for details.');
    } finally {
      setClearing(null);
    }
  };

  const forcePageRefresh = () => {
    if (confirm('This will refresh the page for all users. Are you sure?')) {
      // Force a hard refresh
      window.location.reload();
    }
  };

  const clearAllCaches = async () => {
    if (confirm('This will clear ALL caches and may log out users. Are you sure?')) {
      setClearing('all');
      try {
        await clearBrowserCache();
        await clearApplicationCache();
        await clearLoadingStates();
        
        setLastCleared(prev => ({ ...prev, all: new Date() }));
        alert('All caches cleared successfully! Page will refresh in 3 seconds.');
        
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } catch (error) {
        console.error('Error clearing all caches:', error);
        alert('Error clearing some caches. Check console for details.');
      } finally {
        setClearing(null);
      }
    }
  };

  const formatLastCleared = (date: Date) => {
    return date.toLocaleString();
  };

  const cacheActions = [
    {
      id: 'browser',
      title: 'Browser Cache',
      description: 'Clear localStorage, sessionStorage, and IndexedDB',
      icon: Globe,
      action: clearBrowserCache,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-600',
      buttonColor: 'bg-blue-600 hover:bg-blue-700'
    },
    {
      id: 'application',
      title: 'Application Cache',
      description: 'Clear service worker cache and performance data',
      icon: HardDrive,
      action: clearApplicationCache,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-600',
      buttonColor: 'bg-green-600 hover:bg-green-700'
    },
    {
      id: 'loading',
      title: 'Loading States',
      description: 'Clear stuck loading states and timeouts',
      icon: RefreshCw,
      action: clearLoadingStates,
      bgColor: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">System Management</h2>
        <div className="text-sm text-gray-500">
          Cache & Performance Tools
        </div>
      </div>

      {/* Warning Banner */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start">
          <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800">
              Admin Cache Management
            </h3>
            <p className="text-sm text-yellow-700 mt-1">
              These actions will affect all users. Use with caution in production.
            </p>
          </div>
        </div>
      </div>

      {/* Individual Cache Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cacheActions.map((action) => {
          const Icon = action.icon;
          const isClearing = clearing === action.id;
          const lastClearedDate = lastCleared[action.id];
          
          return (
            <div key={action.id} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center mb-4">
                <div className={`p-3 rounded-lg ${action.bgColor}`}>
                  <Icon className={`h-6 w-6 ${action.iconColor}`} />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{action.title}</h3>
                  <p className="text-sm text-gray-500">{action.description}</p>
                </div>
              </div>
              
              {lastClearedDate && (
                <div className="flex items-center text-xs text-gray-500 mb-4">
                  <Clock className="h-3 w-3 mr-1" />
                  Last cleared: {formatLastCleared(lastClearedDate)}
                </div>
              )}
              
              <button
                onClick={action.action}
                disabled={isClearing}
                className={`w-full flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isClearing
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : action.buttonColor
                }`}
              >
                {isClearing ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear {action.title}
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>

      {/* Bulk Actions */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">Bulk Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={clearAllCaches}
            disabled={clearing === 'all'}
            className={`flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
              clearing === 'all'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            {clearing === 'all' ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Clearing All...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Clear All Caches
              </>
            )}
          </button>
          
          <button
            onClick={forcePageRefresh}
            className="flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Force Page Refresh
          </button>
        </div>
        
        {lastCleared.all && (
          <div className="mt-4 flex items-center text-sm text-green-600">
            <CheckCircle className="h-4 w-4 mr-2" />
            All caches last cleared: {formatLastCleared(lastCleared.all)}
          </div>
        )}
      </div>

      {/* System Information */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-lg font-semibold mb-4">System Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Environment:</span>
            <span className="ml-2 text-gray-600">
              {process.env.NODE_ENV || 'development'}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">User Agent:</span>
            <span className="ml-2 text-gray-600 truncate">
              {navigator.userAgent.split(' ')[0]}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Local Storage:</span>
            <span className="ml-2 text-gray-600">
              {localStorage.length} items
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Session Storage:</span>
            <span className="ml-2 text-gray-600">
              {sessionStorage.length} items
            </span>
          </div>
        </div>
      </div>
    </div>
  );
} 