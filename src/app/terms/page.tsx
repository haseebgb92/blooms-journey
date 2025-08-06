import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function TermsPage() {
  return (
    <div className="bg-muted/40 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Last updated: {new Date().toLocaleDateString()}</p>
            
            <p>Welcome to Bloom Journey!</p>

            <h2>1. Acceptance of Terms</h2>
            <p>By accessing or using our application, you agree to be bound by these Terms of Service. If you disagree with any part of the terms, you may not access the service.</p>

            <h2>2. Use of the App</h2>
            <p>Our app provides information and tools for pregnancy tracking. This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.</p>

            <h2>3. User Accounts</h2>
            <p>You are responsible for safeguarding your account information and for any activities or actions under your account. You agree to notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.</p>

            <h2>4. Intellectual Property</h2>
            <p>The Service and its original content, features, and functionality are and will remain the exclusive property of Bloom Journey and its licensors.</p>
            
            <h2>5. Termination</h2>
            <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>

            <h2>6. Changes to Terms</h2>
            <p>We reserve the right, at our sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.</p>

            <h2>7. Contact Us</h2>
            <p>If you have any questions about these Terms, please contact us.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
