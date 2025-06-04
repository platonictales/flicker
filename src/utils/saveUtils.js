import { useEffect, useRef } from 'react';
import { invoke } from '@tauri-apps/api/core';

// Debounced auto-save hook
export function useAutoSaveBlocks(blocks, docId) {
  console.log("Hello")
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

// // Explicit save to file (can be used for Save As, etc)
// export function saveBlocksToFile(blocks, filename, docId) {
//   return invoke('save_blocks_to_file', { blocks, filename, doc_id: docId });
// }
