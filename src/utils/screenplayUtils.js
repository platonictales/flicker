import { characterAnticipateDialogue, createDialogueDivAndFocus, transitionAnticipateAction } from './dialogueUtils';
import { cleanupScreenplayBlocks, isCaretAtEnd } from "../utils/cleanUpOnEditUtils";
import { getCaretPosition } from "../utils/undoRedoUtils";
import { removeInlineTextStyles, replaceWithSluglineDiv, ensureSluglineClass, removeSluglineClass, isNodeEmpty, getTextContentUpper, getParentElementNode } from "../utils/slugLineUtils";
import { handleSluglineSuggestions } from "../utils/sluglineSuggestionUtils";
import { sceneHeadings, transitions } from "../components/screenplayConstants";
import { ensureZeroWidthDiv, removeZeroWidthSpaceFromNode } from "../utils/writingCanvasUtils";

export function handleEnterKeyAction({
  e,
  contentRef,
  target,
  sceneHeadings,
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
  const isTransition = transitions.some(t => text ===t);
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

export function handleEditorInput({
  e,
  blocks,
  setUndoStack,
  setRedoStack,
  contentRef,
  setShowSuggestions,
  setSluglineSuggestions,
  setSuggestionIndex,
  setSuggestionPos,
  setBlocks,
}) {
  const target = e.target;

  setUndoStack(prev => [
    ...prev,
    {
      blocks,
      caret: getCaretPosition(contentRef),
    },
  ]);
  setRedoStack([]);

  if (ensureZeroWidthDiv(target)) return;

  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const currentNode = range.startContainer;

  removeZeroWidthSpaceFromNode(currentNode, selection);

  if (isNodeEmpty(currentNode)) {
    removeInlineTextStyles(currentNode);
    setShowSuggestions(false);
    return;
  }

  const textUpper = getTextContentUpper(currentNode);
  const text = currentNode.textContent || "";
  const isUppercase = text === text.toUpperCase() && /[A-Z]/.test(text);

  const isSlugLine = sceneHeadings.includes(textUpper);
  const startsWithSlug = sceneHeadings.some(h => textUpper.startsWith(h));
  const isTransitionBlock = transitions.some(t => textUpper === t);
  const isTransition = isTransitionBlock && isUppercase && !isSlugLine;

  if (isSlugLine) {
    handleSluglineSuggestions({
      textUpper,
      blocks,
      setSluglineSuggestions,
      setShowSuggestions,
      setSuggestionIndex,
      setSuggestionPos,
      contentRef,
    });
    replaceWithSluglineDiv(currentNode);
  } else if (startsWithSlug) {
    ensureSluglineClass(currentNode);
  } else {
    removeSluglineClass(currentNode);
    setShowSuggestions(false);
  }
  if (!isTransition) {
    removeSluglineClass(currentNode);
  }

  const editor = e.target;
  const newBlocks = Array.from(editor.children).map(div => ({
    type: div.getAttribute('data-name'),
    text: div.innerText.replace(/\u200B/g, ""),
  }));
  setBlocks(newBlocks);
}
