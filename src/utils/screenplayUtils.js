import { getParentElementNode } from './slugLineUtils';
import { characterAnticipateDialogue, createDialogueDivAndFocus, transitionAnticipateAction } from './dialogueUtils';
import { cleanupScreenplayBlocks, isCaretAtEnd } from "../utils/cleanUpOnEditUtils";

export function handleEnterKeyAction({
  e,
  contentRef,
  target,
  sceneHeadings,
  transitions,
  enterSaveTimeout,
  blocks,
  docId
}) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  let currentNode = range.startContainer;
  const text = currentNode.textContent || "";
  const isUppercase = text === text.toUpperCase() && /[A-Z]/.test(text);
  const isSlugLine = sceneHeadings.some(h => text.startsWith(h));
  const isTransition = transitions.some(t => text.startsWith(t));
  const isCharacterName = isUppercase && !isSlugLine && !isTransition;

  currentNode = getParentElementNode(currentNode);
  const name = currentNode.getAttribute("data-name");

  if (isCharacterName) {
    e.preventDefault();
    characterAnticipateDialogue(currentNode, target, selection);
  }

  if (isTransition) {
    e.preventDefault();
    transitionAnticipateAction(currentNode, target, selection);
  }

  if (name === "parentheticals") {
    e.preventDefault();
    const parent = currentNode.parentNode;
    createDialogueDivAndFocus(parent, selection);
  }

  clearTimeout(enterSaveTimeout.current);
  enterSaveTimeout.current = setTimeout(() => {
    import('@tauri-apps/api/core').then(({ invoke }) => {
      invoke('auto_save_blocks', { blocks, docId });
    });
  }, 500);

  if (contentRef.current && !isCaretAtEnd(contentRef.current)) {
    cleanupScreenplayBlocks(contentRef.current);
  }
}