export const isPrintableKey = (e) =>
  e.key.length === 1 &&
  !e.ctrlKey &&
  !e.metaKey &&
  !e.altKey &&
  !e.shiftKey;


export function handleBackspace(e, contentRef) {
  if (e.key !== "Backspace") return false;

  const selection = window.getSelection();
  if (!selection.rangeCount) return false;
  const range = selection.getRangeAt(0);
  const currentNode = range.startContainer;

  // Prevent deletion if only one empty block
  if (
    contentRef.current.childNodes.length === 1 &&
    contentRef.current.firstChild.textContent.trim() === ""
  ) {
    return true;
  }

  let blockDiv = currentNode.nodeType === Node.ELEMENT_NODE
    ? currentNode
    : currentNode.parentNode;

  if (
    blockDiv &&
    blockDiv !== contentRef.current &&
    range.collapsed &&
    range.startOffset === 0 &&
    blockDiv.textContent.length > 0
  ) {
    return true;
  }

  return false;
}

export function handleDelete(e, contentRef) {
  if (e.key !== "Delete") return false;

  const selection = window.getSelection();
  if (!selection.rangeCount) return false;
  const range = selection.getRangeAt(0);
  const currentNode = range.startContainer;

  let blockDiv = currentNode.nodeType === Node.ELEMENT_NODE
    ? currentNode
    : currentNode.parentNode;

  // Prevent delete if caret is at the end of the block and block is not empty
  if (
    blockDiv &&
    blockDiv !== contentRef.current &&
    range.collapsed &&
    range.startOffset === blockDiv.textContent.length &&
    blockDiv.textContent.length > 0
  ) {
    return true;
  }

  return false;
}