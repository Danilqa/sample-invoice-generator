import { useEffect, useState } from 'react';
import type { RefObject } from 'react';

// Whether the scroll container in `ref` has content hidden below its visible area.
// Always false while it doesn't scroll (e.g. when it isn't a scroll container on small screens).
export function useHasContentBelow(ref: RefObject<HTMLElement | null>) {
  const [hasContentBelow, setHasContentBelow] = useState(false);

  useEffect(() => {
    const scroller = ref.current;
    if (!scroller) return;

    // 1px of slack: scroll positions can be fractional at the very end
    const update = () => setHasContentBelow(scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop > 1);
    update();

    scroller.addEventListener('scroll', update, { passive: true });
    // The visible area changes with the window (and the banner), the content with the currency's bank fields
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(scroller);
    for (const child of Array.from(scroller.children)) resizeObserver.observe(child);

    return () => {
      scroller.removeEventListener('scroll', update);
      resizeObserver.disconnect();
    };
  }, [ref]);

  return hasContentBelow;
}
