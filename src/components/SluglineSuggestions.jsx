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