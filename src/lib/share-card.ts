/**
 * Generate a shareable protocol summary card as an image
 * Uses HTML Canvas to render a branded card for Instagram stories and social sharing
 */

interface ShareCardData {
  name: string;
  compoundCount: number;
  longevityScore: number;
  topCompounds: string[];
  dailyCost: number;
}

/**
 * Generate a shareable protocol summary card as a PNG blob
 * Card dimensions: 900x1600px (Instagram story format)
 */
export async function generateShareCard(protocol: ShareCardData): Promise<Blob> {
  return new Promise((resolve, reject) => {
    try {
      // Create canvas for IG story dimensions
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Could not get canvas context');
      }

      // Instagram story dimensions: 1080x1920, we'll use 900x1600 for better fit
      canvas.width = 900;
      canvas.height = 1600;

      // Draw dark gradient background
      const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
      gradient.addColorStop(0, '#1a1a1a');
      gradient.addColorStop(0.5, '#2d3436');
      gradient.addColorStop(1, '#0f0f0f');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Accent gradient for highlight elements
      const accentGradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
      accentGradient.addColorStop(0, '#00d4ff');
      accentGradient.addColorStop(1, '#00a8cc');

      // Header background with accent
      ctx.fillStyle = accentGradient;
      ctx.fillRect(0, 0, canvas.width, 120);

      // Header text: "LONGEVITY NAVIGATOR"
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('LONGEVITY', canvas.width / 2, 40);
      ctx.fillText('NAVIGATOR', canvas.width / 2, 85);

      // Protocol name section
      let yPos = 160;
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
      ctx.textAlign = 'center';

      // Wrap protocol name if too long
      const protocolName = protocol.name;
      if (protocolName.length > 25) {
        const words = protocolName.split(' ');
        let line = '';
        const lines: string[] = [];

        for (const word of words) {
          const testLine = line + (line ? ' ' : '') + word;
          if (testLine.length > 20) {
            if (line) lines.push(line);
            line = word;
          } else {
            line = testLine;
          }
        }
        if (line) lines.push(line);

        const lineHeight = 60;
        const startY = yPos - ((lines.length - 1) * lineHeight) / 2;

        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], canvas.width / 2, startY + i * lineHeight);
        }
        yPos = startY + lines.length * lineHeight + 30;
      } else {
        ctx.fillText(protocolName, canvas.width / 2, yPos);
        yPos += 80;
      }

      // Longevity Score - large prominent display
      yPos += 20;
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
      ctx.fillText('Longevity Score', canvas.width / 2, yPos);
      yPos += 50;

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 80px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
      ctx.fillText(protocol.longevityScore.toFixed(1), canvas.width / 2, yPos);
      yPos += 100;

      // Protocol stats boxes
      const boxWidth = 250;
      const boxHeight = 120;
      const boxSpacing = 60;
      const totalBoxWidth = boxWidth * 2 + boxSpacing;
      const startX = (canvas.width - totalBoxWidth) / 2;

      // Box 1: Compounds
      drawStatBox(ctx, startX, yPos, boxWidth, boxHeight, 'Compounds', protocol.compoundCount.toString(), '#00d4ff');

      // Box 2: Daily Cost
      drawStatBox(ctx, startX + boxWidth + boxSpacing, yPos, boxWidth, boxHeight, 'Daily Cost', `$${protocol.dailyCost.toFixed(2)}`, '#00d4ff');

      yPos += boxHeight + 50;

      // Top Compounds section
      yPos += 20;
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 28px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Top Compounds', canvas.width / 2, yPos);
      yPos += 50;

      ctx.fillStyle = '#ffffff';
      ctx.font = '20px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
      ctx.textAlign = 'center';

      // Show up to 5 top compounds
      const topCompoundsToShow = protocol.topCompounds.slice(0, 5);
      for (const compound of topCompoundsToShow) {
        ctx.fillText(`• ${compound}`, canvas.width / 2, yPos);
        yPos += 40;
      }

      // Footer with website
      yPos = canvas.height - 100;
      ctx.fillStyle = '#00d4ff';
      ctx.font = 'bold 26px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('longevitynavigator.com', canvas.width / 2, yPos);

      // Bottom accent line
      ctx.fillStyle = '#00d4ff';
      ctx.fillRect(0, canvas.height - 20, canvas.width, 20);

      // Convert canvas to blob and resolve
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to generate canvas blob'));
          }
        },
        'image/png',
        0.95
      );
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Helper function to draw a stat box on the canvas
 */
function drawStatBox(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  value: string,
  accentColor: string
) {
  // Draw box background with subtle border
  ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
  ctx.strokeStyle = accentColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 15);
  ctx.fill();
  ctx.stroke();

  // Draw label
  ctx.fillStyle = accentColor;
  ctx.font = 'bold 16px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + width / 2, y + 30);

  // Draw value
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif';
  ctx.fillText(value, x + width / 2, y + 70);
}

/**
 * Download the share card as a PNG file
 */
export async function downloadShareCard(protocol: ShareCardData): Promise<void> {
  try {
    const blob = await generateShareCard(protocol);

    // Create download link
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${protocol.name.replace(/\s+/g, '_')}_longevity_card.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error('Error downloading share card:', e);
    throw e;
  }
}

/**
 * Share the protocol card directly (if using Share API)
 */
export async function shareProtocolCard(protocol: ShareCardData): Promise<void> {
  try {
    // Check if browser supports Share API
    if (!navigator.share) {
      console.warn('Share API not supported, downloading instead');
      await downloadShareCard(protocol);
      return;
    }

    const blob = await generateShareCard(protocol);
    const file = new File(
      [blob],
      `${protocol.name.replace(/\s+/g, '_')}_longevity_card.png`,
      { type: 'image/png' }
    );

    // Use Share API if available
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: 'My Longevity Protocol',
        text: `Check out my ${protocol.name} protocol from Longevity Navigator!`,
        files: [file],
      });
    } else {
      // Fallback to download
      await downloadShareCard(protocol);
    }
  } catch (e) {
    if (e instanceof Error && e.message === 'AbortError') {
      // User cancelled share
      console.log('Share cancelled');
    } else {
      console.error('Error sharing card:', e);
      throw e;
    }
  }
}
