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
import { useAutoSaveBlocks, renderBlockDiv } from '../utils/saveUtils';
import { scrollToAndFocusBlock } from "../utils/sidenavUtils";
import { cleanupScreenplayBlocks, isCaretAtEnd } from "../utils/cleanUpOnEditUtils";
import { insertSuggestionUtil } from "../utils/sluglineSuggestionUtils";
import { handleSluglineSuggestions } from "../utils/sluglineSuggestionUtils";
import SideDockNav from "./SideDockNav";
import Canvas from "./Canvas";

function WritingCanvas({ docId, loadedBlocks }) {
  const contentRef = useRef(null);
  const containerRef = useRef(null);

  const [blocks, setBlocks] = useState(loadedBlocks || []);

  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(1);

  const [focusMode, setFocusMode] = useState(false);

  const [dockActive, setDocActive] = useState(false);

  const [sluglineSuggestionsList, setSluglineSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIndex, setSuggestionIndex] = useState(0);
  const [suggestionPos, setSuggestionPos] = useState({ left: 0, top: 0 });

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
  };

  function insertSuggestion(suggestion) {
    insertSuggestionUtil(suggestion, setShowSuggestions, ensureSluglineClass);
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
      setShowSuggestions(false);
      return;
    }

    const textUpper = getTextContentUpper(currentNode);
    const isSlugLine = sceneHeadings.includes(textUpper);
    const startsWithSlug = sceneHeadings.some(h => textUpper.startsWith(h));

    if (isSlugLine) {
      handleSluglineSuggestions({
        textUpper,
        blocks,
        setSluglineSuggestions,
        setShowSuggestions,
        setSuggestionIndex,
        setSuggestionPos,
        contentRef,
      });
      replaceWithSluglineDiv(currentNode);
    } else if (startsWithSlug) {
      ensureSluglineClass(currentNode);
    } else {
      removeSluglineClass(currentNode);
      setShowSuggestions(false)
    }

    const editor = e.target;
    const newBlocks = Array.from(editor.children).map(div => ({
      type: div.getAttribute('data-name'),
      text: div.innerText
    }));
    setBlocks(newBlocks);
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
    <div className="writing-canvas-root">
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
        dockActive={dockActive}
        focusMode={focusMode}
        overlays={overlays}
        enableFocusMode={() => enableFocusMode()}
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
