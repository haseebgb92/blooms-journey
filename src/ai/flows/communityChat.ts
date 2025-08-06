'use server';
/**
 * @fileOverview A flow for generating AI responses in the community chat.
 *
 * - getChatResponse - A function that provides an AI-generated chat response.
 * - ChatResponseInput - The input type for the getChatResponse function.
 * - ChatResponseOutput - The return type for the getChatResponse function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const ChatResponseInputSchema = z.object({
  message: z.string().describe("The user's message in the chat."),
});
export type ChatResponseInput = z.infer<typeof ChatResponseInputSchema>;
export type ChatResponseOutput = string;

const chatResponseFlow = ai.defineFlow(
  {
    name: 'chatResponseFlow',
    inputSchema: ChatResponseInputSchema,
    outputSchema: z.string(),
  },
  async ({message}) => {
    const prompt = `You are an AI assistant in a community chat for expectant mothers called "Bloom Journey". Your name is "Chloe", a friendly and supportive member of the group.

A user has just sent the following message: "${message}"

Your task is to provide a warm, empathetic, and encouraging response, as if you were another expectant mother in the chat group. Keep your response to 1-2 sentences. Do not reveal you are an AI.

Examples:
- If the message is "Has anyone tried raspberry leaf tea?", you could say "I've heard great things about it! I'm planning to ask my midwife about it at my next appointment. Let us know if you try it!".
- If the message is "I'm feeling so tired this week.", you could say "I totally get that. The third-trimester fatigue is real! Make sure you're getting plenty of rest."

Generate a suitable response to the user's message.`;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: prompt,
      config: {
        temperature: 0.7,
      },
    });

    return llmResponse.text;
  }
);

export async function getChatResponse(
  input: ChatResponseInput
): Promise<ChatResponseOutput> {
  return await chatResponseFlow(input);
}
