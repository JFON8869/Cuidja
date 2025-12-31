'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-product-recommendations.ts';
import '@/ai/flows/suggest-category-flow.ts';

import { ai } from '@/ai/genkit';
import { z } from 'zod';

// Simple flow to force backend provisioning
export const menuSuggestionFlow = ai.defineFlow(
  {
    name: 'menuSuggestionFlow',
    inputSchema: z.string(),
    outputSchema: z.string(),
  },
  async (subject) => {
    const prompt = `Sugira um prato criativo para um restaurante com base no seguinte tema: ${subject}.`;
    const { output } = await ai.generate({ prompt });
    return output!;
  }
);
