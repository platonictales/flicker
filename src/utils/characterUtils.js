import { getParentElementNode, transformIntoActionNode } from "./slugLineUtils";

export function handleCorruptedCharacter() {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;
  const range = selection.getRangeAt(0);
  let currentNode = range.startContainer;
  currentNode = getParentElementNode(currentNode);
  const name = currentNode.getAttribute("data-name");
  if (name === "character") {
    transformIntoActionNode(currentNode);
  }
}
