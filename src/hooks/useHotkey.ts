import { useEffect, useCallback } from 'react';

const IGNORED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

export function useHotkey(key: string, callback: () => void, enabled = true) {
  const handler = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
      const tag = (event.target as HTMLElement)?.tagName;
      if (IGNORED_TAGS.has(tag)) return;
      if (event.key.toLowerCase() === key.toLowerCase()) {
        event.preventDefault();
        callback();
      }
    },
    [key, callback, enabled]
  );

  useEffect(() => {
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handler]);
}
