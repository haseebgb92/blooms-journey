'use server';
/**
 * @fileOverview A flow for getting pregnancy meal suggestions.
 *
 * - getMealSuggestion - A function that provides meal suggestions based on country and cravings.
 * - MealSuggestionInput - The input type for the getMealSuggestion function.
 * - MealSuggestionOutput - The return type for the getMealSuggestion function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const MealSuggestionInputSchema = z.object({
  country: z.string().describe("The user's country, for culturally relevant meal suggestions."),
  location: z.string().describe("The user's city or region, to suggest locally available ingredients."),
  preference: z.string().describe('The user\'s current craving or meal preference (e.g., "something spicy", "a healthy snack").'),
});
export type MealSuggestionInput = z.infer<typeof MealSuggestionInputSchema>;
export type MealSuggestionOutput = string;

const mealSuggestionPrompt = ai.definePrompt({
    name: 'mealSuggestionPrompt',
    input: { schema: MealSuggestionInputSchema },
    prompt: `You are a specialized AI nutritionist for pregnant women. Your ONLY function is to provide healthy and safe meal suggestions.

The user is from {{{location}}}, {{{country}}} and has a preference for: "{{{preference}}}".

Provide 2-3 meal or snack ideas that are safe and beneficial for pregnancy. For each suggestion, briefly explain why it's a good choice. The suggestions should be culturally appropriate for the user's country and consider ingredients that are likely to be available in their location.

If the user asks for anything other than pregnancy-related meal advice, or if the preference is for something unsafe during pregnancy (like alcohol or raw fish), you MUST politely decline and state that you can only provide safe pregnancy meal suggestions. Do not answer any other topics.`,
    config: {
        temperature: 0.6
    }
});


const mealSuggestionFlow = ai.defineFlow(
  {
    name: 'mealSuggestionFlow',
    inputSchema: MealSuggestionInputSchema,
    outputSchema: z.string(),
  },
  async (input) => {
    const llmResponse = await mealSuggestionPrompt(input);
    return llmResponse.text;
  }
);

export async function getMealSuggestion(
  input: MealSuggestionInput
): Promise<MealSuggestionOutput> {
  return await mealSuggestionFlow(input);
}
