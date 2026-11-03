import { useEffect, useState } from 'react';

export type ThemePreference = 'system' | 'light' | 'dark';

function getSystemTheme(): 'light' | 'dark' {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
}

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
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>(
    themePreference === 'system' ? getSystemTheme() : themePreference
  );

  useEffect(() => {
    localStorage.setItem('theme-preference', themePreference);

    if (themePreference === 'system') {
      setResolvedTheme(getSystemTheme());

      // Follow system theme changes live
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent) => {
        setResolvedTheme(e.matches ? 'dark' : 'light');
      };
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setResolvedTheme(themePreference);
    }
  }, [themePreference]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  return { themePreference, setThemePreference, resolvedTheme };
}
