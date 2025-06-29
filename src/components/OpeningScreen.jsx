import React from "react";

function OpeningScreen({ onNew, onOpen }) {
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      height: "100vh",
      backgroundColor: "#000",
    }}>
      <h1
        style={{
          marginBottom: "30px",
          fontFamily: "Courier Prime, monospace",
          color: "#FFD700",
          fontWeight: "bold",
          letterSpacing: "2px",
          fontSize: "3rem",
          display: "flex",
          alignItems: "center",
          gap: "12px"
        }}
      >
        Welcome to MacGuffin
      </h1>
      <div>
        <button
          onClick={onNew}
          className="opening-btn"
        >
          New
        </button>
        <button
          onClick={() => onOpen()}
          className="opening-btn"
        >
          Open
        </button>
      </div>
      <style>{`
        .opening-btn {
          color: #FFD700;
          background: transparent;
          border: 1px solid #ff9900;
          padding: 10px 20px;
          margin: 10px;
          font-size: 16px;
          cursor: pointer;
          font-family: inherit;
          font-weight: bold;
          border-radius: 4px;
          transition: background 0.2s, color 0.2s;
        }
        .opening-btn:hover, .opening-btn:focus {
          background: #ff9900;
          color: #fff;
          outline: none;
        }
      `}</style>
    </div>
  );
}

export default OpeningScreen;