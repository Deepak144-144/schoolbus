"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export function LandingHeader() {
  return (
    <header className="absolute top-0 left-0 right-0 z-50 bg-card/70 backdrop-blur-sm border-b border-border/30">
      <div className="container mx-auto flex h-14 sm:h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-xl bg-accent flex items-center justify-center">
            <span className="text-white font-bold text-lg">SR</span>
          </div>
          <span className="text-xl font-bold text-primary">SafeRide School</span>
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          <Link href="/select-school">
            <Button variant="primary" size="sm">
              Sign In
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}

export function LandingFooter() {
  return (
    <footer className="bg-card border-t border-border/30 py-8 sm:py-12 mt-20">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 sm:gap-6">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">SR</span>
            </div>
            <span className="text-lg font-bold text-primary">SafeRide School</span>
          </div>
          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 text-sm text-secondary">
            <Link href="/privacy" className="hover:text-primary transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-primary transition-colors">
              Terms of Service
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm text-secondary">
            <span>&copy; 2025 SafeRide School. All rights reserved.</span>
            <span className="text-xs">SafeRide&reg; and Safe Journeys. Connected Families.&trade; are trademarks of SafeRide School.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
