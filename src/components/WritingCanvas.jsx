import "./WritingCanvas.css";
import { useRef, useEffect, useState } from "react";

function WritingCanvas() {
  const contentRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);

  const PAGE_HEIGHT = 912;
  const TOP_PADDING = 96;

  useEffect(() => {
    const updatePageCount = () => {
      if (contentRef.current) {
        const height = contentRef.current.scrollHeight;
        setPageCount(Math.max(1, Math.ceil(height / PAGE_HEIGHT)));
      }
    };

    updatePageCount();

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

  useEffect(() => {
    contentRef.current?.focus();
  }, []);

  const overlays = [];

  for (let i = 1; i <= pageCount; i++) {
    if (i > 1) {
      overlays.push(
        <div
          className="page-number"
          style={{ top: `${(i - 1) * PAGE_HEIGHT + TOP_PADDING}px` }}
          key={`num-${i}`}
        >
          <span>{i}.</span>
        </div>
      );
      overlays.push(
        <div
          className="page-break"
          style={{ top: `${(i - 1) * PAGE_HEIGHT + TOP_PADDING}px` }}
          key={`break-${i}`}
        />
      );
    }
  }

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
