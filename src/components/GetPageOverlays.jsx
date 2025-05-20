import { PAGE_HEIGHT, TOP_PADDING } from "./constants";

export function getPageOverlays(pageCount) {
  const overlays = [];
  for (let i = 1; i <= pageCount; i++) {
    if (i > 1) {
      overlays.push(
        <div
          className="page-number"
          style={{ top: `${(i - 1) * PAGE_HEIGHT + TOP_PADDING}px` }}
          key={`num-${i}`}
        >
          <span>{i}.</span>
        </div>
      );
      overlays.push(
        <div
          className="page-break"
          style={{ top: `${(i - 1) * PAGE_HEIGHT + TOP_PADDING}px` }}
          key={`break-${i}`}
        />
      );
    }
  }
  return overlays;
}
