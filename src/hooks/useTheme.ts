import { useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

function getStoredTheme(): ThemePreference {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('theme-preference');
    if (stored === 'system' || stored === 'light' || stored === 'dark') {
      return stored;
    }
  }
  return 'system';
}

// Persists the preference and toggles the `.dark` class on <html> (the shadcn convention).
// index.html applies the same class before first paint, so there is no light/dark flash.
export function useTheme() {
  const [themePreference, setThemePreference] = useState<ThemePreference>(getStoredTheme);

  useEffect(() => {
    localStorage.setItem('theme-preference', themePreference);
    const root = document.documentElement;

    if (themePreference !== 'system') {
      root.classList.toggle('dark', themePreference === 'dark');
      return;
    }

    // Follow the system theme, including live changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applySystemTheme = () => root.classList.toggle('dark', mediaQuery.matches);
    applySystemTheme();
    mediaQuery.addEventListener('change', applySystemTheme);
    return () => mediaQuery.removeEventListener('change', applySystemTheme);
  }, [themePreference]);

  return { themePreference, setThemePreference };
}
