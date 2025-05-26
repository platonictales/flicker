import "./WritingCanvas.css";
import { getPageOverlays } from "./getPageOverlays";
import { useRef, useEffect, useState } from "react";
import { PAGE_HEIGHT } from "./constants";
import { removeInlineTextStyles, replaceWithSluglineDiv, ensureSluglineClass, removeSluglineClass, isNodeEmpty, getTextContentUpper, getParentElementNode } from "../utils/slugLineUtils";
import { ensureZeroWidthDiv, removeZeroWidthSpaceFromNode } from "../utils/writingCanvasUtils";
import { characterAnticipateDialogue, autoInsertParentheses, createDialogueDivAndFocus, handleParentheticalTrigger, transitionAnticipateAction } from "../utils/dialogueUtils";
import { handleModifiedCharacter } from "../utils/characterUtils";
import { sceneHeadings, transitions } from "./screenplayConstants";

function WritingCanvas() {
  const contentRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const updatePageCount = () => {
      if (contentRef.current) {
        const height = contentRef.current.scrollHeight;
        setPageCount(Math.max(1, Math.ceil(height / PAGE_HEIGHT)));
      }
    };

    updatePageCount();
    contentRef.current?.focus();

    const ref = contentRef.current;
    if (ref) {
      ref.addEventListener("input", updatePageCount);
    }

    return () => {
      if (ref) {
        ref.removeEventListener("input", updatePageCount);
      }
    };
  }, []);

  const handleKeyDown = (e) => {
    const target = e.target;

    if (e.key === "(") {
      autoInsertParentheses(e);
      if (handleParentheticalTrigger()) return;
    }

    if (e.key === "Enter") {
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
      
      if(name === "parentheticals"){
        e.preventDefault();
        const parent = currentNode.parentNode;
        createDialogueDivAndFocus(parent, selection);
      }
    }

    if (e.key.length === 1) {
      handleModifiedCharacter();
    }
  }

  const handleInput = (e) => {
    const target = e.target;

    if (ensureZeroWidthDiv(target)) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const currentNode = range.startContainer;

    removeZeroWidthSpaceFromNode(currentNode, selection);

    if (isNodeEmpty(currentNode)) {
      removeInlineTextStyles(currentNode);
      return;
    }

    const textUpper = getTextContentUpper(currentNode);
    const isSlugLine = sceneHeadings.includes(textUpper);
    const startsWithSlug = sceneHeadings.some(h => textUpper.startsWith(h));

    if (isSlugLine) {
      replaceWithSluglineDiv(currentNode);
    } else if (startsWithSlug) {
      ensureSluglineClass(currentNode);
    } else {
      removeSluglineClass(currentNode);
    }
  }

  const overlays = getPageOverlays(pageCount);

  return (
    <div className="writing-canvas-container">
      {overlays}
      <div
        ref={contentRef}
        contentEditable="true"
        className="writing-canvas"
        suppressContentEditableWarning={true}
        onInput={(e) => { handleInput(e) }}
        onKeyDown={(e) => { handleKeyDown(e) }}
      >
        <div data-name="action">{'\u200B'}</div>
      </div>
    </div>
  );
}

export default WritingCanvas;
