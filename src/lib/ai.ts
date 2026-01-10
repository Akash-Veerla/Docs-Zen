import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_API_KEY } from './config';

export type Report = {
  id: string;
  date: string;
  files: number;
  conflicts: number;
  status: 'Completed' | 'Failed';
  reportContent: string;
};

export async function analyzeDocuments(
  documents: { filename: string; content: string }[]
): Promise<Report> {
  const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an AI expert in document analysis and conflict resolution. Your goal is to identify conflicts between the provided documents and suggest specific changes to resolve them.

You will be provided with up to 4 documents. You must analyze ALL of them together to find inconsistencies, contradictions, or overlaps across the entire set.

Please perform the following for each conflict or ambiguity found:
1.  **Conflict Identification**: Clearly describe the contradiction or overlap.
2.  **Affected Documents**: List which documents are involved in this specific conflict.
3.  **Source Text**: Quote the conflicting text from each affected document.
4.  **Explanation**: Briefly explain why this is a conflict.
5.  **Suggested Changes**: Provide specific, actionable suggestions for how to edit the documents to resolve the conflict.

If no conflicts are found, please state that the documents appear consistent.

Generate a clean, easy-to-read report in Markdown.

Documents to analyze:

${documents.map((d, i) => `### Document ${i + 1}: ${d.filename}\n${d.content}\n\n---\n`).join('')}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    const conflictKeywords = ['conflict', 'contradiction', 'ambiguity', 'discrepancy', 'overlap'];
    const content = text.toLowerCase();
    const matches = content.match(new RegExp(conflictKeywords.join('|'), 'gi'));
    const conflictsCount = matches ? matches.length : 0;

    return {
      id: `REP-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      files: documents.length,
      conflicts: conflictsCount,
      status: 'Completed',
      reportContent: text,
    };
  } catch (error: unknown) {
    console.error("AI Analysis Error:", error);
    if (error instanceof Error) {
        throw new Error(error.message || "Failed to analyze documents");
    }
    throw new Error("Failed to analyze documents");
  }
}
