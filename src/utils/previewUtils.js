import jsPDF from "jspdf";

export function generateScreenplayPDF(blocks) {
  const doc = new jsPDF({ unit: 'in', format: 'letter' });
  let y = 1; // Start 1 inch from the top
  blocks.forEach(block => {
    let text = block.text || " ";
    let x = 1.5; // Default left margin in inches
    let options = {};
    switch (block.type) {
      case 'slug-line':
        doc.setFont('Courier', 'bold');
        doc.setFontSize(12);
        doc.text(text.toUpperCase(), x, y);
        y += 0.4; // Extra space after slugline
        break;
      case 'action':
        doc.setFont('Courier', 'normal');
        doc.setFontSize(12);
        doc.text(text, x, y, { maxWidth: 6.5 });
        y += 0.4;
        break;
      case 'character':
        doc.setFont('Courier', 'bold');
        doc.setFontSize(12);
        doc.text(text.toUpperCase(), 4.25, y, { align: 'center' });
        y += 0.18; // Small space after character
        break;
      case 'parentheticals':
        doc.setFont('Courier', 'normal'); // Keep normal font
        doc.setFontSize(12);
        doc.text(text.replace(/\s+/g, ' ').trim(), 2, y, { maxWidth: 4.5 }); // match dialogue block width
        y += 0.18;
        break;
      case 'dialogue':
        doc.setFont('Courier', 'normal');
        doc.setFontSize(12);
        doc.text(text, 2, y, { maxWidth: 4.5 });
        y += 0.4;
        break;
      case 'transition':
        doc.setFont('Courier', 'normal');
        doc.setFontSize(12);
        doc.text(text, 6.5, y, { align: 'right' });
        y += 0.4;
        break;
      default:
        doc.setFont('Courier', 'normal');
        doc.setFontSize(12);
        doc.text(text, x, y);
        y += 0.4;
        break;
    }
    if (y > 10) { // New page if past bottom margin
      doc.addPage();
      y = 1;
    }
  });
  doc.save("screenplay.pdf");
}
