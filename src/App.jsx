import "./App.css";
import WritingCanvas from "./components/WritingCanvas";
import OpeningScreen from "./components/OpeningScreen";
import React, { useState, useEffect } from "react";

function App() {
  const [showCanvas, setShowCanvas] = useState(false);

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

  const handleNew = () => {
    setShowCanvas(true);
  };
  const handleOpen = () => {
    alert("Open functionality is not implemented yet!"); // Placeholder for "Open"
  };
  return (
    <main className={`container${showCanvas ? '' : ' container--no-padding'}`}>
      {showCanvas ? (
        <WritingCanvas />
      ) : (
        <OpeningScreen onNew={handleNew} onOpen={handleOpen} />
      )}
    </main>
  );
}

export default App;
