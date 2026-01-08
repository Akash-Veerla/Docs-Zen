import { GoogleGenerativeAI } from '@google/generative-ai';

export type Report = {
  id: string;
  date: string;
  files: number;
  conflicts: number;
  status: 'Completed' | 'Failed';
  reportContent: string;
};

function countConflicts(text: string): number {
  const conflictKeywords = ['conflict', 'contradiction', 'ambiguity', 'discrepancy', 'overlap'];
  const content = text.toLowerCase();
  const matches = content.match(new RegExp(conflictKeywords.join('|'), 'gi'));
  return matches ? matches.length : 0;
}

function generateReportObject(text: string, fileCount: number): Report {
  return {
    id: `REP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    files: fileCount,
    conflicts: countConflicts(text),
    status: 'Completed',
    reportContent: text,
  };
}

const SYSTEM_PROMPT = `You are an AI expert in document analysis and conflict resolution. Your goal is to identify conflicts between the provided documents and suggest specific changes to resolve them.

Please perform the following for each conflict or ambiguity found:
1.  **Conflict Identification**: Clearly describe the contradiction or overlap.
2.  **Source Text**: Quote the conflicting text from each document, citing the document name.
3.  **Explanation**: Briefly explain why this is a conflict.
4.  **Suggested Changes**: Provide specific, actionable suggestions for how to edit the documents to resolve the conflict. Be precise (e.g., "Replace text X with Y").

If no conflicts are found, please state that the documents appear consistent.

Generate a clean, easy-to-read report in Markdown.`;

function buildPrompt(documents: { filename: string; content: string }[]): string {
  return `Documents to analyze:

${documents.map(d => `### Document: ${d.filename}\n${d.content}\n\n---\n`).join('')}`;
}

export async function checkChromeAIAvailability(): Promise<boolean> {
  if (typeof window === 'undefined' || !window.ai || !window.ai.languageModel) {
    return false;
  }
  try {
    const capabilities = await window.ai.languageModel.capabilities();
    return capabilities.available !== 'no';
  } catch (e) {
    console.warn('Error checking Chrome AI capabilities:', e);
    return false;
  }
}

export async function analyzeWithChromeAI(
  documents: { filename: string; content: string }[]
): Promise<Report> {
  if (!window.ai || !window.ai.languageModel) {
    throw new Error('Chrome AI is not available.');
  }

  const session = await window.ai.languageModel.create({
    systemPrompt: SYSTEM_PROMPT,
  });

  try {
    const prompt = buildPrompt(documents);
    const text = await session.prompt(prompt);

    return generateReportObject(text, documents.length);
  } catch (error: unknown) {
    console.error("Chrome AI Analysis Error:", error);
    throw new Error("Failed to analyze documents with Chrome AI. The content might be too large for the local model.");
  } finally {
    session.destroy();
  }
}

export async function analyzeDocuments(
  documents: { filename: string; content: string }[],
  apiKey: string
): Promise<Report> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `${SYSTEM_PROMPT}\n\n${buildPrompt(documents)}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    return generateReportObject(text, documents.length);
  } catch (error: unknown) {
    console.error("AI Analysis Error:", error);
    if (error instanceof Error) {
        throw new Error(error.message || "Failed to analyze documents");
    }
    throw new Error("Failed to analyze documents");
  }
}
