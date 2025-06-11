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