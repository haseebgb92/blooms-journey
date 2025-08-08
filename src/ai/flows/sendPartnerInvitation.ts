
'use server';
/**
 * @fileOverview A flow for sending a partner invitation.
 *
 * - sendPartnerInvitation - A function that simulates sending an invitation email.
 * - PartnerInvitationInput - The input type for the sendPartnerInvitation function.
 * - PartnerInvitationOutput - The return type for the sendPartnerInvitation function.
 */
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

export async function sendPartnerInvitation(
  input: PartnerInvitationInput
): Promise<PartnerInvitationOutput> {
  const { partnerEmail, userName, userEmail } = input;
  
  // Generate static email content
  const emailBody = `Hi there!

${userName} has invited you to join them on their pregnancy journey using the Bloom Journey app!

Bloom Journey is a comprehensive pregnancy companion app that helps expectant parents track their pregnancy, get personalized advice, and stay connected throughout this beautiful journey.

To join ${userName} on Bloom Journey:
1. Download the Bloom Journey app
2. Sign up with your email address
3. Connect with ${userName} using the partner connection feature

This is an exciting time, and ${userName} wants to share every moment with you. Join them on this incredible journey!

Best wishes,
The Bloom Journey Team`;

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

  const userConfirmationBody = `Hi ${userName},

You have successfully sent an invitation to ${partnerEmail} to join you on Bloom Journey. They will receive an email shortly with instructions on how to sign up and connect with you.

Best,
The Bloom Journey Team`;
    
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
