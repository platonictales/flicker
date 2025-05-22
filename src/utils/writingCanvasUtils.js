/**
 * Ensures the contentEditable has a zero-width space div if empty, and places the caret inside it.
 * @param {HTMLElement} target - The contentEditable element.
 * @returns {boolean} - Returns true if the placeholder was inserted, false otherwise.
 */
export function ensureZeroWidthDiv(target) {
  if (
    target.childNodes.length === 0 ||
    (target.childNodes.length === 1 &&
      target.firstChild.nodeType === Node.ELEMENT_NODE &&
      target.firstChild.textContent === "")
  ) {
    target.innerHTML = "";
    const div = document.createElement("div");
    div.textContent = '\u200B';
    target.appendChild(div);
    // Place caret inside the new div
    const range = document.createRange();
    range.selectNodeContents(div);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    return true;
  }
  return false;
}