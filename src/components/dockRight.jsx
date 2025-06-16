import React from "react";

export function DockRightButton({ onClick, title = "Dock Right" }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        padding: 0,
        opacity: 0.5
      }}
      title={title}
      aria-label={title}
    >
      {/* Inline SVG for Dock Right */}
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="none" stroke="#888" stroke-width="2">
        <rect x="3" y="3" width="6" height="18" fill="#888" />
        <rect x="9" y="3" width="12" height="18" fill="none" stroke="#888" stroke-width="2" />
      </svg>
    </button>
  );
}