// Utility to filter overlays for the active page
export function filterOverlaysByActivePage(overlays, activePage) {
  return overlays.filter(overlay => {
    if (!overlay || !overlay.key) return false;
    // overlay.key is like 'num-2' or 'break-2'
    const match = overlay.key.match(/-(\d+)$/);
    if (!match) return false;
    const page = parseInt(match[1], 10);
    return page === activePage;
  });
}
