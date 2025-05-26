function generateScreenplayPDF(blocks) {
    const doc = new jsPDF({ unit: 'in', format: 'letter' });
    let y = 1; 
    blocks.forEach(block => {
      let text = block.text || " ";
      let x = 1.5; 
      let options = {};
      switch (block.type) {
        case 'slug-line':
          doc.setFont('Courier', 'bold');
          doc.setFontSize(12);
          doc.text(text.toUpperCase(), x, y);
          y += 0.4; 
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
          y += 0.18; 
          break;
        case 'parentheticals':
          doc.setFont('Courier', 'normal'); 
          doc.setFontSize(12);
          doc.text(text.replace(/\s+/g, ' ').trim(), 2, y, { maxWidth: 4.5 }); 
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
      if (y > 10) { 
        doc.addPage();
        y = 1;
      }
    });
    doc.save("screenplay.pdf");
  }