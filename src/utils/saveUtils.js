import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Debounced auto-save hook
export function useAutoSaveBlocks(blocks, docId) {
  const timeout = useRef();
  useEffect(() => {
    if (!blocks || !docId) return;
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      invoke('auto_save_blocks', { blocks, docId });
    }, 800);
    return () => clearTimeout(timeout.current);
  }, [blocks, docId]);
}

export function extractDocId(filePath) {
  return filePath
    .split(/[\\/]/)
    .pop()
    .replace(/^autosave_/, "")
    .replace(/\.json$/, "");
}

export const renderBlockDiv = (block) =>
  `<div data-name="${block.type || "action"}" class="${block.type || "action"}">${block.text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>")}</div>`;
