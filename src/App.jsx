import "./App.css";
import WritingCanvas from "./components/WritingCanvas";
import OpeningScreen from "./components/OpeningScreen";
import React, { useState, useEffect } from "react";
import { invoke } from '@tauri-apps/api/core';
import { extractDocId } from './utils/fileUtils';

function App() {
  const [showCanvas, setShowCanvas] = useState(false);
  const [docId, setDocId] = useState(null);
  const [loadedBlocks, setLoadedBlocks] = useState(null);

  // Prevent body scroll on openingscreen
  useEffect(() => {
    if (!showCanvas) {
      document.body.classList.add('opening-screen-no-scroll');
    } else {
      document.body.classList.remove('opening-screen-no-scroll');
    }
    return () => {
      document.body.classList.remove('opening-screen-no-scroll');
    };
  }, [showCanvas]);

  const handleNew = async () => {
    try {
      const newDocId = await invoke('generate_unique_doc_id');
      setDocId(newDocId);
      setShowCanvas(true);
    } catch (e) {
      alert('Failed to create new document: ' + e);
    }
  };

  const handleOpen = async () => {
    try {
      const [filePath, content] = await invoke('open_screenplay_file');
      if (filePath && content) {
        const fileName = extractDocId(filePath);
        setDocId(fileName);
        setLoadedBlocks(JSON.parse(content));
        setShowCanvas(true);
      } else {
        alert("No file selected.");
      }
    } catch (error) {
      alert("Failed to open file: " + error);
    }
  };

  let content;
  if (showCanvas && docId) {
    content = <WritingCanvas docId={docId} loadedBlocks={loadedBlocks} />;
  } else {
    content = <OpeningScreen onNew={handleNew} onOpen={handleOpen} />;
  }
  return (
    <main className={`container${showCanvas ? '' : ' container--no-padding'}`}>
      {content}
    </main>
  );
}

export default App;
