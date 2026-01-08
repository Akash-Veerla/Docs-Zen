import mammoth from 'mammoth';
import JSZip from 'jszip';
import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;

export async function extractText(file: File): Promise<string | null> {
  try {
    const arrayBuffer = await file.arrayBuffer();

    // PDF
    if (file.type === 'application/pdf') {
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      let fullText = '';
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        const pageText = textContent.items.map((item: { str: string } & object) => item.str).join(' ');
        fullText += pageText + '\n';
      }
      return fullText;
    }

    // DOCX
    if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const { value } = await mammoth.extractRawText({
        arrayBuffer,
      });
      return value;
    }

    // PPTX
    if (
      file.type ===
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      const zip = new JSZip();
      await zip.loadAsync(arrayBuffer);
      let fullText = '';

      // Find all slide XML files
      const slideFiles = Object.keys(zip.files).filter((fileName) =>
        fileName.match(/ppt\/slides\/slide\d+\.xml/)
      );

      // Sort slides
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)![1]);
        const numB = parseInt(b.match(/slide(\d+)\.xml/)![1]);
        return numA - numB;
      });

      for (const slideFile of slideFiles) {
        const slideXml = await zip.file(slideFile)?.async('string');
        if (slideXml) {
          const textMatches = slideXml.match(/<a:t[^>]*>(.*?)<\/a:t>/g);
          if (textMatches) {
            textMatches.forEach((match) => {
              const text = match.replace(/<\/?a:t[^>]*>/g, '');
              fullText += text + ' ';
            });
            fullText += '\n';
          }
        }
      }
      return fullText;
    }

    // Text / Markdown
    if (file.type.startsWith('text/') || file.name.endsWith('.md')) {
      return await file.text();
    }

  } catch (error) {
    console.error(`Error extracting text from ${file.name}:`, error);
    return null;
  }
  return null;
}
