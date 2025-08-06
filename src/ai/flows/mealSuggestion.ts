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

Provide 2-3 meal or snack ideas that are safe and beneficial for pregnancy. Format your response exactly like this example:

**Spinach and Lentil Soup**

Ingredients:
- 1 cup red lentils
- 2 cups fresh spinach
- 1 onion, chopped
- 2 cloves garlic, minced
- 4 cups vegetable broth
- 1 tsp cumin
- Salt and pepper to taste

Preparation:
Sauté onion and garlic, add lentils and broth, simmer for 20 minutes, add spinach and spices.

Nutritional Benefits:
- **Iron**: Essential for preventing anemia during pregnancy
- **Folate**: Critical for fetal neural tube development
- **Protein**: Supports baby's growth and development
- **Fiber**: Helps with pregnancy constipation
- **Vitamin C**: Aids iron absorption and boosts immunity

Safety Notes:
Ensure lentils are thoroughly cooked to avoid digestive issues.

[Separate each meal suggestion with blank lines]

IMPORTANT FORMATTING RULES:
1. Only use **bold** formatting for the main meal title (e.g., **Meal Name**)
2. Do NOT use asterisks for section headers like "Ingredients:", "Preparation:", "Nutritional Benefits:", or "Safety Notes:"
3. In the Nutritional Benefits section, use **bold** for nutrient names followed by a colon and description (e.g., "**Iron**: Essential for...")
4. Use bullet points (-) for ingredients and nutritional benefits
5. Keep section headers as plain text without any formatting

The suggestions should be culturally appropriate for the user's country and consider ingredients that are likely to be available in their location.

Focus on pregnancy-specific nutritional needs like folic acid, iron, calcium, protein, and omega-3 fatty acids.

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
