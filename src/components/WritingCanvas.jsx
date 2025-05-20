import "./WritingCanvas.css";
import { getPageOverlays } from "./getPageOverlays";
import { useRef, useEffect, useState } from "react";
import { PAGE_HEIGHT } from "./constants";

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


  const handleInput = (e) => {
    const target = e.target;

    const selection = window.getSelection();
    if (!selection.rangeCount) return;

    const range = selection.getRangeAt(0);
    const currentNode = range.startContainer;
    
    if (
      sceneHeadings.includes(
        (currentNode.textContent || "").toUpperCase()
      )
    ) {
      const boldNode = document.createElement("b");
      boldNode.textContent = currentNode.textContent;
      boldNode.style.textTransform = "uppercase";

      if (currentNode.parentNode) {
        currentNode.parentNode.replaceChild(boldNode, currentNode);
        const selection = window.getSelection();
        const range = document.createRange();
        range.setStart(boldNode, 1);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
        currentNode.textContent = currentNode.textContent.toUpperCase();
      }
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
        onKeyDown={(e) => { handlekeyDown(e) }}
      />
    </div>
  );
}

export default WritingCanvas;
