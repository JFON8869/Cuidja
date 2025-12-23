'use server';
/**
 * @fileOverview A Genkit flow to suggest a product category based on its name and description.
 *
 * - suggestCategory - A function that suggests a category for a product.
 * - SuggestCategoryInput - The input type for the suggestCategory function.
 * - SuggestCategoryOutput - The return type for the suggestCategory function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { mockCategories } from '@/lib/data';

// Define the list of valid categories dynamically from the mock data.
const validCategories = mockCategories.filter(c => c.type === 'PRODUCT').map(c => c.name);

const SuggestCategoryInputSchema = z.object({
  productName: z.string().describe('The name of the product.'),
  productDescription: z.string().describe('The description of the product.'),
});
export type SuggestCategoryInput = z.infer<typeof SuggestCategoryInputSchema>;

const SuggestCategoryOutputSchema = z.object({
  category: z
    .string()
    .describe(`The suggested category for the product. Must be one of: ${validCategories.join(', ')}`),
});
export type SuggestCategoryOutput = z.infer<typeof SuggestCategoryOutputSchema>;

/**
 * An exported wrapper function that calls the Genkit flow.
 * This is what your application code will import and use.
 * @param input The product name and description.
 * @returns A promise that resolves to the suggested category.
 */
export async function suggestCategory(
  input: SuggestCategoryInput
): Promise<SuggestCategoryOutput> {
  return suggestCategoryFlow(input);
}

// Define the Genkit prompt.
const suggestCategoryPrompt = ai.definePrompt({
  name: 'suggestCategoryPrompt',
  input: { schema: SuggestCategoryInputSchema },
  output: { schema: SuggestCategoryOutputSchema },
  prompt: `You are an expert product categorizer for a local marketplace app.
    Your task is to suggest the single most appropriate category for a product based on its name and description.

    You MUST choose one of the following categories:
    ${validCategories.map(c => `- ${c}`).join('\n')}

    Analyze the product details below:
    Product Name: {{{productName}}}
    Product Description: {{{productDescription}}}

    Based on the details, what is the best category?`,
});

// Define the Genkit flow that uses the prompt.
const suggestCategoryFlow = ai.defineFlow(
  {
    name: 'suggestCategoryFlow',
    inputSchema: SuggestCategoryInputSchema,
    outputSchema: SuggestCategoryOutputSchema,
  },
  async input => {
    const { output } = await suggestCategoryPrompt(input);
    return output!;
  }
);
