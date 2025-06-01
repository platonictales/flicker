/**
 * Scrolls the caret to the vertical center of the viewport (50% from top).
 * Call this after DOM/caret update (e.g., after Enter or focus).
 * @param {number} [delay=0] - Optional delay in ms before running scroll logic.
 */
export function scrollCaretToCenter(delay = 0) {
  setTimeout(() => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      let node = sel.anchorNode;
      while (node && node.nodeType !== 1) node = node.parentNode;
      if (node && node.scrollIntoView) {
        const rect = node.getBoundingClientRect();
        const desiredY = window.innerHeight * 0.5;
        const delta = rect.top - desiredY;
        window.scrollBy({ top: delta, behavior: 'smooth' });
      }
    }
  }, delay);
}

import { FOCUS_MODE_PADDING_TOP, FOCUS_MODE_PADDING_BOTTOM } from '../components/constants';

export function getFocusModeStyle(focusMode) {
  return {
    paddingTop: focusMode ? FOCUS_MODE_PADDING_TOP : undefined,
    paddingBottom: focusMode ? FOCUS_MODE_PADDING_BOTTOM : undefined,
  };
}

export function setCaretToEnd(el) {
  if (!el) return;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(false);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
