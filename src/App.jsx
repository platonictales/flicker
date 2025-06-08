import "./App.css";
import WritingCanvas from "./components/WritingCanvas";
import OpeningScreen from "./components/OpeningScreen";
import React, { useState, useEffect } from "react";
import { invoke } from '@tauri-apps/api/core';

function App() {
  const [showCanvas, setShowCanvas] = useState(false);
  const [docId, setDocId] = useState(null);

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
        const fileName = filePath.split(/[\\/]/).pop();

        setDocId(filePath);
        // If you want to load blocks, add setLoadedBlocks(JSON.parse(content));
        setShowCanvas(true);
      } else {
        alert("No file selected.");
      }
    } catch (error) {
      alert("Failed to open file: " + error);
    }
  };

  return (
    <main className={`container${showCanvas ? '' : ' container--no-padding'}`}>
      {showCanvas ? (
        docId && <WritingCanvas docId={docId} />
      ) : (
        <OpeningScreen onNew={handleNew} onOpen={handleOpen} />
      )}
    </main>
  );
}

export default App;
