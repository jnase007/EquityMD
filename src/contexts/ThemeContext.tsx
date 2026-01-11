import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dim' | 'dark' | 'auto';
export type ResolvedTheme = 'light' | 'dim' | 'dark';

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  systemPreference: 'light' | 'dark';
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'equitymd_theme';

// CSS variables for each theme
const themeStyles: Record<ResolvedTheme, Record<string, string>> = {
  light: {
    '--bg-primary': '#ffffff',
    '--bg-secondary': '#f9fafb',
    '--bg-tertiary': '#f3f4f6',
    '--text-primary': '#111827',
    '--text-secondary': '#4b5563',
    '--text-tertiary': '#6b7280',
    '--border-color': '#e5e7eb',
    '--card-bg': '#ffffff',
    '--input-bg': '#ffffff',
    '--header-bg': '#ffffff',
    '--sidebar-bg': '#ffffff',
    '--focus-ring': 'rgba(59, 130, 246, 0.5)',
    '--success-bg': 'rgba(34, 197, 94, 0.1)',
    '--error-bg': 'rgba(239, 68, 68, 0.1)',
    '--warning-bg': 'rgba(245, 158, 11, 0.1)',
  },
  dim: {
    '--bg-primary': '#15202b',
    '--bg-secondary': '#192734',
    '--bg-tertiary': '#1e2d3d',
    '--text-primary': '#ffffff',
    '--text-secondary': '#8899a6',
    '--text-tertiary': '#6e767d',
    '--border-color': '#38444d',
    '--card-bg': '#192734',
    '--input-bg': '#253341',
    '--header-bg': '#15202b',
    '--sidebar-bg': '#15202b',
    '--focus-ring': 'rgba(96, 165, 250, 0.5)',
    '--success-bg': 'rgba(34, 197, 94, 0.2)',
    '--error-bg': 'rgba(239, 68, 68, 0.2)',
    '--warning-bg': 'rgba(245, 158, 11, 0.2)',
  },
  dark: {
    '--bg-primary': '#000000',
    '--bg-secondary': '#16181c',
    '--bg-tertiary': '#1d1f23',
    '--text-primary': '#e7e9ea',
    '--text-secondary': '#71767b',
    '--text-tertiary': '#536471',
    '--border-color': '#2f3336',
    '--card-bg': '#16181c',
    '--input-bg': '#202327',
    '--header-bg': '#000000',
    '--sidebar-bg': '#000000',
    '--focus-ring': 'rgba(96, 165, 250, 0.5)',
    '--success-bg': 'rgba(34, 197, 94, 0.25)',
    '--error-bg': 'rgba(239, 68, 68, 0.25)',
    '--warning-bg': 'rgba(245, 158, 11, 0.25)',
  },
};

// Get system color scheme preference
function getSystemPreference(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [systemPreference, setSystemPreference] = useState<'light' | 'dark'>(getSystemPreference);
  
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored && ['light', 'dim', 'dark', 'auto'].includes(stored)) {
        return stored;
      }
    }
    return 'light';
  });

  // Resolve 'auto' to actual theme based on system preference
  const resolvedTheme: ResolvedTheme = theme === 'auto' 
    ? (systemPreference === 'dark' ? 'dim' : 'light')
    : theme;

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  // Listen for system preference changes
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e: MediaQueryListEvent) => {
      setSystemPreference(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Apply theme styles to document
  useEffect(() => {
    const root = document.documentElement;
    const styles = themeStyles[resolvedTheme];

    // Add transition class for smooth theme switching
    root.classList.add('theme-transitioning');
    
    // Apply CSS variables
    Object.entries(styles).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Add/remove class for Tailwind dark mode compatibility
    root.classList.remove('light', 'dim', 'dark');
    root.classList.add(resolvedTheme);

    // Update body background
    if (resolvedTheme === 'light') {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#111827';
    } else if (resolvedTheme === 'dim') {
      document.body.style.backgroundColor = '#15202b';
      document.body.style.color = '#ffffff';
    } else {
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#e7e9ea';
    }

    // Remove transition class after animation completes
    const timer = setTimeout(() => {
      root.classList.remove('theme-transitioning');
    }, 300);

    return () => clearTimeout(timer);
  }, [resolvedTheme]);

  return (
    <ThemeContext.Provider value={{ theme, resolvedTheme, setTheme, systemPreference }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    // Return a safe default if not in provider (shouldn't happen, but prevents crash)
    return { 
      theme: 'light' as Theme,
      resolvedTheme: 'light' as ResolvedTheme,
      setTheme: () => console.warn('ThemeProvider not found'),
      systemPreference: 'light' as const
    };
  }
  return context;
}
