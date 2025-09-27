'use server';

/**
 * @fileOverview Generates a detailed report highlighting identified conflicts,
 * ambiguities, and suggested clarifications after document analysis.
 *
 * - generateConflictReport - A function that handles the conflict report generation process.
 * - GenerateConflictReportInput - The input type for the generateConflictReport function.
 * - GenerateConflictReportOutput - The return type for the generateConflictReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateConflictReportInputSchema = z.object({
  documentAnalysis: z
    .string()
    .describe("The analysis of the documents, containing identified conflicts and ambiguities."),
});
export type GenerateConflictReportInput = z.infer<typeof GenerateConflictReportInputSchema>;

const GenerateConflictReportOutputSchema = z.object({
  report: z.string().describe('A detailed report highlighting identified conflicts, ambiguities, and suggested clarifications.'),
});
export type GenerateConflictReportOutput = z.infer<typeof GenerateConflictReportOutputSchema>;

export async function generateConflictReport(input: GenerateConflictReportInput): Promise<GenerateConflictReportOutput> {
  return generateConflictReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateConflictReportPrompt',
  input: {schema: GenerateConflictReportInputSchema},
  output: {schema: GenerateConflictReportOutputSchema},
  prompt: `You are an AI expert in document analysis and conflict resolution. Based on the document analysis provided, generate a detailed report highlighting identified conflicts, ambiguities, and suggested clarifications. The report should be comprehensive and easy to understand.

Document Analysis: {{{documentAnalysis}}}`,
});

const generateConflictReportFlow = ai.defineFlow(
  {
    name: 'generateConflictReportFlow',
    inputSchema: GenerateConflictReportInputSchema,
    outputSchema: GenerateConflictReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
