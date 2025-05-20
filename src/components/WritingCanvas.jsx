import "./WritingCanvas.css";
import { useRef, useEffect, useState } from "react";

function WritingCanvas() {

  const contentRef = useRef(null);
  const [pageCount, setPageCount] = useState(1);

  useEffect(() => {
    const updatePageCount = () => {
      if (contentRef.current) {
        const height = contentRef.current.scrollHeight;
        setPageCount(Math.max(1, Math.ceil(height / 912)));
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

  const pageNumbers = [];
  for (let i = 1; i <= pageCount; i++) {
    pageNumbers.push(
      <div className="page-number" style={{ top: `${(i - 1) * 912 + 48}px` }} key={i}>
        <span>{i}.</span>
      </div>
    );
  }

  return (
    <div className="writing-canvas-container">
      {pageNumbers}
      <div
        ref={contentRef}
        contentEditable="true"
        className="writing-canvas"
        suppressContentEditableWarning={true}
      >
      </div>
    </div>
  );
}

export default WritingCanvas;