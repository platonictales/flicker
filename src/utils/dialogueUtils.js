export function createDialogueDivAndFocus(target, selection) {
  const newDiv = document.createElement("div");
  newDiv.textContent = '\u200B';
  newDiv.setAttribute("data-name", "dialogue");
  newDiv.style.paddingLeft = "1in";
  newDiv.style.paddingRight = "1.5in";
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
    targetDiv.style.paddingLeft = "2.2in";
    targetDiv.style.paddingRight = "0.5in";
    targetDiv.style.marginBottom = "0";
  }
  createDialogueDivAndFocus(target, selection);
}
