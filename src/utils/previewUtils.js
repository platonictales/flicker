import jsPDF from "jspdf";

export function generateScreenplayPDFBlob(blocks) {
  const doc = new jsPDF({ unit: 'in', format: 'letter' });
  let y = 1; // Start 1 inch from the top
  const lineHeight = 0.167; // Approximate line height in inches for 12pt font
  blocks.forEach(block => {
    let text = block.text || " ";
    let x = 1.5; // Default left margin in inches
    let maxWidth = 6.5; // Default max width
    let align = undefined;
    let font = 'normal';
    let fontSize = 12;
    switch (block.type) {
      case 'slug-line':
        font = 'bold';
        maxWidth = 6;
        break;
      case 'action':
        font = 'normal';
        maxWidth = 6;
        break;
      case 'character':
        font = 'bold';
        x = 3.7;
        maxWidth = 1.8;
        break;
      case 'parentheticals':
        font = 'normal';
        x = 3.1;
        maxWidth = 2.4;
        break;
      case 'dialogue':
        font = 'normal';
        x = 2;
        maxWidth = 4.5;
        break;
      case 'transition':
        font = 'normal';
        x = 7.5;
        maxWidth = 6;
        align = 'right';
        break;
      default:
        font = 'normal';
        maxWidth = 6;
        break;
    }
    doc.setFont('Courier', font);
    doc.setFontSize(fontSize);
    // Split text into lines that fit maxWidth
    const lines = doc.splitTextToSize(text, maxWidth);
    lines.forEach(line => {
      if (align === 'center' || align === 'right') {
        doc.text(line, x, y, { align });
      } else {
        doc.text(line, x, y);
      }
      y += lineHeight;
      if (y > 10) { // New page if past bottom margin
        doc.addPage();
        y = 1;
      }
    });
    // Add extra space after block (not after every line)
    if (block.type === 'slug-line' || block.type === 'action' || block.type === 'dialogue' || block.type === 'transition' || block.type === 'default') {
      y += lineHeight;
    } else if (block.type === 'character' || block.type === 'parentheticals') {
      y += 0;
    }
  });
  return doc.output('blob');
}

export { generateScreenplayPDFBlob as generateScreenplayPDF };
