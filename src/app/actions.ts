'use server';

import { detectDocumentConflicts } from '@/ai/flows/ai-detect-document-conflicts';
import mammoth from 'mammoth';
import pdfParse from 'pdf-parse/lib/pdf-parse.js';
import JSZip from 'jszip';

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
  
  // A simple way to count is to check for occurrences of keywords.
  // This could be improved with more sophisticated NLP.
  const matches = content.match(/conflict|contradiction|ambiguity|discrepancy|overlap/gi);
  return matches ? matches.length : 0;
}

async function extractText(file: File): Promise<string | null> {
  try {
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
      const zip = new JSZip();
      await zip.loadAsync(arrayBuffer);
      let fullText = '';

      // Find all slide XML files
      const slideFiles = Object.keys(zip.files).filter((fileName) =>
        fileName.match(/ppt\/slides\/slide\d+\.xml/)
      );

      // Sort slides to maintain order (though numbers might not strictly correspond to presentation order, it's a good approximation)
      slideFiles.sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)\.xml/)![1]);
        const numB = parseInt(b.match(/slide(\d+)\.xml/)![1]);
        return numA - numB;
      });

      for (const slideFile of slideFiles) {
        const slideXml = await zip.file(slideFile)?.async('string');
        if (slideXml) {
          // Extract text from XML using regex.
          // Text in PPTX is usually in <a:t> tags.
          const textMatches = slideXml.match(/<a:t[^>]*>(.*?)<\/a:t>/g);
          if (textMatches) {
            textMatches.forEach((match) => {
              // Remove tags to get pure text
              const text = match.replace(/<\/?a:t[^>]*>/g, '');
              fullText += text + ' ';
            });
            fullText += '\n'; // Add newline between slides
          }
        }
      }
      return fullText;
    }
    if (file.type.startsWith('text/') || file.type === 'text/markdown') {
      return file.text();
    }
  } catch (error) {
    console.error(`Error extracting text from ${file.name}:`, error);
    return null; // Return null if text extraction fails
  }
  return null;
}

export async function analyzeDocuments(
  prevState: State,
  formData: FormData
): Promise<State> {
  const key = prevState.key + 1;
  const uploadedFiles = formData.getAll('documents') as File[];
  
  const documents = uploadedFiles.filter(file => file.size > 0);

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
        return {
          filename: doc.name,
          content: await extractText(doc),
        };
      })
    );
    
    const validDocuments = documentContents.filter(doc => doc.content && doc.content.trim() !== '');

    if (validDocuments.length < documents.length) {
       console.warn('Some documents were empty or could not be parsed.');
    }
    
    if (validDocuments.length < 2) {
      return { report: null, error: "At least two documents must have processable content. Some files may be empty or unsupported.", key };
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

export async function getReports(options?: { limit?: number }): Promise<Report[]> {
  // In a real app, you'd fetch from a database.
  // Here we just return the in-memory array.
  const allReports = [...reportsStore];
  if (options?.limit) {
    return Promise.resolve(allReports.slice(0, options.limit));
  }
  return Promise.resolve(allReports);
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
