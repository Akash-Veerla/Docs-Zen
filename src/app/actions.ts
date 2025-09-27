'use server';

import { detectDocumentConflicts } from '@/ai/flows/ai-detect-document-conflicts';

type State = {
  report: string | null;
  error: string | null;
  key: number;
};

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

  // As we can't easily parse PDF/DOCX content on server without extra libs,
  // we'll simulate by reading file content as text.
  // In a real app, you would use libraries like pdf-parse, mammoth.js
  try {
    const documentContents = await Promise.all(
      documents.map(async (doc) => {
        if (doc.size === 0) return null;
        return {
          filename: doc.name,
          content: await doc.text(),
        };
      })
    );
    
    const validDocuments = documentContents.filter(doc => doc && doc.content.trim() !== '');

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
        'Failed to process documents. Please ensure they are valid text-based files (e.g., .txt, .md). PDF and Word documents are not fully supported in this demo.',
      key,
    };
  }
}
