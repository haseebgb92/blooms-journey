
import {genkit, type Genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

let aiInstance: Genkit;

function lazyInitAi() {
  if (aiInstance) {
    return aiInstance;
  }
  aiInstance = genkit({
    plugins: [
      googleAI(),
    ],
    model: 'googleai/gemini-2.0-flash',
    enableTracing: true,
  });
  return aiInstance;
}

// We lazy-initialize the AI object so that it's not created until it's first
// used. This is important for Next.js, as it will try to create the AI object
// in a client-side context, which will fail.
const ai: Genkit = new Proxy({} as Genkit, {
  get: (target, prop) => {
    return (lazyInitAi() as any)[prop];
  }
});

export { ai };
