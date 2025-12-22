'use server';

/**
 * @fileOverview A flow to provide personalized product recommendations based on user history, interests, and location.
 *
 * - personalizedProductRecommendations - A function that returns personalized product recommendations.
 * - PersonalizedProductRecommendationsInput - The input type for the personalizedProductRecommendations function.
 * - PersonalizedProductRecommendationsOutput - The return type for the personalizedProductRecommendations function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const PersonalizedProductRecommendationsInputSchema = z.object({
  userHistory: z.string().describe('The user purchase history.'),
  userInterests: z.string().describe('The user interests.'),
  userLocation: z.string().describe('The user location.'),
});

export type PersonalizedProductRecommendationsInput = z.infer<
  typeof PersonalizedProductRecommendationsInputSchema
>;

const PersonalizedProductRecommendationsOutputSchema = z.object({
  recommendations: z.string().describe('A list of personalized product recommendations.'),
});

export type PersonalizedProductRecommendationsOutput = z.infer<
  typeof PersonalizedProductRecommendationsOutputSchema
>;

export async function personalizedProductRecommendations(
  input: PersonalizedProductRecommendationsInput
): Promise<PersonalizedProductRecommendationsOutput> {
  return personalizedProductRecommendationsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'personalizedProductRecommendationsPrompt',
  input: {schema: PersonalizedProductRecommendationsInputSchema},
  output: {schema: PersonalizedProductRecommendationsOutputSchema},
  prompt: `Você é um sistema de recomendação de produtos e serviços.

  Com base no histórico de compras, interesses e localização do usuário, forneça uma lista de recomendações personalizadas de produtos e serviços disponíveis no Mercado Local Cuidja.

  Histórico de compras: {{{userHistory}}}
  Interesses: {{{userInterests}}}
  Localização: {{{userLocation}}}

  Recomendações:`,
});

const personalizedProductRecommendationsFlow = ai.defineFlow(
  {
    name: 'personalizedProductRecommendationsFlow',
    inputSchema: PersonalizedProductRecommendationsInputSchema,
    outputSchema: PersonalizedProductRecommendationsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
