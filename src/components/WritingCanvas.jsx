import "./WritingCanvas.css";
import { getPageOverlays } from "./getPageOverlays";
import { useRef, useEffect, useState } from "react";
import { PAGE_HEIGHT } from "./constants";
import { removeInlineTextStyles, replaceWithSluglineDiv, ensureSluglineClass, removeSluglineClass, isNodeEmpty, getTextContentUpper, getParentElementNode } from "../utils/slugLineUtils";
import { ensureZeroWidthDiv, removeZeroWidthSpaceFromNode } from "../utils/writingCanvasUtils";
import { characterAnticipateDialogue, autoInsertParentheses, createDialogueDivAndFocus, handleParentheticalTrigger, transitionAnticipateAction } from "../utils/dialogueUtils";
import { handleModifiedCharacter } from "../utils/characterUtils";
import { sceneHeadings, transitions } from "./screenplayConstants";
import jsPDF from "jspdf";
import React from "react";

function TopMenuBar({ onExport }) {
  return (
    <div style={{
      width: '100%',
      color: '#fff',
      padding: '0.5rem 1rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      position: 'sticky',
      top: 0,
      zIndex: 1000
    }}>
      <button onClick={onExport} style={{
        background: "red",
        color: '#fff',
        border: 'none',
        borderRadius: 4,
        padding: '0.4rem 1.2rem',
        fontWeight: 600,
        cursor: 'pointer',
        fontSize: '1rem',
        marginLeft: 'auto'
      }}>Export PDF</button>
    </div>
  );
}

function WritingCanvas() {
  const contentRef = useRef(null);
  const [blocks, setBlocks] = useState([]);
  console.log(blocks, "blocks in WritingCanvas");
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
    }

    if (e.key.length === 1) {
      handleModifiedCharacter();
    }
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

  function generateScreenplayPDF(blocks) {
    const doc = new jsPDF({ unit: 'in', format: 'letter' });
    let y = 1; // Start 1 inch from the top
    blocks.forEach(block => {
      let text = block.text || " ";
      let x = 1.5; // Default left margin in inches
      let options = {};
      switch (block.type) {
        case 'slug-line':
          doc.setFont('Courier', 'bold');
          doc.setFontSize(12);
          doc.text(text.toUpperCase(), x, y);
          y += 0.4; // Extra space after slugline
          break;
        case 'action':
          doc.setFont('Courier', 'normal');
          doc.setFontSize(12);
          doc.text(text, x, y, { maxWidth: 6.5 });
          y += 0.4;
          break;
        case 'character':
          doc.setFont('Courier', 'bold');
          doc.setFontSize(12);
          doc.text(text.toUpperCase(), 4.25, y, { align: 'center' });
          y += 0.18; // Small space after character
          break;
        case 'parentheticals':
          doc.setFont('Courier', 'normal'); // Keep normal font
          doc.setFontSize(12);
          doc.text(text.replace(/\s+/g, ' ').trim(), 2, y, { maxWidth: 4.5 }); // match dialogue block width
          y += 0.18;
          break;
        case 'dialogue':
          doc.setFont('Courier', 'normal');
          doc.setFontSize(12);
          doc.text(text, 2, y, { maxWidth: 4.5 });
          y += 0.4;
          break;
        case 'transition':
          doc.setFont('Courier', 'normal');
          doc.setFontSize(12);
          doc.text(text, 6.5, y, { align: 'right' });
          y += 0.4;
          break;
        default:
          doc.setFont('Courier', 'normal');
          doc.setFontSize(12);
          doc.text(text, x, y);
          y += 0.4;
          break;
      }
      if (y > 10) { // New page if past bottom margin
        doc.addPage();
        y = 1;
      }
    });
    doc.save("screenplay.pdf");
  }

  const overlays = getPageOverlays(pageCount);

  return (
    <div className="writing-canvas-container">
      <TopMenuBar onExport={() => generateScreenplayPDF(blocks)} />
      {overlays}
      <div
        ref={contentRef}
        contentEditable="true"
        className="writing-canvas"
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
      >
        <div data-name="action">{'\u200B'}</div>
      </div>
    </div>
  );
}

export default WritingCanvas;
