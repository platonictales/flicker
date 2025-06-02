import "./App.css";
import WritingCanvas from "./components/WritingCanvas";
import OpeningScreen from "./components/OpeningScreen";
import React, { useState } from "react";

function App() {
  const [showCanvas, setShowCanvas] = useState(false);

  const handleNew = () => {
    setShowCanvas(true);
  };
  const handleOpen = () => {
    alert("Open functionality is not implemented yet!"); // Placeholder for "Open"
  };
  return (
    <main className="container">
      {showCanvas ? (
        <WritingCanvas />
      ) : (
        <OpeningScreen onNew={handleNew} onOpen={handleOpen} />
      )}
    </main>
  );
}

export default App;
