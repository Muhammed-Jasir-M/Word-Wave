/**
 * Utility to convert an SVG element into a high-density 2x Retina PNG image blob and trigger download.
 */
export async function exportWordCloudPNG(
  svgElement: SVGSVGElement,
  filenamePrefix: string = "wordwave"
): Promise<void> {
  const svgData = new XMLSerializer().serializeToString(svgElement);
  const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(svgBlob);

  const img = new Image();

  return new Promise((resolve, reject) => {
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const scale = 2; // 2x Retina scaling for ultra-sharp text
        canvas.width = 520 * scale;
        canvas.height = 300 * scale;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.scale(scale, scale);
          ctx.fillStyle = "#f8fafc"; // Soft slate background fill
          ctx.fillRect(0, 0, 520, 300);
          ctx.drawImage(img, 0, 0, 520, 300);
        }

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            const shortId = Math.random().toString(36).substring(2, 7);
            const downloadLink = document.createElement("a");
            downloadLink.href = URL.createObjectURL(blob);
            downloadLink.download = `${filenamePrefix}-${shortId}.png`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            resolve();
          } else {
            reject(new Error("Failed to export PNG blob."));
          }
        }, "image/png");
      } catch (err) {
        URL.revokeObjectURL(url);
        reject(err);
      }
    };

    img.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(err);
    };

    img.src = url;
  });
}
