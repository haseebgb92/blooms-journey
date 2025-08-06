
// Temporarily disabled due to Genkit API compatibility issues
// import {createApi} from '@genkit-ai/next/server';
// import {ai} from '@/ai/genkit';
// import '@/ai/dev';

// export const {GET, POST} = createApi({
//   ai,
//   crons: [],
// });

// Temporary placeholder to prevent build errors
export async function GET() {
  return new Response('Genkit API temporarily disabled', { status: 503 });
}

export async function POST() {
  return new Response('Genkit API temporarily disabled', { status: 503 });
}
