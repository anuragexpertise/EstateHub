'use server';
/**
 * @fileOverview A flow to generate suggested prompts for entity enrollment.
 *
 * - generateEntityEnrollmentPrompts - A function that generates prompts for entity enrollment.
 * - GenerateEntityEnrollmentPromptsInput - The input type for the generateEntityEnrollmentPrompts function.
 * - GenerateEntityEnrollmentPromptsOutput - The return type for the generateEntityEnrollmentPrompts function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEntityEnrollmentPromptsInputSchema = z.object({
  entityType: z
    .string()
    .describe('The type of entity to generate prompts for (e.g., Resident, Utility, Security, Admin).'),
  entityDetails: z.string().describe('Details about the entity to be enrolled.'),
});
export type GenerateEntityEnrollmentPromptsInput = z.infer<
  typeof GenerateEntityEnrollmentPromptsInputSchema
>;

const GenerateEntityEnrollmentPromptsOutputSchema = z.object({
  suggestedPrompts: z
    .array(z.string())
    .describe('An array of suggested prompts for enrolling the entity.'),
});
export type GenerateEntityEnrollmentPromptsOutput = z.infer<
  typeof GenerateEntityEnrollmentPromptsOutputSchema
>;

export async function generateEntityEnrollmentPrompts(
  input: GenerateEntityEnrollmentPromptsInput
): Promise<GenerateEntityEnrollmentPromptsOutput> {
  return generateEntityEnrollmentPromptsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateEntityEnrollmentPromptsPrompt',
  input: {schema: GenerateEntityEnrollmentPromptsInputSchema},
  output: {schema: GenerateEntityEnrollmentPromptsOutputSchema},
  prompt: `You are an administrative assistant that generates a series of suggested prompts for the enrollment of new entities into the system.

  The entity type is: {{{entityType}}}
  The entity details are: {{{entityDetails}}}

  Generate 3 different suggested prompts that would be helpful when enrolling this entity. Return the prompts as a JSON array.
  `,
});

const generateEntityEnrollmentPromptsFlow = ai.defineFlow(
  {
    name: 'generateEntityEnrollmentPromptsFlow',
    inputSchema: GenerateEntityEnrollmentPromptsInputSchema,
    outputSchema: GenerateEntityEnrollmentPromptsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
