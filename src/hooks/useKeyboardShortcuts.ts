import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Shortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  action: () => void;
  description: string;
}

// Global keyboard shortcuts for power users
export function useKeyboardShortcuts() {
  const navigate = useNavigate();

  const shortcuts: Shortcut[] = [
    // Navigation shortcuts
    { 
      key: 'h', 
      ctrl: true, 
      action: () => navigate('/'), 
      description: 'Go to Home' 
    },
    { 
      key: 'f', 
      ctrl: true, 
      shift: true,
      action: () => navigate('/find'), 
      description: 'Find Deals' 
    },
    { 
      key: 'd', 
      ctrl: true, 
      shift: true,
      action: () => navigate('/dashboard'), 
      description: 'Dashboard' 
    },
    { 
      key: 'p', 
      ctrl: true, 
      shift: true,
      action: () => navigate('/profile'), 
      description: 'Profile' 
    },
    { 
      key: 'n', 
      ctrl: true, 
      shift: true,
      action: () => navigate('/deals/new'), 
      description: 'New Deal' 
    },
    { 
      key: '/', 
      action: () => {
        // Focus search input if exists
        const searchInput = document.querySelector('input[type="search"], input[placeholder*="search" i]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }, 
      description: 'Focus Search' 
    },
    { 
      key: 'Escape', 
      action: () => {
        // Close any open modals
        const closeButtons = document.querySelectorAll('[aria-label="Close"], [data-dismiss]');
        closeButtons.forEach(btn => (btn as HTMLElement).click());
      }, 
      description: 'Close Modal' 
    },
  ];

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (
      target.tagName === 'INPUT' || 
      target.tagName === 'TEXTAREA' || 
      target.isContentEditable
    ) {
      // Only allow Escape key in inputs
      if (event.key !== 'Escape') return;
    }

    for (const shortcut of shortcuts) {
      const modifiersMatch = 
        (shortcut.ctrl === undefined || shortcut.ctrl === event.ctrlKey) &&
        (shortcut.shift === undefined || shortcut.shift === event.shiftKey) &&
        (shortcut.alt === undefined || shortcut.alt === event.altKey) &&
        (shortcut.meta === undefined || shortcut.meta === event.metaKey);

      if (event.key.toLowerCase() === shortcut.key.toLowerCase() && modifiersMatch) {
        event.preventDefault();
        shortcut.action();
        return;
      }
    }
  }, [navigate]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return shortcuts;
}

// Hook for custom shortcuts in specific components
export function useCustomShortcut(
  key: string, 
  action: () => void,
  options: { ctrl?: boolean; shift?: boolean; alt?: boolean; enabled?: boolean } = {}
) {
  const { ctrl, shift, alt, enabled = true } = options;

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      const modifiersMatch = 
        (!ctrl || event.ctrlKey) &&
        (!shift || event.shiftKey) &&
        (!alt || event.altKey);

      if (event.key.toLowerCase() === key.toLowerCase() && modifiersMatch) {
        event.preventDefault();
        action();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [key, action, ctrl, shift, alt, enabled]);
}

// Arrow key navigation for lists
export function useArrowNavigation(
  items: { id: string }[],
  selectedId: string | null,
  onSelect: (id: string) => void
) {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!items.length) return;

      const currentIndex = items.findIndex(item => item.id === selectedId);
      let newIndex = currentIndex;

      switch (event.key) {
        case 'ArrowDown':
        case 'j':
          event.preventDefault();
          newIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
          break;
        case 'ArrowUp':
        case 'k':
          event.preventDefault();
          newIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
          break;
        case 'Home':
          event.preventDefault();
          newIndex = 0;
          break;
        case 'End':
          event.preventDefault();
          newIndex = items.length - 1;
          break;
        default:
          return;
      }

      if (newIndex !== currentIndex && items[newIndex]) {
        onSelect(items[newIndex].id);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [items, selectedId, onSelect]);
}

