import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useAuthStore } from '../lib/store';

export function ThemeToggle() {
  const { theme, toggleTheme } = useAuthStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'dark' ? (
        <Sun className="h-5 w-5 text-yellow-500" />
      ) : (
        <Moon className="h-5 w-5 text-gray-600" />
      )}
    </button>
  );
}