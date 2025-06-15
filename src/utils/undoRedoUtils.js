import { renderBlockDiv } from './fileUtils';
import { setCaretToEnd } from "./focusModeUtils";

export function isUndoKey(e) {
  return (e.ctrlKey || e.metaKey) && e.key === "z";
}

export function isRedoKey(e) {
  return (
    (e.ctrlKey || e.metaKey) &&
    (e.key === "y" || (e.shiftKey && (e.key === "Z" || e.key === "z")))
  );
}

export function getNodePath(node, root) {
  const path = [];
  while (node && node !== root) {
    let idx = 0;
    let sibling = node;
    while ((sibling = sibling.previousSibling)) idx++;
    path.unshift(idx);
    node = node.parentNode;
  }
  return path;
}

export function getCaretPosition(contentRef) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return null;
  const range = selection.getRangeAt(0);
  return {
    startContainerPath: getNodePath(range.startContainer, contentRef.current),
    startOffset: range.startOffset,
  };
}

export function restoreCaret(caret, contentRef, setCaretToEnd) {
  if (!caret) return;
  let node = contentRef.current;
  for (const idx of caret.startContainerPath) {
    if (!node || !node.childNodes || !node.childNodes[idx]) {
      node = null;
      break;
    }
    node = node.childNodes[idx];
  }
  // If node is not found, fallback to end of editor
  if (!node) {
    setCaretToEnd(contentRef.current);
    return;
  }
  const maxOffset = node.nodeType === 3 ? node.length : node.childNodes.length;
  const safeOffset = Math.min(caret.startOffset, maxOffset);
  const range = document.createRange();
  range.setStart(node, safeOffset);
  range.collapse(true);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}

export function handleUndo({
  setUndoStack,
  setRedoStack,
  setBlocks,
  contentRef,
  blocks,
}) {
  setUndoStack(prev => {
    if (prev.length === 0) return prev;
    const last = prev[prev.length - 1];
    setRedoStack(r => [...r, { blocks, caret: getCaretPosition(contentRef) }]);
    setBlocks(last.blocks);
    if (contentRef.current) {
      contentRef.current.innerHTML = last.blocks.map(renderBlockDiv).join("");
      restoreCaret(last.caret, contentRef, setCaretToEnd);
    }
    return prev.slice(0, -1);
  });
}

export function handleRedo({
  setRedoStack,
  setUndoStack,
  setBlocks,
  contentRef,
  blocks,
}) {
  setRedoStack(prev => {
    if (prev.length === 0) return prev;
    const last = prev[prev.length - 1];
    setUndoStack(u => [...u, { blocks, caret: getCaretPosition(contentRef) }]);
    setBlocks(last.blocks);
    if (contentRef.current) {
      contentRef.current.innerHTML = last.blocks.map(renderBlockDiv).join("");
      restoreCaret(last.caret, contentRef, setCaretToEnd);
    }
    return prev.slice(0, -1);
  });
}
