// Keeps the last input type on <html data-input="keyboard|pointer">.
// Radix moves focus by script (menu and select items, focus going back to a trigger), and browsers can
// report that as :focus-visible even after a mouse click. The `keyboard-focus` variant in index.css uses
// this attribute so focus rings only show for keyboard users.
export function trackInputModality() {
  const root = document.documentElement;
  window.addEventListener('keydown', () => { root.dataset.input = 'keyboard'; }, true);
  window.addEventListener('pointerdown', () => { root.dataset.input = 'pointer'; }, true);
}
