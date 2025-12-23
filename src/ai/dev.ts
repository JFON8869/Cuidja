'use server';
import { config } from 'dotenv';
config();

import '@/ai/flows/personalized-product-recommendations.ts';
import '@/ai/flows/suggest-category-flow.ts';
