import { Card, CardContent } from "@/components/ui/Card";
import { LandingFooter, LandingHeader } from "@/components/layout/LandingHeader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "SafeRide School Terms and Conditions. Read the terms governing use of our school bus tracking platform.",
};

export default function TermsPage() {
  return (
    <>
      <LandingHeader />
      <main className="pt-16 min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-12 max-w-3xl">
          <h1 className="text-4xl font-bold text-primary mb-6">Terms of Service</h1>
          <p className="text-sm text-secondary mb-8">
            Last updated: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          <Card className="border-border/30 mb-6">
            <CardContent className="pt-6">
              <div className="prose prose-sm max-w-none text-secondary">
                <h2 className="text-primary">Acceptance of Terms</h2>
                <p>
                  By accessing or using SafeRide School's services, you agree to be
                  bound by these Terms of Service. If you do not agree with any part
                  of these terms, you may not access our service.
                </p>

                <h2 className="text-primary">User Accounts</h2>
                <p>
                  To use most portions of our service, you must register for an account.
                  You are responsible for maintaining the confidentiality of your
                  account credentials and for all activities under your account.
                </p>

                <h2 className="text-primary">Acceptable Use</h2>
                <p>You agree not to use the service to:</p>
                <ul>
                  <li>Provide false or misleading information</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Interfere with or disrupt the service</li>
                  <li>Attempt to gain unauthorized access</li>
                  <li>Use the service for commercial purposes without authorization</li>
                </ul>

                <h2 className="text-primary">Intellectual Property</h2>
                <p>
                  All content, logos, and materials on this service are the property
                  of SafeRide School or its licensors. You may not use, reproduce,
                  or distribute any content without prior written consent.
                </p>

                <h2 className="text-primary">Disclaimer</h2>
                <p>
                  The service is provided "as is" and "as available" without
                  warranties of any kind. We do not guarantee that the service will
                  be uninterrupted, secure, or error-free.
                </p>

                <h2 className="text-primary">Limitation of Liability</h2>
                <p>
                  To the maximum extent permitted by law, SafeRide School shall not
                  be liable for any indirect, incidental, special, or consequential
                  damages arising from your use of the service.
                </p>

                <h2 className="text-primary">Changes to Terms</h2>
                <p>
                  We may revise these terms at any time. Any changes will be posted
                  on this page with an updated "Last updated" date.
                </p>

                <h2 className="text-primary">Contact Us</h2>
                <p>
                  If you have any questions about these Terms, please contact us at
                  legal@saferide.edu.
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
