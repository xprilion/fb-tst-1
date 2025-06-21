'use server';

/**
 * @fileOverview AI-powered tool to verify if the sum of two numbers is correct.
 *
 * - verifyAddition - A function that verifies the addition and provides a step-by-step solution if incorrect.
 * - VerifyAdditionInput - The input type for the verifyAddition function.
 * - VerifyAdditionOutput - The return type for the verifyAddition function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const VerifyAdditionInputSchema = z.object({
  num1: z.number().describe('The first number to add.'),
  num2: z.number().describe('The second number to add.'),
  userSum: z.number().describe('The user provided sum of the two numbers.'),
});
export type VerifyAdditionInput = z.infer<typeof VerifyAdditionInputSchema>;

const VerifyAdditionOutputSchema = z.object({
  isCorrect: z.boolean().describe('Whether the user provided sum is correct.'),
  correctSum: z.number().describe('The correct sum of the two numbers.'),
  explanation: z.string().describe('A step-by-step explanation of how to arrive at the correct sum.'),
});
export type VerifyAdditionOutput = z.infer<typeof VerifyAdditionOutputSchema>;

export async function verifyAddition(input: VerifyAdditionInput): Promise<VerifyAdditionOutput> {
  return verifyAdditionFlow(input);
}

const verifyAdditionPrompt = ai.definePrompt({
  name: 'verifyAdditionPrompt',
  input: {schema: VerifyAdditionInputSchema},
  output: {schema: VerifyAdditionOutputSchema},
  prompt: `You are an AI assistant that verifies if a user correctly added two numbers. 

  The two numbers to add are: {{num1}} and {{num2}}.
  The user's sum is: {{userSum}}.

  Determine if the user's sum is correct. If it is not, provide the correct sum and a step-by-step explanation of how to arrive at the correct sum.
  Set the isCorrect output field appropriately to either true or false.
`,
});

const verifyAdditionFlow = ai.defineFlow(
  {
    name: 'verifyAdditionFlow',
    inputSchema: VerifyAdditionInputSchema,
    outputSchema: VerifyAdditionOutputSchema,
  },
  async input => {
    const {output} = await verifyAdditionPrompt(input);
    return output!;
  }
);
