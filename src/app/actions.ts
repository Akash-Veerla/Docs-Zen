'use server';

import { detectDocumentConflicts } from '@/ai/flows/ai-detect-document-conflicts';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import PptxGenJS from 'pptxgenjs';

export type Report = {
  id: string;
  date: string;
  files: number;
  conflicts: number;
  status: 'Completed' | 'Failed';
  reportContent: string;
};

type State = {
  report: Report | null;
  error: string | null;
  key: number;
};

// In-memory store for reports. In a real app, you'd use a database.
const reportsStore: Report[] = [];

function countConflicts(reportContent: string): number {
  const conflictKeywords = ['conflict', 'contradiction', 'ambiguity', 'discrepancy', 'overlap'];
  const content = reportContent.toLowerCase();
  let count = 0;
  
  // A simple way to count is to check for occurrences of keywords.
  // This could be improved with more sophisticated NLP.
  const matches = content.match(/conflict|contradiction|ambiguity|discrepancy|overlap/gi);
  return matches ? matches.length : 0;
}

async function extractText(file: File): Promise<string | null> {
  const arrayBuffer = await file.arrayBuffer();
  if (file.type === 'application/pdf') {
    const data = await pdfParse(Buffer.from(arrayBuffer));
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
  if (file.type.startsWith('text/') || file.type === 'text/markdown') {
    return file.text();
  }
  return null;
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
      const newReport: Report = {
        id: `REP-${String(reportsStore.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        files: validDocuments.length,
        status: 'Completed',
        reportContent: result.report,
        conflicts: countConflicts(result.report),
      };
      reportsStore.unshift(newReport); // Add to the beginning of the array
      return { report: newReport, error: null, key };
    } else {
       const errorReport: Report = {
        id: `REP-${String(reportsStore.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        files: validDocuments.length,
        conflicts: 0,
        status: 'Failed',
        reportContent: 'The AI model did not return a report. Please try again.',
      };
      reportsStore.unshift(errorReport);
      return {
        report: null,
        error: 'The AI model did not return a report. Please try again.',
        key,
      };
    }
  } catch (e: any) {
    console.error(e);
     const errorReport: Report = {
        id: `REP-${String(reportsStore.length + 1).padStart(3, '0')}`,
        date: new Date().toISOString().split('T')[0],
        files: documents.length,
        conflicts: 0,
        status: 'Failed',
        reportContent: `Failed to process documents. Error: ${e.message}`,
      };
      reportsStore.unshift(errorReport);
    return {
      report: null,
      error:
        `Failed to process documents. Error: ${e.message}`,
      key,
    };
  }
}

export async function getReports(): Promise<Report[]> {
  // In a real app, you'd fetch from a database.
  // Here we just return the in-memory array.
  return Promise.resolve(reportsStore);
}

export async function getReport(id: string): Promise<Report | undefined> {
  return Promise.resolve(reportsStore.find(r => r.id === id));
}

export async function updateProfile(data: { name: string; email: string }) {
  console.log('Updating profile with:', data);
  // In a real app, save this to your user database
  return { success: true, message: 'Profile updated successfully!' };
}

export async function updateNotificationSettings(data: {
  communication: boolean;
  marketing: boolean;
  security: boolean;
}) {
  console.log('Updating notification settings with:', data);
  // In a real app, save this to your user database
  return { success: true, message: 'Notification settings updated!' };
}
