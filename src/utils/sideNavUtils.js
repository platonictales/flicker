/**
 * Scrolls to and focuses the first div inside the editor whose text matches the given block text.
 * @param {HTMLElement} editor - The contentEditable container (e.g., contentRef.current)
 * @param {string} blockText - The text of the block to find and focus
 */
export function scrollToAndFocusBlock(editor, blockText) {
  if (!editor) return;
  const divs = Array.from(editor.children);
  const match = divs.find(div => div.innerText.trim() === blockText.trim());
  if (match) {
    match.scrollIntoView({ behavior: "smooth", block: "center" });
    // Optionally, set caret inside the div:
    const range = document.createRange();
    range.selectNodeContents(match);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    editor.focus();
  }
}