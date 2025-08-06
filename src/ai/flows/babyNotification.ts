'use server';
/**
 * @fileOverview A flow for generating baby notifications about nutrition, exercise, and symptoms.
 *
 * - getBabyNotification - A function that provides a cute notification message from the baby's perspective.
 * - BabyNotificationInput - The input type for the getBabyNotification function.
 * - BabyNotificationOutput - The return type for the getBabyNotification function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const BabyNotificationInputSchema = z.object({
  week: z.number().describe('The current week of pregnancy.'),
  category: z.enum(['nutrition', 'exercise', 'symptoms']).describe('The category of notification.'),
});
export type BabyNotificationInput = z.infer<typeof BabyNotificationInputSchema>;
export type BabyNotificationOutput = string;

const babyNotificationFlow = ai.defineFlow(
  {
    name: 'babyNotificationFlow',
    inputSchema: BabyNotificationInputSchema,
    outputSchema: z.string(),
  },
  async ({week, category}) => {
    const categoryPrompts = {
      nutrition: `You are a baby in your mother's womb at week ${week}. Generate a cute, loving message about nutrition and eating habits. Focus on:
- What foods are good for your development this week
- Gentle reminders about healthy eating
- Encouragement for mom to stay hydrated
- Any specific nutrients important for week ${week}

Keep it sweet, encouraging, and 1-2 sentences maximum.`,
      
      exercise: `You are a baby in your mother's womb at week ${week}. Generate a cute, loving message about exercise and movement. Focus on:
- Gentle exercise recommendations for this week
- How movement helps your development
- Encouragement for mom to stay active safely
- Any specific exercise tips for week ${week}

Keep it sweet, encouraging, and 1-2 sentences maximum.`,
      
      symptoms: `You are a baby in your mother's womb at week ${week}. Generate a cute, loving message about pregnancy symptoms and self-care. Focus on:
- Common symptoms for week ${week} and how to manage them
- Encouragement for rest and self-care
- Reassurance about normal pregnancy changes
- When to contact the doctor if needed

Keep it sweet, encouraging, and 1-2 sentences maximum.`
    };

    const prompt = categoryPrompts[category];

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: prompt,
      config: {
        temperature: 0.8,
      },
    });

    return llmResponse.text;
  }
);

export async function getBabyNotification(
  input: BabyNotificationInput
): Promise<BabyNotificationOutput> {
  return await babyNotificationFlow(input);
}
