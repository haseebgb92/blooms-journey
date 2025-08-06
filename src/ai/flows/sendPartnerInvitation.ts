
'use server';
/**
 * @fileOverview A flow for sending a partner invitation.
 *
 * - sendPartnerInvitation - A function that simulates sending an invitation email.
 * - PartnerInvitationInput - The input type for the sendPartnerInvitation function.
 * - PartnerInvitationOutput - The return type for the sendPartnerInvitation function.
 */
import {ai} from '@/ai/genkit';
import {z} from 'zod';

const PartnerInvitationInputSchema = z.object({
  partnerEmail: z.string().email().describe("The email address of the partner to invite."),
  userName: z.string().describe("The name of the user sending the invitation."),
  userEmail: z.string().email().describe("The email of the user sending the invitation."),
});
export type PartnerInvitationInput = z.infer<typeof PartnerInvitationInputSchema>;

const PartnerInvitationOutputSchema = z.object({
    message: z.string().describe("A confirmation message to be shown to the user.")
});
export type PartnerInvitationOutput = z.infer<typeof PartnerInvitationOutputSchema>;


const sendPartnerInvitationFlow = ai.defineFlow(
  {
    name: 'sendPartnerInvitationFlow',
    inputSchema: PartnerInvitationInputSchema,
    outputSchema: PartnerInvitationOutputSchema,
  },
  async ({partnerEmail, userName, userEmail}) => {
    // In a real application, you would integrate with an email service like SendGrid, Resend,
    // or a Firebase Extension like "Trigger Email".
    // For this example, we'll generate the email content and log it to the console to simulate sending.
    
    const emailPrompt = `You are an assistant helping a user named "${userName}" invite their partner to the "Bloom Journey" pregnancy app.

Generate a short, warm, and friendly email to the partner with the email address "${partnerEmail}".

The email should:
1.  Come from the user, "${userName}".
2.  State that they are inviting them to share the pregnancy journey together on the Bloom Journey app.
3.  Include a clear call to action to sign up (you can use a placeholder link like "https://your-app-url.com/signup?partnerId=...").
4.  Have a friendly and excited tone.

Subject: You've been invited to a Bloom Journey!

Body:
`;

    const llmResponse = await ai.generate({
        model: 'googleai/gemini-2.0-flash',
        prompt: emailPrompt,
        config: {
            temperature: 0.7
        }
    });

    const emailBody = llmResponse.text;

    // --- START OF SIMULATION ---
    // In a production app, you would replace this section with your email service's API call.
    // For example:
    // await sendEmailWithSendGrid({ to: partnerEmail, from: '...', subject: '...', body: emailBody });
    
    console.log("--- SIMULATED EMAIL TO PARTNER ---");
    console.log(`To: ${partnerEmail}`);
    console.log(`From: noreply@bloomjourney.app (on behalf of ${userName})`);
    console.log(`Subject: You've been invited to a Bloom Journey!`);
    console.log("Body:", emailBody);
    console.log("---------------------------------");
    // --- END OF SIMULATION ---

    const userConfirmationBody = `Hi ${userName},\n\nYou have successfully sent an invitation to ${partnerEmail} to join you on Bloom Journey. They will receive an email shortly with instructions on how to sign up and connect with you.\n\nBest,\nThe Bloom Journey Team`;
    
    // This part also simulates sending a confirmation email to the user who sent the invite.
    console.log("--- SIMULATED CONFIRMATION EMAIL TO USER ---");
    console.log(`To: ${userEmail}`);
    console.log(`From: noreply@bloomjourney.app`);
    console.log(`Subject: You've sent a partner invitation!`);
    console.log("Body:", userConfirmationBody);
    console.log("-------------------------------------------");
    
    // Simulate a network delay for a more realistic feel.
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
        message: `An invitation has been sent to ${partnerEmail}. You'll both be ready to share the journey once they accept!`
    };
  }
);

export async function sendPartnerInvitation(
  input: PartnerInvitationInput
): Promise<PartnerInvitationOutput> {
  return await sendPartnerInvitationFlow(input);
}
