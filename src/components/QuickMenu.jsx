import { useState, useRef, useEffect } from "react";
import { PreviewButton } from "./Preview";
import { FocusButton } from "./Focus";
import { DiffuseButton } from "./Diffuse";
import { ThemeButton } from "./Theme";
import { invoke } from '@tauri-apps/api/core';

function QuickMenu({ docId, fileLocation, onOpen, blocks, onExport, onFocus, isFocusMode, onThemeChange }) {
  const [selectValue, setSelectValue] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef();
  useEffect(() => {
    setSelectValue(""); // Always reset to "" when docId changes
  }, [docId, fileLocation]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSaveAs = async () => {
    if (blocks && blocks.length > 0) {
      const content = blocks;
      try {
        const filePath = await invoke('save_as_file', { content });
        if (onOpen) onOpen(filePath);
        // alert('File saved!');
      } catch (e) {
        // alert('Failed to save file: ' + e);
      }
    } else {
      // alert('No content to save.');
    }
  };

  return (
    <div className="quick-menu">
      <div className="dropdown" ref={menuRef} style={{ display: "inline-block", position: "relative" }}>
        <button onClick={() => setMenuOpen((open) => !open)}>
          {docId || "File"} ▼
        </button>
        {menuOpen && (
          <div className="dropdown-menu" style={{
            position: "absolute",
            top: "100%",
            left: 0,
            background: "#fff",
            border: "1px solid #ccc",
            zIndex: 1000,
            minWidth: "120px"
          }}>
            <button style={{ width: "100%" }} onClick={() => { setMenuOpen(false); onOpen && onOpen(); }}>Open</button>
            <button style={{ width: "100%" }} onClick={() => { setMenuOpen(false); handleSaveAs(); }}>Save As</button>
          </div>
        )}
      </div>
        <div className="quick-menu-icons">

      <PreviewButton onClick={onExport} />
      {isFocusMode ? <FocusButton onClick={onFocus} /> : <DiffuseButton onClick={onFocus} />}
      <ThemeButton onClick={onThemeChange} />
      </div>
    </div>
  );
}

export default QuickMenu;
