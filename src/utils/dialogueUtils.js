import { getParentElementNode } from "./slugLineUtils";
import { generateBlockId } from "../utils/generateBlockIdUtil";

export function createDialogueDivAndFocus(target, selection) {
  const newDiv = document.createElement("div");
  newDiv.textContent = '\u200B';
  newDiv.setAttribute("data-name", "dialogue");
  newDiv.setAttribute("data-id", generateBlockId());
  newDiv.className = "dialogue";

  newDiv.style.paddingLeft = "1in";
  newDiv.style.paddingRight = "1.5in";

  if (selection.rangeCount > 0) {
    const range = selection.getRangeAt(0);
    let currentNode = range.startContainer;
    while (currentNode && currentNode.nodeType !== 1) currentNode = currentNode.parentNode;
    if (currentNode && currentNode.parentNode === target) {
      if (currentNode.nextSibling) {
        target.insertBefore(newDiv, currentNode.nextSibling);
      } else {
        target.appendChild(newDiv);
      }
    } else {
      target.appendChild(newDiv);
    }
  } else {
    target.appendChild(newDiv);
  }

  const newRange = document.createRange();
  newRange.selectNodeContents(newDiv);
  newRange.collapse(false);
  selection.removeAllRanges();
  selection.addRange(newRange);
}

export function createActionNode(target, selection) {
  const newDiv = document.createElement("div");
  newDiv.textContent = '\u200B';
  newDiv.setAttribute("data-name", "action");
  newDiv.setAttribute("data-id", generateBlockId());
  newDiv.className = "action";
  newDiv.style.paddingLeft = "0";
  newDiv.style.paddingRight = "0";
  newDiv.style.marginBottom = "1";
  target.appendChild(newDiv);
  const newRange = document.createRange();
  newRange.selectNodeContents(newDiv);
  newRange.collapse(false);
  selection.removeAllRanges();
  selection.addRange(newRange);
}

export function characterAnticipateDialogue(currentNode, target, selection) {
  let targetDiv = null;
  if (currentNode.nodeType === Node.TEXT_NODE && currentNode.parentNode && currentNode.parentNode.nodeName === 'DIV') {
    targetDiv = currentNode.parentNode;
  } else if (currentNode.nodeName === 'DIV') {
    targetDiv = currentNode;
  }
  if (targetDiv) {
    targetDiv.setAttribute("data-name", "character");
    targetDiv.setAttribute("data-id", generateBlockId());
    targetDiv.className = "character";
    targetDiv.style.paddingLeft = "2.2in";
    targetDiv.style.paddingRight = "0.5in";
    targetDiv.style.marginBottom = "0";
  }
  createDialogueDivAndFocus(target, selection);
}

export function transitionAnticipateAction(currentNode, target, selection) {
  let targetDiv = null;
  if (currentNode.nodeType === Node.TEXT_NODE && currentNode.parentNode && currentNode.parentNode.nodeName === 'DIV') {
    targetDiv = currentNode.parentNode;
  } else if (currentNode.nodeName === 'DIV') {
    targetDiv = currentNode;
  }
  if (targetDiv) {
    targetDiv.setAttribute("data-name", "transition");
    targetDiv.setAttribute("data-id", generateBlockId());
    targetDiv.className = "transition";
    targetDiv.style.paddingRight = "0in";
    targetDiv.style.marginBottom = "1";
    targetDiv.style.textAlign = "right";
  }
  createActionNode(target, selection);
}

export function createParentheticals() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  let currentNode = range.startContainer;
  currentNode = getParentElementNode(currentNode);
  const name = currentNode.getAttribute("data-name");
  if (name === "dialogue") {
    transformIntoParentheticalNode(currentNode);
  }
}

export function transformIntoParentheticalNode(currentNode) {
  let el = getParentElementNode(currentNode);
  if (el) {
    el.setAttribute("data-name", "parentheticals");
    el.setAttribute("data-id", generateBlockId());
    el.className = "parentheticals";
    el.style.textTransform = "none";
    el.style.fontWeight = "normal";
    el.style.paddingLeft = "1.6in";
    el.style.paddingRight = "2in";
    el.style.margin = "0";
  }
}

export function autoInsertParentheses(e) {
  e.preventDefault();
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const node = range.startContainer;
  const offset = range.startOffset;
  if (node.nodeType === Node.TEXT_NODE) {
    const text = node.textContent;
    node.textContent = text.slice(0, offset) + "()" + text.slice(offset);
    range.setStart(node, offset + 1);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  } else {
    const textNode = document.createTextNode("()\u200B");
    node.insertBefore(textNode, node.childNodes[offset] || null);
    range.setStart(textNode, 1);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
  }
}

// Utility to handle parenthetical trigger after auto-inserting parentheses
export function handleParentheticalTrigger() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  const currentNode = range.startContainer;
  const text = currentNode.textContent || "";
  if (text.length === 2 || text.startsWith("(")) {
    createParentheticals();
    return true;
  }
  return false;
}
