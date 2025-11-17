'use server';

/**
 * @fileOverview This file contains a Genkit flow for summarizing the payment history overview using AI.
 *
 * - summarizePaymentHistory - A function that takes payment history data and returns an AI-generated summary.
 * - SummarizePaymentHistoryInput - The input type for the summarizePaymentHistory function.
 * - SummarizePaymentHistoryOutput - The return type for the summarizePaymentHistory function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizePaymentHistoryInputSchema = z.object({
  paymentHistory: z.string().describe('Payment history data in JSON format.'),
});
export type SummarizePaymentHistoryInput = z.infer<typeof SummarizePaymentHistoryInputSchema>;

const SummarizePaymentHistoryOutputSchema = z.object({
  summary: z.string().describe('AI-generated summary of the payment history.'),
});
export type SummarizePaymentHistoryOutput = z.infer<typeof SummarizePaymentHistoryOutputSchema>;

export async function summarizePaymentHistory(input: SummarizePaymentHistoryInput): Promise<SummarizePaymentHistoryOutput> {
  return summarizePaymentHistoryFlow(input);
}

const summarizePaymentHistoryPrompt = ai.definePrompt({
  name: 'summarizePaymentHistoryPrompt',
  input: {schema: SummarizePaymentHistoryInputSchema},
  output: {schema: SummarizePaymentHistoryOutputSchema},
  prompt: `You are an AI assistant tasked with summarizing payment history data for an administrator.

  Analyze the following payment history data and provide a concise summary of payment trends, potential issues, and key insights.

  Payment History Data:
  {{paymentHistory}}

  Summary:`,  
});

const summarizePaymentHistoryFlow = ai.defineFlow(
  {
    name: 'summarizePaymentHistoryFlow',
    inputSchema: SummarizePaymentHistoryInputSchema,
    outputSchema: SummarizePaymentHistoryOutputSchema,
  },
  async input => {
    const {output} = await summarizePaymentHistoryPrompt(input);
    return output!;
  }
);
