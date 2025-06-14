import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Debounced auto-save hook
export function useAutoSaveBlocks(blocks, docId) {
  const timeout = useRef();
  useEffect(() => {
    if (!!Array.isArray(blocks) || !docId) return;
    clearTimeout(timeout.current);
    timeout.current = setTimeout(async () => {
      await invoke('auto_save_blocks', { blocks, docId });
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

export const renderBlockDiv = (block) => {
  const id = block.id || `block_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
  return `<div data-name="${block.type || "action"}" class="${block.type || "action"}" data-id="${id}">${block.text
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\n/g, "<br>")}</div>`;
};

export async function fetchBlocksFromFile(docId) {
  const jsonString = await invoke('read_blocks_file', { docId });
  return JSON.parse(jsonString); // Should be an array of blocks
}