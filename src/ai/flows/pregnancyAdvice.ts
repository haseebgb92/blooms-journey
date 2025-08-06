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
    const prompt = `You are a helpful, friendly, and gentle AI assistant for expectant mothers. Your ONLY function is to provide concise, focused advice about pregnancy.

The user is in week ${week} of their pregnancy and is asking about "${topic}".

Provide a brief, focused answer (1-2 short paragraphs maximum) that is specifically tailored to week ${week}. 

**Guidelines:**
- Keep it concise and scannable
- Focus on the most important information for week ${week}
- Use bullet points (•) for key information
- Avoid lengthy explanations
- Prioritize actionable advice

**Week-specific focus:**
- **Weeks 1-12**: Early pregnancy, morning sickness, fatigue, prenatal care
- **Weeks 13-26**: Energy, baby movements, growing belly, preparation
- **Weeks 27-40**: Late pregnancy, labor prep, final weeks

For "${topic}", provide:
• Key points for week ${week}
• Quick tips or recommendations
• When to contact healthcare provider (if relevant)

**IMPORTANT**: Use bullet points with • symbol, NOT asterisks (*). For example:
• **Key points:** Baby's movements are more noticeable
• **Quick tips:** Stay hydrated, stretch regularly
• **Contact your doctor:** If you experience severe pain

Keep your response short, practical, and easy to read. Use a caring but direct tone.`;

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
