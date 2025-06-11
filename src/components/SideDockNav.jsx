import React from "react";
import { DockRightButton } from "./dockRight";

function SideDockNav({
  focusMode,
  dockActive,
  sluglines,
  enableSideDock,
  scrollToAndFocusBlock,
  contentRef,
}) {
  return (
    <div>
      {!focusMode && (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", background: " #f5f5f5" }}>
          <DockRightButton onClick={enableSideDock} />
        </div>
      )}
      {dockActive && (
        <nav className="sidenav">
          <ul>
            {sluglines.map((block, idx) => (
              <li
                key={idx}
                style={{ cursor: "pointer" }}
                onClick={() => scrollToAndFocusBlock(contentRef.current, block.id)}
              >
                {block.text}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </div>
  );
}

export default SideDockNav;