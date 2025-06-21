import QuickMenu from "./QuickMenu";
import PDFPreviewModal from "./PDFPreviewModal";
import SluglineSuggestions from "./SluglineSuggestions";
import { useState } from "react";
import { generateScreenplayPDFBlob } from "../utils/previewUtils";
import { generateBlockId } from "../utils/generateBlockIdUtil";

function Canvas({
  docId,
  onOpen,
  dockActive,
  focusMode,
  overlays,
  enableFocusMode,
  changeTheme,
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
  function removeInlineStyles(node) {
    if (node.nodeType === 1) {
      node.removeAttribute('style');
      for (let child of node.childNodes) {
        removeInlineStyles(child);
      }
    }
  }
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
      newBlock.setAttribute("data-id", generateBlockId());
      removeInlineStyles(newBlock);
      // I removed the styles for some reason not sure why

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

  function handleCut(e) {
    // Let the default cut happen first, then update state
    setTimeout(() => {
      if (typeof handleInput === "function") {
        handleInput({ target: contentRef.current });
      }
    }, 0);
  }

  return (
    <div className={`main-content ${!dockActive ? 'shifted-left' : ''}`}>
      <div className="quick-menu-hover-container">
        <QuickMenu docId = {docId} onOpen={onOpen} blocks={blocks} onExport={handlePreview} onFocus={enableFocusMode} isFocusMode={focusMode} onThemeChange={changeTheme} />
      </div>
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
          onCut={handleCut}

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
