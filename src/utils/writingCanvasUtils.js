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

export function removeZeroWidthSpaceFromNode(currentNode, selection) {
  if (
    currentNode.nodeType === Node.TEXT_NODE &&
    currentNode.textContent.includes('\u200B') &&
    currentNode.textContent.length > 1
  ) {
    const caretOffset = selection.focusOffset;
    const before = currentNode.textContent.slice(0, caretOffset);
    const after = currentNode.textContent.slice(caretOffset);
    const beforeClean = before.replace(/\u200B/g, "");
    const afterClean = after.replace(/\u200B/g, "");
    currentNode.textContent = beforeClean + afterClean;
    const newOffset = beforeClean.length;
    const sel = window.getSelection();
    const r = document.createRange();
    r.setStart(currentNode, newOffset);
    r.collapse(true);
    sel.removeAllRanges();
    sel.addRange(r);
  }
}

// Returns style object for each screenplay block type
export function getBlockStyle(type) {
  switch (type) {
    case 'slug-line':
      return { textTransform: 'uppercase', fontWeight: 'bold' };
    case 'character':
      return { paddingLeft: '2.2in', paddingRight: '0.5in', marginBottom: 0 };
    case 'dialogue':
      return { paddingLeft: '1in', paddingRight: '1.5in' };
    case 'parentheticals':
      return { paddingLeft: '1.6in', paddingRight: '2in', margin: 0 };
    case 'transition':
      return { paddingRight: '0in', textAlign: 'right' };
    case 'action':
    default:
      return { paddingLeft: 0, paddingRight: 0 };
  }
}
