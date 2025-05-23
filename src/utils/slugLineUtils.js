export function getParentElementNode(currentNode) {
  if (currentNode.nodeType === Node.ELEMENT_NODE) {
    return currentNode;
  } else if (currentNode.parentNode && currentNode.parentNode.nodeType === Node.ELEMENT_NODE) {
    return currentNode.parentNode;
  }
  return null;
}

export function removeInlineTextStyles(currentNode) {
  let el = getParentElementNode(currentNode);
  if (el) {
    el.setAttribute("data-name", "action");
    el.style.textTransform = "none";
    el.style.fontWeight = "normal";
    el.style.paddingLeft = "0";
    el.style.paddingRight = "0";
    el.style.margin = "1"
  }
}

export function replaceWithSluglineDiv(currentNode) {
  const boldNode = document.createElement("div");
  boldNode.setAttribute("data-name", "slug-line");
  boldNode.className = "slugline";
  boldNode.textContent = currentNode.textContent;
  boldNode.style.textTransform = "uppercase";
  if (currentNode.parentNode) {
    if (currentNode.nodeType === Node.TEXT_NODE && currentNode.parentNode.nodeName === 'DIV') {
      currentNode.parentNode.parentNode.replaceChild(boldNode, currentNode.parentNode);
    } else {
      currentNode.parentNode.replaceChild(boldNode, currentNode);
    }
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(boldNode, 1);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    currentNode.textContent = currentNode.textContent.toUpperCase();
  }
}

export function ensureSluglineClass(currentNode) {
  let el = getParentElementNode(currentNode);
  if (el && el.classList) {
    el.classList.remove("normal-text");
    el.classList.add("slugline");
    el.setAttribute("data-name", "slug-line");
    el.style.textTransform = "uppercase";
    el.style.fontWeight = "bold";
  }
}

export function removeSluglineClass(currentNode) {
  let el = getParentElementNode(currentNode);
  if (el && el.classList && el.classList.contains("slugline")) {
    el.setAttribute("data-name", "action");
    el.classList.remove("slugline");
    el.classList.add("normal-text");
  }
}

export function isNodeEmpty(node) {
  return !node.textContent || node.textContent.trim() === "";
}

export function getTextContentUpper(node) {
  return (node.textContent || "").toUpperCase();
}
