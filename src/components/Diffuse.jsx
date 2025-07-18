export function DiffuseButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
      }}
      title="Diffuse"
    >
      <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="none" stroke="#888" strokeWidth="40"  strokeLinecap="round" strokeLinejoin="round">
        <path d="m400-80-20-360-127-73-14 52 81 141-69 40-99-170 48-172 230-132-110-110 56-56 184 183-144 83 48 42 328-268 48 56-340 344-20 400h-80ZM200-680q-33 0-56.5-23.5T120-760q0-33 23.5-56.5T200-840q33 0 56.5 23.5T280-760q0 33-23.5 56.5T200-680Z"/>
      </svg>
    </button>
  );
}
