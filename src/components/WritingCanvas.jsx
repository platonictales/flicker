import "./WritingCanvas.css";
import { getPageOverlays } from "./getPageOverlays";
import { filterOverlaysByActivePage } from "../utils/overlayUtils";
import { getFocusModeStyle, scrollCaretToCenter, setCaretToEnd, updateBlockOpacities } from "../utils/focusModeUtils";
import { useRef, useEffect, useState } from "react";
import { PAGE_HEIGHT } from "./constants";
import { removeInlineTextStyles, replaceWithSluglineDiv, ensureSluglineClass, removeSluglineClass, isNodeEmpty, getTextContentUpper, getParentElementNode } from "../utils/slugLineUtils";
import { ensureZeroWidthDiv, removeZeroWidthSpaceFromNode } from "../utils/writingCanvasUtils";
import { characterAnticipateDialogue, autoInsertParentheses, createDialogueDivAndFocus, handleParentheticalTrigger, transitionAnticipateAction } from "../utils/dialogueUtils";
import { handleModifiedCharacter } from "../utils/characterUtils";
import { sceneHeadings, transitions } from "./screenplayConstants";
import { generateScreenplayPDFBlob } from "../utils/previewUtils";
import QuickMenu from "./QuickMenu";
import PDFPreviewModal from "./PDFPreviewModal";
import { useAutoSaveBlocks, renderBlockDiv } from '../utils/saveUtils';
import { DockRightButton } from "./dockRight";
import { scrollToAndFocusBlock } from "../utils/sidenavUtils";
import { cleanupScreenplayBlocks, isCaretAtEnd } from "../utils/cleanUpOnEditUtils";


function WritingCanvas({ docId, loadedBlocks }) {
  const contentRef = useRef(null);
  const containerRef = useRef(null);
  const [blocks, setBlocks] = useState(loadedBlocks || []);
  const [pageCount, setPageCount] = useState(1);
  const [focusMode, setFocusMode] = useState(false);
  const [showPDF, setShowPDF] = useState(false);
  const [pdfBlob, setPdfBlob] = useState(null);
  const [activePage, setActivePage] = useState(1);
  const [dockActive, setDocActive] = useState(true);

  function enableSideDock() {
    setDocActive(!dockActive);
  }
  useAutoSaveBlocks(blocks, docId);

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

  useEffect(() => {
    if (loadedBlocks && loadedBlocks.length > 0) {
      setBlocks(loadedBlocks);
      if (contentRef.current) {
        contentRef.current.innerHTML = loadedBlocks.map(renderBlockDiv).join("");
      }
    }
  }, [loadedBlocks]);

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      let node = range.startContainer;
      // Find the block div
      while (node && node !== contentRef.current && node.nodeType !== 1) {
        node = node.parentNode;
      }
      if (!node || node === contentRef.current) return;
      // Get caret Y position relative to editor
      const rect = node.getBoundingClientRect();
      const editorRect = contentRef.current.getBoundingClientRect();
      const caretY = rect.top - editorRect.top;
      // Calculate page number (1-based)
      const page = Math.floor(caretY / PAGE_HEIGHT) + 1;
      setActivePage(page);
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, []);

  function enableFocusMode() {
    setFocusMode(!focusMode);
  }

  useEffect(() => {
    if (contentRef.current) {
      setCaretToEnd(contentRef.current);
    }
    if (focusMode) {
      updateBlockOpacities(contentRef.current);

      const handler = () => updateBlockOpacities(contentRef.current);
      document.addEventListener('selectionchange', handler);
      return () => {
        document.removeEventListener('selectionchange', handler);
      };
    } else {
      if (contentRef.current) {
        Array.from(contentRef.current.children).forEach(div => {
          div.style.opacity = '1';
        });
      }
    }
  }, [focusMode]);

  // Debounced save on Enter key
  const enterSaveTimeout = useRef();
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
    if (focusMode) scrollCaretToCenter(containerRef, 0);

    if (e.key.length === 1) handleModifiedCharacter();

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

    const editor = e.target;
    const newBlocks = Array.from(editor.children).map(div => ({
      type: div.getAttribute('data-name'),
      text: div.innerText
    }));
    setBlocks(newBlocks);
  }

  const handlePreview = () => {
    const blob = generateScreenplayPDFBlob(blocks);
    setPdfBlob(blob);
    setShowPDF(true);
  }

  // Only show overlays for the active page
  const overlays = filterOverlaysByActivePage(getPageOverlays(pageCount), activePage);

  const focusModeStyle = getFocusModeStyle(focusMode);

  // Extract sluglines for sidenav
  const sluglines = (blocks || []).filter(b => b.type === "slug-line");
  return (
    <div className="writing-canvas-root">
      {/* Sidenav with sluglines */}
      <div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", background: " #f5f5f5" }}>
          <DockRightButton onClick={() => enableSideDock()} />
        </div>
        {dockActive &&
          <nav className="sidenav">

            <ul>
              {sluglines.map((block, idx) => (
                <li
                  key={idx}
                  style={{ cursor: "pointer" }}
                  onClick={() => scrollToAndFocusBlock(contentRef.current, block.text)}
                >
                  {block.text}
                </li>
              ))}
            </ul>
          </nav>
        }
      </div>
      {/* Main editor area */}
      <div className={`main-content ${!dockActive ? 'shifted-left' : ''}`}>
        <QuickMenu onExport={handlePreview} onFocus={() => enableFocusMode()} isFocusMode={focusMode} />
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
        </div>
      </div>
    </div>
  );
}

export default WritingCanvas;