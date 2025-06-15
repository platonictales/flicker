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
      next.setAttribute("data-name", "action");
      next.style.paddingLeft = "0";
      next.style.paddingRight = "0";
    }

    // No two dialogue types adjacent
    if (currentType === "dialogue" && nextType === "dialogue") {
      next.setAttribute("data-name", "action");
      next.style.paddingLeft = "0";
      next.style.paddingRight = "0";
    }

    // Parentheticals must be between character and dialogue
    if (
      nextType === "parentheticals" &&
      !(currentType === "character" && blocks[i + 2] && blocks[i + 2].getAttribute("data-name") === "dialogue")
    ) {
      next.setAttribute("data-name", "action");
      next.style.textTransform = "";
      next.style.fontWeight = "";
      next.style.paddingLeft = "0";
      next.style.paddingRight = "0";
      next.style.margin = "";
    }

    if (
      currentType === "dialogue" &&
      prevType !== "character"
    ) {
      current.setAttribute("data-name", "action");
      current.style.textTransform = "none";
      current.style.fontWeight = "normal";
      current.style.paddingLeft = "0";
      current.style.paddingRight = "0";
      current.style.margin = "";
    }
  }
}