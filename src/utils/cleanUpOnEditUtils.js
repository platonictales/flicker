export function isCaretAtEnd(editor) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return false;
  const range = selection.getRangeAt(0);
  // Caret must be collapsed (no selection)
  if (!range.collapsed) return false;
  // Check if caret is at the end of the last child
  const lastDiv = editor.lastElementChild;
  if (!lastDiv) return false;
  return (
    range.endContainer === lastDiv &&
    range.endOffset === lastDiv.textContent.length
  );
}

function convertToActionBlock(el) {
  if (!el) return;
  el.setAttribute("data-name", "action");
  el.style.textTransform = "none";
  el.style.fontWeight = "normal";
  el.style.paddingLeft = "0";
  el.style.paddingRight = "0";
  el.style.margin = "";
}

export function cleanupScreenplayBlocks(editor) {
  if (!editor) return;
  const blocks = Array.from(editor.children);

  for (let i = 0; i < blocks.length - 1; i++) {
    const current = blocks[i];
    const next = blocks[i + 1];
    const prev = blocks[i - 1];
    const currentType = current.getAttribute("data-name");
    const nextType = next.getAttribute("data-name");
    const prevType = prev ? prev.getAttribute("data-name") : null;

    // No two character types adjacent
    if (currentType === "character" && nextType === "character") {
      convertToActionBlock(current);
    }

    // No two dialogue types adjacent
    if (currentType === "dialogue" && nextType === "dialogue") {
      convertToActionBlock(next);
    }

    // Parentheticals must be between character and dialogue
    if (currentType === "parentheticals") {
      if (prevType !== "character") {
        convertToActionBlock(current);

        continue; // No need to check nextType if already converted
      }
      if (nextType !== "dialogue") {
        convertToActionBlock(current);
        if (prevType === "character") {
          convertToActionBlock(current);
        }
      }
    }

    if (
      currentType === "dialogue" &&
      !(prevType === "character" || prevType === "parentheticals")
    ) {
      convertToActionBlock(current);
    }
  }
}
