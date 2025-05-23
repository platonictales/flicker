import "./WritingCanvas.css";
import { getPageOverlays } from "./getPageOverlays";
import { useRef, useEffect, useState } from "react";
import { PAGE_HEIGHT } from "./constants";
import { removeInlineTextStyles, replaceWithSluglineDiv, ensureSluglineClass, removeSluglineClass, isNodeEmpty, getTextContentUpper } from "../utils/slugLineUtils";
import { ensureZeroWidthDiv } from "../utils/writingCanvasUtils";

function WritingCanvas() {
  const contentRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);
  const sceneHeadings = ["INT.", "EXT.", "INT/EXT.", "EXT/INT."];

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

    if (e.key === "Enter") {
      const selection = window.getSelection();
      if (!selection.rangeCount) return;

      const range = selection.getRangeAt(0);
      const currentNode = range.startContainer;
      const text = currentNode.textContent || "";
      const isUppercase = text === text.toUpperCase() && /[A-Z]/.test(text);
      if(isUppercase) {
        //move the current node to character's position
        // add a new div in new line and place the caret inside it at a specific margin
        e.preventDefault();
        // Add padding to the current node (the div where Enter was pressed)
        if (currentNode.nodeType === Node.TEXT_NODE && currentNode.parentNode && currentNode.parentNode.nodeName === 'DIV') {
          currentNode.parentNode.style.paddingLeft = "2.2in";
          currentNode.parentNode.style.paddingRight = "0.5in";
        } else if (currentNode.nodeName === 'DIV') {
          currentNode.parentNode.style.paddingLeft = "2.2in";
          currentNode.parentNode.style.paddingRight = "0.5in";
        }
        // Optionally, you can still create a new div for the new line if needed
        const newDiv = document.createElement("div");
        newDiv.textContent = '\u200B'; // Zero-width space
        newDiv.style.paddingLeft = "1in";
        newDiv.style.paddingRight = "1.5in";
        target.appendChild(newDiv);
        const newRange = document.createRange();
        newRange.selectNodeContents(newDiv);
        newRange.collapse(false);
        selection.removeAllRanges();
        selection.addRange(newRange);
      }
    }
  }

  const handleInput = (e) => {
    const target = e.target;

    if (ensureZeroWidthDiv(target)) return;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const currentNode = range.startContainer;

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
        <div>{'\u200B'}</div>
      </div>
    </div>
  );
}

export default WritingCanvas;
