'use server';
/**
 * @fileOverview An AI agent to detect conflicts in ingested documents by incorporating clauses from similar document excerpts, external laws, compliance guides, and related rulings.
 *
 * - detectDocumentConflicts - A function that handles the document conflict detection process.
 * - DetectDocumentConflictsInput - The input type for the detectDocumentConflicts function.
 * - DetectDocumentConflictsOutput - The return type for the detectDocumentConflicts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectDocumentConflictsInputSchema = z.object({
  documents: z.array(
    z.object({
      filename: z.string().describe('The name of the document.'),
      content: z.string().describe('The content of the document.'),
    })
  ).describe('An array of documents to analyze for conflicts.'),
});
export type DetectDocumentConflictsInput = z.infer<typeof DetectDocumentConflictsInputSchema>;

const DetectDocumentConflictsOutputSchema = z.object({
  report: z.string().describe('A detailed report highlighting identified conflicts, ambiguities, and suggested clarifications.'),
});
export type DetectDocumentConflictsOutput = z.infer<typeof DetectDocumentConflictsOutputSchema>;

export async function detectDocumentConflicts(input: DetectDocumentConflictsInput): Promise<DetectDocumentConflictsOutput> {
  return detectDocumentConflictsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectDocumentConflictsPrompt',
  input: {schema: DetectDocumentConflictsInputSchema},
  output: {schema: DetectDocumentConflictsOutputSchema},
  prompt: `You are an AI expert in legal and policy document analysis. Your task is to analyze a set of documents and identify any contradictions, overlaps, and ambiguities.

For each conflict you find, you must:
1.  Clearly state the contradiction or overlap.
2.  Provide the exact conflicting text from each document, citing the document name.
3.  Explain WHY it is a conflict.
4.  Suggest a concrete clarification or a resolution to fix the conflict.

You should also consider external laws, compliance guides, and related rulings to provide a comprehensive analysis.

Generate a detailed report in Markdown format that is well-structured and easy to read.

Here are the documents to analyze:

{{#each documents}}
Document Name: {{{this.filename}}}
Content:
{{{this.content}}}
\n---\n{{/each}}`,
});

const detectDocumentConflictsFlow = ai.defineFlow(
  {
    name: 'detectDocumentConflictsFlow',
    inputSchema: DetectDocumentConflictsInputSchema,
    outputSchema: DetectDocumentConflictsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
