/**
 * Scrolls to and focuses the first div inside the editor whose text matches the given block text.
 * @param {HTMLElement} editor - The contentEditable container (e.g., contentRef.current)
 * @param {string} blockText - The text of the block to find and focus
 */
export function scrollToAndFocusBlock(editor, blockId) {
  if (!editor) return;
  const divs = Array.from(editor.children);
  const sluglineDivs = divs.filter(div => div.getAttribute("data-name") === "slug-line");
  const match = sluglineDivs[blockId - 1];

  if (match) {
    match.scrollIntoView({ behavior: "smooth", block: "center" });
    const range = document.createRange();
    range.selectNodeContents(match);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    editor.focus();
  }
}