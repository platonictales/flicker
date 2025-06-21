import "./WritingCanvas.css";
import { getPageOverlays } from "./getPageOverlays";
import { filterOverlaysByActivePage } from "../utils/overlayUtils";
import { getFocusModeStyle, scrollCaretToCenter, setCaretToEnd, updateBlockOpacities } from "../utils/focusModeUtils";
import { useRef, useEffect, useState } from "react";
import { PAGE_HEIGHT } from "./constants";
import { ensureSluglineClass } from "../utils/slugLineUtils";
import { ensureZeroWidthDivAction } from "../utils/writingCanvasUtils";
import { autoInsertParentheses, handleParentheticalTrigger } from "../utils/dialogueUtils";
import { handleModifiedCharacter } from "../utils/characterUtils";
import { sceneHeadings } from "./screenplayConstants";
import { useAutoSaveBlocks, renderBlockDiv } from '../utils/fileUtils';
import { scrollToAndFocusBlock } from "../utils/sidenavUtils";
import { insertSuggestionUtil } from "../utils/sluglineSuggestionUtils";
import { handleRedo, handleUndo, isUndoKey, isRedoKey } from "../utils/undoRedoUtils";
import { handleEnterKeyAction, handleEditorInput } from "../utils/screenplayUtils";
import { isPrintableKey, handleBackspace, handleDelete } from "../utils/keyUtils";
import SideDockNav from "./SideDockNav";
import Canvas from "./Canvas";

function WritingCanvas({ docId, loadedBlocks, onOpen }) {
  const contentRef = useRef(null);
  const containerRef = useRef(null);

  const [blocks, setBlocks] = useState(loadedBlocks || []);

  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(1);

  const [focusMode, setFocusMode] = useState(false);

  const [dockActive, setDocActive] = useState(false);

  const themeOptions = ["light", "dark", "solaris", "monokai"];
  const [theme, setTheme] = useState("light");

  const [sluglineSuggestionsList, setSluglineSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [suggestionPos, setSuggestionPos] = useState({ left: 0, top: 0 });

  const [undoStack, setUndoStack] = useState([]);
  const [redoStack, setRedoStack] = useState([]);

  function changeTheme() {
    setTheme(prev => {
      const idx = themeOptions.indexOf(prev);
      return themeOptions[(idx + 1) % themeOptions.length];
    });
  }

  function enableSideDock() {
    setDocActive(!dockActive);
    if (focusMode) {
      setDocActive(false);
    }
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
        setCaretToEnd(contentRef.current);
      }
    }
  }, [loadedBlocks]);

  useEffect(() => {
    const handler = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      let node = range.startContainer;
      while (node && node !== contentRef.current && node.nodeType !== 1) {
        node = node.parentNode;
      }
      if (!node || node === contentRef.current) return;
      const rect = node.getBoundingClientRect();
      const editorRect = contentRef.current.getBoundingClientRect();
      const caretY = rect.top - editorRect.top;
      const page = Math.floor(caretY / PAGE_HEIGHT) + 1;
      setActivePage(page);
    };
    document.addEventListener('selectionchange', handler);
    return () => document.removeEventListener('selectionchange', handler);
  }, []);

  function enableFocusMode() {
    setFocusMode(!focusMode);
    setDocActive(focusMode);
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
    ensureZeroWidthDivAction(target)

    if (handleBackspace(e, contentRef)) {
      e.preventDefault();
      return;
    }
    if (handleDelete(e, contentRef)) {
      e.preventDefault();
      return;
    }

    if (isUndoKey(e)) {
      e.preventDefault();
      handleUndo({
        setUndoStack,
        setRedoStack,
        setBlocks,
        contentRef,
        blocks,
      });
      return;
    }
    if (isRedoKey(e)) {
      e.preventDefault();
      handleRedo({
        setRedoStack,
        setUndoStack,
        setBlocks,
        contentRef,
        blocks,
      });
      return;
    }

    if (e.key === "Escape") setShowSuggestions(false);
    // Slugline suggestion navigation
    if (showSuggestions && sluglineSuggestionsList.length > 0) {
      if (e.key === "Tab") {
        e.preventDefault();
        setSuggestionIndex((prev) => (prev + 1) % sluglineSuggestionsList.length);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        if (sluglineSuggestionsList[suggestionIndex]) {
          insertSuggestion(sluglineSuggestionsList[suggestionIndex]);
        }
        return;
      }
    }

    if (e.key === "(") {
      autoInsertParentheses(e);
      if (handleParentheticalTrigger()) return;
    }

    if (e.key === "Enter") {
      handleEnterKeyAction({
        e,
        contentRef,
        target,
        sceneHeadings,
        enterSaveTimeout,
        blocks,
        docId,
      });
    }

    if (focusMode) scrollCaretToCenter(containerRef, 0);

    if (isPrintableKey(e)) {
      handleModifiedCharacter();
    }
  };

  function insertSuggestion(suggestion) {
    insertSuggestionUtil(suggestion, setShowSuggestions, ensureSluglineClass);
  }

  const handleInput = (e) => {
    handleEditorInput({
      e,
      blocks,
      setUndoStack,
      setRedoStack,
      contentRef,
      setShowSuggestions,
      setSluglineSuggestions,
      setSuggestionIndex,
      setSuggestionPos,
      setBlocks,
    });
  };
  // Only show overlays for the active page
  const overlays = filterOverlaysByActivePage(getPageOverlays(pageCount), activePage);

  const focusModeStyle = getFocusModeStyle(focusMode);

  const sluglines = (blocks || [])
    .filter(b => b.type === "slug-line")
    .map((b, idx) => ({
      ...b,
      id: idx + 1
    }));

  return (
    <div className={`writing-canvas-root theme-${theme}`}>
      <SideDockNav
        focusMode={focusMode}
        dockActive={dockActive}
        sluglines={sluglines}
        enableSideDock={enableSideDock}
        scrollToAndFocusBlock={scrollToAndFocusBlock}
        contentRef={contentRef}
      />
      {/* Main editor area */}
      <Canvas
        docId={docId}
        onOpen={onOpen}
        dockActive={dockActive}
        focusMode={focusMode}
        overlays={overlays}
        enableFocusMode={() => enableFocusMode()}
        changeTheme={changeTheme}
        containerRef={containerRef}
        contentRef={contentRef}
        focusModeStyle={focusModeStyle}
        handleInput={handleInput}
        handleKeyDown={handleKeyDown}
        loadedBlocks={loadedBlocks}
        showSuggestions={showSuggestions}
        sluglineSuggestionsList={sluglineSuggestionsList}
        suggestionIndex={suggestionIndex}
        suggestionPos={suggestionPos}
        insertSuggestion={insertSuggestion}
        blocks={blocks}
      />
    </div>
  );
}

export default WritingCanvas;
