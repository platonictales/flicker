import React from "react";

function SluglineSuggestions({
  show,
  suggestions,
  suggestionIndex,
  suggestionPos,
  onSelect,
}) {
  if (!show || suggestions.length === 0) return null;

  return (
    <ul
      className="slugline-suggestions"
      style={{
        position: "absolute",
        left: suggestionPos.left,
        top: suggestionPos.top,
        zIndex: 2000,
        background: "#fff",
        border: "1px solid #ccc",
        margin: 0,
        padding: 0,
        listStyle: "none",
        width: "200px",
        maxHeight: "100px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
      }}
    >
      {suggestions.map((suggestion, idx) => (
        <li
          key={suggestion + "-" + idx}
          className={idx === suggestionIndex ? "active" : ""}
          style={{
            background: idx === suggestionIndex ? "#eee" : "#fff",
            cursor: "pointer",
          }}
          onMouseDown={() => onSelect(suggestion)}
        >
          {suggestion}
        </li>
      ))}
    </ul>
  );
}

export default SluglineSuggestions;