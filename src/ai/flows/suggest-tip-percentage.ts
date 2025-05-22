'use server';

/**
 * @fileOverview An AI agent that suggests a tip percentage based on service quality.
 *
 * - suggestTipPercentage - A function that suggests a tip percentage.
 * - SuggestTipPercentageInput - The input type for the suggestTipPercentage function.
 * - SuggestTipPercentageOutput - The return type for the suggestTipPercentage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestTipPercentageInputSchema = z.object({
  serviceQuality: z
    .string()
    .describe(
      'A description of the service quality received at the restaurant.'
    ),
  billAmount: z.number().describe('The total bill amount before tip.'),
});
export type SuggestTipPercentageInput = z.infer<
  typeof SuggestTipPercentageInputSchema
>;

const SuggestTipPercentageOutputSchema = z.object({
  suggestedTipPercentage: z
    .number()
    .describe(
      'The suggested tip percentage based on the service quality, as a decimal between 0 and 1.'
    ),
  reasoning: z
    .string()
    .describe('The reasoning behind the suggested tip percentage.'),
});
export type SuggestTipPercentageOutput = z.infer<
  typeof SuggestTipPercentageOutputSchema
>;

export async function suggestTipPercentage(
  input: SuggestTipPercentageInput
): Promise<SuggestTipPercentageOutput> {
  return suggestTipPercentageFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestTipPercentagePrompt',
  input: {schema: SuggestTipPercentageInputSchema},
  output: {schema: SuggestTipPercentageOutputSchema},
  prompt: `You are a helpful assistant that suggests a tip percentage based on the service quality at a restaurant.

You will be provided with a description of the service quality and the total bill amount.

Based on the service quality, you will suggest a tip percentage as a decimal between 0 and 1.

You will also provide a brief explanation of your reasoning for the suggested tip percentage.

Service Quality: {{{serviceQuality}}}
Bill Amount: {{{billAmount}}}

Consider these guidelines when determining the tip percentage:
- Exceptional service: 20-25%
- Good service: 15-20%
- Average service: 10-15%
- Poor service: 0-10%`,
});

const suggestTipPercentageFlow = ai.defineFlow(
  {
    name: 'suggestTipPercentageFlow',
    inputSchema: SuggestTipPercentageInputSchema,
    outputSchema: SuggestTipPercentageOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
