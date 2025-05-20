import "./WritingCanvas.css";
import { getPageOverlays } from "./getPageOverlays";
import { useRef, useEffect, useState } from "react";
import { PAGE_HEIGHT } from "./constants";

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


  const overlays = getPageOverlays(pageCount);

  return (
    <div className="writing-canvas-container">
      {overlays}
      <div
        ref={contentRef}
        contentEditable="true"
        className="writing-canvas"
        suppressContentEditableWarning={true}
      />
    </div>
  );
}

export default WritingCanvas;
