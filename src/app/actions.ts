'use server';

import { detectDocumentConflicts } from '@/ai/flows/ai-detect-document-conflicts';
import mammoth from 'mammoth';
import pdf from 'pdf-parse/lib/pdf-parse.js';
import PptxGenJS from 'pptxgenjs';

type State = {
  report: string | null;
  error: string | null;
  key: number;
};

async function extractText(file: File): Promise<string | null> {
  const arrayBuffer = await file.arrayBuffer();
  if (file.type === 'application/pdf') {
    const data = await pdf(Buffer.from(arrayBuffer));
    return data.text;
  }
  if (
    file.type ===
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ) {
    const { value } = await mammoth.extractRawText({
      arrayBuffer,
    });
    return value;
  }
  if (
    file.type ===
    'application/vnd.openxmlformats-officedocument.presentationml.presentation'
  ) {
    const pptx = new PptxGenJS();
    const data = await pptx.load(arrayBuffer as ArrayBuffer);
    return data.slides
      .map((slide) =>
        slide.spres.map((shape) => shape.data.map((item) => item.text).join(' ')).join(' ')
      )
      .join(' ');
  }
  return file.text();
}

export async function analyzeDocuments(
  prevState: State,
  formData: FormData
): Promise<State> {
  const key = prevState.key + 1;
  const documents = formData.getAll('documents') as File[];

  if (documents.length === 0) {
    return { report: null, error: 'Please upload at least one document.', key };
  }
  
  if (documents.length < 2) {
    return {
      report: null,
      error: 'Please upload at least two documents to compare.',
      key,
    };
  }

  try {
    const documentContents = await Promise.all(
      documents.map(async (doc) => {
        if (doc.size === 0) return null;
        return {
          filename: doc.name,
          content: await extractText(doc),
        };
      })
    );
    
    const validDocuments = documentContents.filter(doc => doc && doc.content && doc.content.trim() !== '');

    if (validDocuments.length < 2) {
      return { report: null, error: "At least two documents must have content to be analyzed.", key };
    }

    const result = await detectDocumentConflicts({ documents: validDocuments as any });

    if (result && result.report) {
      return { report: result.report, error: null, key };
    } else {
      return {
        report: null,
        error: 'The AI model did not return a report. Please try again.',
        key,
      };
    }
  } catch (e: any) {
    console.error(e);
    return {
      report: null,
      error:
        `Failed to process documents. Error: ${e.message}`,
      key,
    };
  }
}
