import QuickMenu from "./QuickMenu";
import PDFPreviewModal from "./PDFPreviewModal";
import SluglineSuggestions from "./SluglineSuggestions";
import { useState } from "react";
import { generateScreenplayPDFBlob } from "../utils/previewUtils";

function Canvas({
  dockActive,
  focusMode,
  overlays,
  enableFocusMode,
  containerRef,
  contentRef,
  focusModeStyle,
  handleInput,
  handleKeyDown,
  loadedBlocks,
  showSuggestions,
  sluglineSuggestionsList,
  suggestionIndex,
  suggestionPos,
  insertSuggestion,
  blocks = [],
}) {
  const [showPDF, setShowPDF] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);

  const handlePreview = () => {
    const blob = generateScreenplayPDFBlob(blocks);
    setPdfBlob(blob);
    setShowPDF(true);
  };

  // Add this to your Canvas or editor component
  function handlePaste(e) {
    e.preventDefault();
    const clipboardData = e.clipboardData || window.clipboardData;
    const html = clipboardData.getData('text/html');
    if (!html) return;

    // Parse the HTML and extract screenplay blocks
    const temp = document.createElement('div');
    temp.innerHTML = html;
    const blocks = Array.from(temp.querySelectorAll('div[data-name]'));
    if (blocks.length === 0) return;

    // Find the direct child of the editor where the caret is
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    let range = selection.getRangeAt(0);
    let currentNode = range.startContainer;

    // Traverse up to find the direct child of the editor
    while (
      currentNode &&
      currentNode !== contentRef.current &&
      currentNode.parentNode !== contentRef.current
    ) {
      currentNode = currentNode.parentNode;
    }

    // Insert after the found node, or append if not found
    let insertAfter = currentNode && currentNode !== contentRef.current ? currentNode : null;
    let originalBlock = insertAfter; // Save reference to the original block

    blocks.forEach(block => {
      const newBlock = block.cloneNode(true);
      if (insertAfter && insertAfter.nextSibling) {
        contentRef.current.insertBefore(newBlock, insertAfter.nextSibling);
        insertAfter = newBlock;
      } else {
        contentRef.current.appendChild(newBlock);
        insertAfter = newBlock;
      }
    });

    // Remove the original block if it's empty (no text or only whitespace/br)
    if (
      originalBlock &&
      originalBlock !== contentRef.current &&
      (!originalBlock.textContent.trim() ||
        originalBlock.innerHTML.trim() === "<br>" ||
        originalBlock.innerHTML.trim() === "")
    ) {
      contentRef.current.removeChild(originalBlock);
    }

    // Move caret to the end of the last inserted block
    if (insertAfter) {
      const newRange = document.createRange();
      newRange.selectNodeContents(insertAfter);
      newRange.collapse(false);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }
    if (typeof handleInput === "function") {
      handleInput({ target: contentRef.current });
    }
  }

  return (
    <div className={`main-content ${!dockActive ? 'shifted-left' : ''}`}>
      <QuickMenu onExport={handlePreview} onFocus={enableFocusMode} isFocusMode={focusMode} />
      {showPDF && <PDFPreviewModal pdfBlob={pdfBlob} onClose={() => setShowPDF(false)} />}
      <div className="writing-canvas-container" ref={containerRef}>
        {!focusMode && overlays}
        <div
          ref={contentRef}
          contentEditable="true"
          className="writing-canvas"
          style={focusModeStyle}
          suppressContentEditableWarning={true}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        >
          {(!loadedBlocks || loadedBlocks.length === 0) && <div data-name="action">{'\u200B'}</div>}
        </div>
        <SluglineSuggestions
          show={showSuggestions}
          suggestions={sluglineSuggestionsList}
          suggestionIndex={suggestionIndex}
          suggestionPos={suggestionPos}
          onSelect={insertSuggestion}
        />
      </div>
    </div>
  );
}

export default Canvas;