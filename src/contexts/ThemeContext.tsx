import React, { createContext, useContext, useEffect, useState } from 'react';

export type Theme = 'light' | 'dim' | 'dark';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'equitymd_theme';

// CSS variables for each theme
const themeStyles: Record<Theme, Record<string, string>> = {
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
  },
};

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Check localStorage first
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
      if (stored && ['light', 'dim', 'dark'].includes(stored)) {
        return stored;
      }
    }
    return 'light';
  });

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
  };

  // Apply theme styles to document
  useEffect(() => {
    const root = document.documentElement;
    const styles = themeStyles[theme];

    // Apply CSS variables
    Object.entries(styles).forEach(([property, value]) => {
      root.style.setProperty(property, value);
    });

    // Add/remove class for Tailwind dark mode compatibility
    root.classList.remove('light', 'dim', 'dark');
    root.classList.add(theme);

    // Update body background
    if (theme === 'light') {
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#111827';
    } else if (theme === 'dim') {
      document.body.style.backgroundColor = '#15202b';
      document.body.style.color = '#ffffff';
    } else {
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#e7e9ea';
    }
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
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
      setTheme: () => console.warn('ThemeProvider not found') 
    };
  }
  return context;
}
