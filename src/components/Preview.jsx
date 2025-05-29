import React from "react";

export function PreviewButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        paddingRight: "550px",
        marginLeft: 'auto',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
      }}
      title="Preview/Export PDF"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>
  );
}
