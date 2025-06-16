export function ThemeButton({ onClick, title = "Toggle Theme" }) {
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
      }}
      title={title}
      aria-label={title}
    >
      {/* You can also import the SVG as a ReactComponent if using SVGR */}
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="none" stroke="#888" strokeWidth="40"  strokeLinecap="round" strokeLinejoin="round">
        <path d="M480-80 120-436l200-244h320l200 244L480-80ZM183-680l-85-85 57-56 85 85-57 56Zm257-80v-120h80v120h-80Zm335 80-57-57 85-85 57 57-85 85ZM480-192l210-208H270l210 208ZM358-600l-99 120h442l-99-120H358Z"/>
      </svg>
    </button>
  );
}