/**
 * Production-safe logger utility
 * Only logs in development mode to keep production console clean
 */

const isDev = import.meta.env.DEV;

export const logger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log(...args);
  },
  
  warn: (...args: unknown[]) => {
    if (isDev) console.warn(...args);
  },
  
  error: (...args: unknown[]) => {
    // Always log errors, even in production
    console.error(...args);
  },
  
  debug: (...args: unknown[]) => {
    if (isDev) console.debug(...args);
  },
  
  info: (...args: unknown[]) => {
    if (isDev) console.info(...args);
  },
  
  // For critical errors that should be reported
  critical: (...args: unknown[]) => {
    console.error('[CRITICAL]', ...args);
    // In a real app, you might send this to an error tracking service
    // like Sentry, LogRocket, etc.
  },
  
  // Performance logging
  time: (label: string) => {
    if (isDev) console.time(label);
  },
  
  timeEnd: (label: string) => {
    if (isDev) console.timeEnd(label);
  },
  
  // Group logs
  group: (label: string) => {
    if (isDev) console.group(label);
  },
  
  groupEnd: () => {
    if (isDev) console.groupEnd();
  },
};

// Shorthand for common auth debugging
export const authLogger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log('🔐 Auth:', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('🔐 Auth Error:', ...args);
  },
};

// Shorthand for API debugging
export const apiLogger = {
  log: (...args: unknown[]) => {
    if (isDev) console.log('📡 API:', ...args);
  },
  error: (...args: unknown[]) => {
    console.error('📡 API Error:', ...args);
  },
};

export default logger;

