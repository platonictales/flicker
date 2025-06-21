import React from "react";

function OpeningScreen({ onNew, onOpen }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#f5f5f5",
    }}>
      <h1 style={{ marginBottom: "20px", fontFamily: "Courier Prime, monospace" }}>Welcome to Flicker</h1>
      <div>
        <button
          onClick={onNew}
          style={{
            padding: "10px 20px",
            margin: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          New
        </button>
        <button
          onClick={() => onOpen()}
          style={{
            padding: "10px 20px",
            margin: "10px",
            fontSize: "16px",
            cursor: "pointer",
          }}
        >
          Open
        </button>
      </div>
    </div>
  );
}

export default OpeningScreen;
