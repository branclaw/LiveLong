import { Compound } from '@/types';

// Dynamically import jsPDF to avoid issues if not installed
let jsPDFModule: any = null;

async function getJsPDF() {
  if (!jsPDFModule) {
    try {
      const module = await import('jspdf');
      jsPDFModule = module.jsPDF;
    } catch (e) {
      console.error('jsPDF not installed. Please install it with: npm install jspdf');
      throw new Error('jsPDF library is required for PDF export. Please install it with: npm install jspdf');
    }
  }
  return jsPDFModule;
}

interface ProtocolPDFData {
  name: string;
  compounds: Compound[];
  totalDailyCost: number;
  totalMonthlyCost: number;
  longevityScore: number;
}

/**
 * Export protocol as a downloadable PDF
 * Groups compounds by tier and includes cost/impact information
 */
export async function exportProtocolToPDF(protocol: ProtocolPDFData): Promise<void> {
  try {
    const jsPDF = await getJsPDF();
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 15;
    const contentWidth = pageWidth - 2 * margin;
    let yPosition = margin;

    // Title
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text(protocol.name, margin, yPosition);
    yPosition += 15;

    // Date generated
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(`Generated on: ${dateStr}`, margin, yPosition);
    yPosition += 10;

    // Summary section
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('Protocol Summary', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.text(`Total Compounds: ${protocol.compounds.length}`, margin + 5, yPosition);
    yPosition += 5;
    doc.text(`Daily Cost: $${protocol.totalDailyCost.toFixed(2)}`, margin + 5, yPosition);
    yPosition += 5;
    doc.text(`Monthly Cost: $${protocol.totalMonthlyCost.toFixed(2)}`, margin + 5, yPosition);
    yPosition += 5;
    doc.text(`Longevity Score: ${protocol.longevityScore.toFixed(1)}`, margin + 5, yPosition);
    yPosition += 12;

    // Group compounds by tier
    const tiers = new Map<string, Compound[]>();
    protocol.compounds.forEach(compound => {
      if (!tiers.has(compound.tier)) {
        tiers.set(compound.tier, []);
      }
      tiers.get(compound.tier)!.push(compound);
    });

    // Sort tiers by tierNumber
    const sortedTiers = Array.from(tiers.entries()).sort((a, b) => {
      const aNum = a[1][0]?.tierNumber || 0;
      const bNum = b[1][0]?.tierNumber || 0;
      return aNum - bNum;
    });

    // Render each tier section
    for (const [tierName, compounds] of sortedTiers) {
      // Check if we need a new page
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = margin;
      }

      // Tier header
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text(tierName, margin, yPosition);
      yPosition += 7;

      // Compound table for this tier
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');

      // Table headers
      const colX = [margin + 2, margin + 50, margin + 80, margin + 105, margin + 140];
      doc.setFont(undefined, 'bold');
      doc.text('Compound', colX[0], yPosition);
      doc.text('Category', colX[1], yPosition);
      doc.text('$/Day', colX[2], yPosition);
      doc.text('Impact', colX[3], yPosition);
      doc.text('Efficiency', colX[4], yPosition);
      yPosition += 5;

      // Separator line
      doc.setDrawColor(200);
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      yPosition += 1;

      // Table rows
      doc.setFont(undefined, 'normal');
      for (const compound of compounds) {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
          // Repeat headers on new page
          doc.setFont(undefined, 'bold');
          doc.text('Compound', colX[0], yPosition);
          doc.text('Category', colX[1], yPosition);
          doc.text('$/Day', colX[2], yPosition);
          doc.text('Impact', colX[3], yPosition);
          doc.text('Efficiency', colX[4], yPosition);
          yPosition += 5;
          doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
          yPosition += 1;
          doc.setFont(undefined, 'normal');
        }

        const cellHeight = 4;
        // Wrap long compound names
        const compoundName = compound.name.length > 18 ? compound.name.substring(0, 15) + '...' : compound.name;
        const category = compound.category.length > 12 ? compound.category.substring(0, 10) + '...' : compound.category;

        doc.text(compoundName, colX[0], yPosition);
        doc.text(category, colX[1], yPosition);
        doc.text(`$${compound.pricePerDay.toFixed(2)}`, colX[2], yPosition);
        doc.text(compound.longevityImpact.toFixed(1), colX[3], yPosition);
        doc.text(compound.efficiencyScore.toFixed(2), colX[4], yPosition);
        yPosition += cellHeight + 1;
      }

      yPosition += 5;
    }

    // Amazon links section
    if (yPosition > pageHeight - 30) {
      doc.addPage();
      yPosition = margin;
    }

    doc.setFontSize(11);
    doc.setFont(undefined, 'bold');
    doc.text('Purchase Links', margin, yPosition);
    yPosition += 7;

    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    for (const compound of protocol.compounds) {
      if (yPosition > pageHeight - 15) {
        doc.addPage();
        yPosition = margin;
      }

      const linkText = `${compound.name}: ${compound.amazonLink}`;
      const maxWidth = contentWidth - 5;
      const wrappedText = doc.splitTextToSize(linkText, maxWidth);

      for (const line of wrappedText) {
        doc.text(line, margin + 5, yPosition);
        yPosition += 4;
      }
      yPosition += 2;
    }

    // Footer
    doc.setFontSize(8);
    doc.setFont(undefined, 'italic');
    doc.setTextColor(150);
    const footerY = pageHeight - 10;
    const pageCount = doc.internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.text('Generated by Longevity Navigator', margin, footerY);
      doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin - 30, footerY);
    }

    // Trigger download
    doc.save(`${protocol.name.replace(/\s+/g, '_')}_protocol.pdf`);
  } catch (e) {
    console.error('Error generating PDF:', e);
    throw e;
  }
}
