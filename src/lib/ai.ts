import { GoogleGenerativeAI } from '@google/generative-ai';

export type Report = {
  id: string;
  date: string;
  files: number;
  conflicts: number;
  status: 'Completed' | 'Failed';
  reportContent: string;
};

export async function analyzeDocuments(
  documents: { filename: string; content: string }[],
  apiKey: string
): Promise<Report> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  const prompt = `You are an AI expert in legal and policy document analysis. Your task is to analyze a set of documents and identify any contradictions, overlaps, and ambiguities.

For each conflict you find, you must:
1.  Clearly state the contradiction or overlap.
2.  Provide the exact conflicting text from each document, citing the document name.
3.  Explain WHY it is a conflict.
4.  Suggest a concrete clarification or a resolution to fix the conflict.

You should also consider external laws, compliance guides, and related rulings to provide a comprehensive analysis.

Generate a detailed report in Markdown format that is well-structured and easy to read.

Here are the documents to analyze:

${documents.map(d => `Document Name: ${d.filename}\nContent:\n${d.content}\n\n---\n`).join('')}`;

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
