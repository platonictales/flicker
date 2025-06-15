export const isPrintableKey = (e) =>
  e.key.length === 1 &&
  !e.ctrlKey &&
  !e.metaKey &&
  !e.altKey &&
  !e.shiftKey;