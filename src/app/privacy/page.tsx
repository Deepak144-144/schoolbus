import { Card, CardContent } from "@/components/ui/Card";
import { LandingFooter, LandingHeader } from "@/components/layout/LandingHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "SafeRide School Privacy Policy. Learn how we collect, use, and protect your information when you use our school bus tracking service.",
};

export default function PrivacyPage() {
  return (
    <>
      <LandingHeader />
      <main className="pt-16 min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
          <h1 className="text-4xl font-bold text-primary mb-6">Privacy Policy</h1>
          <p className="text-sm text-secondary mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <Card className="border-border/30 mb-6">
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none text-secondary">
                <h2 className="text-primary">Information We Collect</h2>
                <p>
                  We collect information you provide directly to us, such as when you
                  create an account, use our service, or contact us. This may include
                  your name, email address, phone number, and child information.
                </p>

                <h2 className="text-primary">How We Use Your Information</h2>
                <ul>
                  <li>To provide and maintain our service</li>
                  <li>To notify you about changes to our service</li>
                  <li>To provide customer support</li>
                  <li>To analyze and improve our service</li>
                  <li>To detect and prevent fraudulent activity</li>
                </ul>

                <h2 className="text-primary">Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to
                  protect your personal data. All passwords are hashed using bcrypt
                  with a salt round of 12. Authentication tokens are signed with
                  JWT and stored in secure, httpOnly cookies.
                </p>

                <h2 className="text-primary">Third-Party Services</h2>
                <p>
                  We may share your information with third-party service providers who
                  assist us in operating our platform. These parties are contractually
                  bound to protect your information.
                </p>

                <h2 className="text-primary">Cookies</h2>
                <p>
                  We use cookies to authenticate your session and remember your
                  preferences. You can control cookies through your browser settings,
                  though this may affect your ability to use certain features.
                </p>

                <h2 className="text-primary">Your Rights</h2>
                <p>
                  You have the right to access, correct, or delete your personal data.
                  You may also have the right to data portability and to object to
                  certain processing of your data.
                </p>

                <h2 className="text-primary">Changes to This Policy</h2>
                <p>
                  We may update our Privacy Policy from time to time. We will notify
                  you of any changes by posting the new Privacy Policy on this page.
                </p>

                <h2 className="text-primary">Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact
                  us at privacy@saferide.edu.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
