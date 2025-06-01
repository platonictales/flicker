import React, { useEffect, useRef } from "react";

export default function PDFPreviewModal({ pdfBlob, onClose }) {
  const iframeRef = useRef(null);
  useEffect(() => {
    if (iframeRef.current && pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      iframeRef.current.src = url;
      return () => URL.revokeObjectURL(url);
    }
  }, [pdfBlob]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!pdfBlob) return null;
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
      background: 'rgba(0,0,0,0.7)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{ background: '#fff', borderRadius: 8, overflow: 'hidden', width: '80vw', height: '90vh', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }}>Close</button>
        <iframe ref={iframeRef} title="PDF Preview" style={{ width: '100%', height: '100%', border: 'none' }} />
      </div>
    </div>
  );
}
