import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { LandingHeader, LandingFooter } from "@/components/layout/LandingHeader";
import { Home, Search } from "lucide-react";

export default function NotFoundPage() {
  return (
    <>
      <LandingHeader />
      <main className="pt-16 min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-6 py-20 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-8xl md:text-9xl font-bold text-primary mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-4">
              Page Not Found
            </h2>
            <p className="text-secondary mb-8 max-w-md mx-auto">
              The page you are looking for has gone missing. It may have been removed,
              renamed, or you might have typed the wrong URL.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/">
                <Button size="lg" variant="primary">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button size="lg" variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Find your account
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
      <LandingFooter />
    </>
  );
}
