import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPage() {
  return (
    <div className="bg-muted/40 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Privacy Policy</CardTitle>
          </CardHeader>
          <CardContent className="prose dark:prose-invert max-w-none">
            <p>Last updated: {new Date().toLocaleDateString()}</p>

            <p>Your privacy is important to us. It is Bloom Journey's policy to respect your privacy regarding any information we may collect from you through our app.</p>

            <h2>1. Information We Collect</h2>
            <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used. The types of data we collect include:</p>
            <ul>
                <li><strong>Account Information:</strong> Name, email address.</li>
                <li><strong>Health Data:</strong> Due date, symptoms, weight, and other journal entries you provide.</li>
                <li><strong>Usage Data:</strong> We may collect information about how you use the app to help us improve our services.</li>
            </ul>

            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
                <li>Provide, operate, and maintain our app</li>
                <li>Improve, personalize, and expand our app</li>
                <li>Understand and analyze how you use our app</li>
                <li>Develop new products, services, features, and functionality</li>
                <li>Communicate with you, either directly or through one of our partners</li>
            </ul>

            <h2>3. Data Security</h2>
            <p>We take the security of your data seriously and use appropriate measures to protect it from unauthorized access, alteration, disclosure, or destruction.</p>

            <h2>4. Data Retention</h2>
            <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>

            <h2>5. Your Rights</h2>
            <p>You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services. You have the right to access, update, or delete the information we have on you.</p>

            <h2>6. Changes to This Policy</h2>
            <p>We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page.</p>

            <h2>7. Contact Us</h2>
            <p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to contact us.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
