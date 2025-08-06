'use server';
/**
 * @fileOverview A flow for generating daily chat messages from the baby, including audio.
 *
 * - getBabyChatMessage - A function that provides a cute message from the baby's perspective, with audio.
 * - BabyChatInput - The input type for the getBabyChatMessage function.
 * - BabyChatOutput - The return type for the getBabyChatMessage function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';
import wav from 'wav';
import {googleAI} from '@genkit-ai/googleai';

const BabyChatInputSchema = z.object({
  week: z.number().describe('The current week of pregnancy.'),
});
export type BabyChatInput = z.infer<typeof BabyChatInputSchema>;

const BabyChatOutputSchema = z.object({
    text: z.string().describe('The text of the message from the baby.'),
    audio: z.string().describe('A data URI of the WAV audio file for the message.')
});

export type BabyChatOutput = z.infer<typeof BabyChatOutputSchema>;

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    let bufs = [] as any[];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const babyChatFlow = ai.defineFlow(
  {
    name: 'babyChatFlow',
    inputSchema: BabyChatInputSchema,
    outputSchema: BabyChatOutputSchema,
  },
  async ({week}) => {
    const textPrompt = `You are a baby in your mother's womb. You are currently in week ${week} of gestation.

Your task is to generate a short, cute, and loving message (1-2 sentences) to your mother from your perspective.

The message should be creative and reflect a developmental milestone for that week. For example:
- Week 12 (plum size): "Hi Mommy! I'm about the size of a plum now. I've been practicing my somersaults in here!"
- Week 16 (avocado size): "I can hear your voice! It's my favorite sound. Keep talking to me, Mommy!"
- Week 24 (ear of corn size): "My taste buds are developing! I wonder if you're eating anything yummy today? Send some down for me!"
- Week 36 (romaine lettuce size): "It's getting a little snug in here, but I feel so safe and warm. I can't wait to meet you soon!"

Generate a suitable message for week ${week}.`;

    const llmResponse = await ai.generate({
      model: 'googleai/gemini-2.0-flash',
      prompt: textPrompt,
      config: {
        temperature: 0.8,
      },
    });

    const textMessage = llmResponse.text;

    const { media } = await ai.generate({
      model: googleAI.model('gemini-2.5-flash-preview-tts'),
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Algenib' },
          },
        },
      },
      prompt: textMessage,
    });
    
    if (!media) {
      throw new Error('no media returned from TTS model');
    }

    const audioBuffer = Buffer.from(
      media.url.substring(media.url.indexOf(',') + 1),
      'base64'
    );

    const wavData = await toWav(audioBuffer);
    const audioDataUri = `data:audio/wav;base64,${wavData}`;

    return {
      text: textMessage,
      audio: audioDataUri,
    };
  }
);

export async function getBabyChatMessage(
  input: BabyChatInput
): Promise<BabyChatOutput> {
  return await babyChatFlow(input);
}
