import fs from "fs/promises";

export async function loadPdfAsText(path: string) {
  const rawBuffer = await fs.readFile(path);

  const data = rawBuffer.buffer.slice(
    rawBuffer.byteOffset,
    rawBuffer.byteOffset + rawBuffer.byteLength
  );

  // only load when needed (otherwise this can cause node canvas setup issues when you don't need PDFs):
  const PdfJs = await import("pdfjs-dist/legacy/build/pdf");

  const pdf = await PdfJs.getDocument({
    data,
    useSystemFonts: true, // https://github.com/mozilla/pdf.js/issues/4244#issuecomment-1479534301
  }).promise;

  const pageTexts: string[] = [];
  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const pageContent = await page.getTextContent();

    pageTexts.push(
      pageContent.items
        // limit to TextItem, extract str:
        .filter((item) => (item as any).str != null)
        .map((item) => (item as any).str as string)
        .join(" ")
    );
  }

  // reduce whitespace to single space
  return pageTexts.join("\n").replace(/\s+/g, " ");
}
