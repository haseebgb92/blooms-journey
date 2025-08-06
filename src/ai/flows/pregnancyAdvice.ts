'use server';
/**
 * @fileOverview A flow for getting pregnancy advice.
 *
 * - getPregnancyAdvice - A function that provides advice for a given week and topic.
 * - PregnancyAdviceInput - The input type for the getPregnancyAdvice function.
 * - PregnancyAdviceOutput - The return type for the getPregnancyAdvice function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PregnancyAdviceInputSchema = z.object({
  week: z.number(),
  topic: z.string(),
});
export type PregnancyAdviceInput = z.infer<typeof PregnancyAdviceInputSchema>;
export type PregnancyAdviceOutput = string;


const pregnancyAdviceFlow = ai.defineFlow(
  {
    name: 'pregnancyAdviceFlow',
    inputSchema: PregnancyAdviceInputSchema,
    outputSchema: z.string(),
  },
  async ({week, topic}) => {
    const prompt = `You are a helpful, friendly, and gentle AI assistant for expectant mothers. Your ONLY function is to provide advice and information about pregnancy.

The user is in week ${week} of their pregnancy and is asking about "${topic}".

Provide a reassuring and informative answer. Keep it concise, about 2-3 paragraphs. Use a soft and caring tone.

If the user asks about any topic other than pregnancy, you MUST politely decline and state that you can only answer pregnancy-related questions.`;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: prompt,
      config: {
        temperature: 0.5,
      },
    });

    return llmResponse.text;
  }
);

export async function getPregnancyAdvice(
  input: PregnancyAdviceInput
): Promise<PregnancyAdviceOutput> {
  return await pregnancyAdviceFlow(input);
}
