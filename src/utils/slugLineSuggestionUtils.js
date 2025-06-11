import { ensureSluglineClass } from "./slugLineUtils";

export function handleSluglineSuggestionNavigation(
  e,
  showSuggestions,
  sluglineSuggestions,
  suggestionIndex,
  setSuggestionIndex,
  insertSuggestion
) {
  if (showSuggestions && sluglineSuggestions.length > 0) {
    if (e.key === "Tab") {
      e.preventDefault();
      setSuggestionIndex((prev) => (prev + 1) % sluglineSuggestions.length);
      return true;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (sluglineSuggestions[suggestionIndex]) {
        insertSuggestion(sluglineSuggestions[suggestionIndex]);
      }
      return true;
    }
  }
  return false;
}

export function insertSuggestionUtil(suggestion, setShowSuggestions) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  let currentNode = range.startContainer;
  while (currentNode && currentNode.nodeType !== 1) currentNode = currentNode.parentNode;
  if (currentNode) {
    currentNode.innerText = suggestion;
    setShowSuggestions(false);
    
    // Move caret to end
    const newRange = document.createRange();
    newRange.selectNodeContents(currentNode);
    newRange.collapse(false);
    selection.removeAllRanges();
    selection.addRange(newRange);
  }
}

export function handleSluglineSuggestions({
  textUpper,
  blocks,
  setSluglineSuggestions,
  setShowSuggestions,
  setSuggestionIndex,
  setSuggestionPos,
  contentRef,
}) {
  if (textUpper.length > 0) {
    const matches = blocks
      .filter(b => b.type === "slug-line")
      .map(b => b.text)
      .filter(txt => txt.toUpperCase().includes(textUpper) && txt.length > 0);
    setSluglineSuggestions(matches.slice(0, 3));
    setShowSuggestions(matches.length > 0);
    setSuggestionIndex(0);

    // Position suggestion box under caret
    const sel = window.getSelection();
    if (sel.rangeCount && contentRef.current) {
      const caretRange = sel.getRangeAt(0).cloneRange();
      caretRange.collapse(false);
      const rect = caretRange.getBoundingClientRect();
      const editorRect = contentRef.current.getBoundingClientRect();
      setSuggestionPos({
        left: rect.left - editorRect.left,
        top: rect.bottom - editorRect.top,
      });
    }
  } else {
    setShowSuggestions(false);
  }
}