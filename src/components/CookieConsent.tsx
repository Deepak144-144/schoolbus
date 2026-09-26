"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { X } from "lucide-react";

const CONSENT_COOKIE = "cookie-consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${CONSENT_COOKIE}=`));
    if (!consent) {
      setVisible(true);
    }
  }, []);

  const acceptAll = () => {
    document.cookie = `${CONSENT_COOKIE}=all; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
    setVisible(false);
  };

  const acceptEssential = () => {
    document.cookie = `${CONSENT_COOKIE}=essential; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
    setVisible(false);
  };

  const close = () => {
    document.cookie = `${CONSENT_COOKIE}=declined; Max-Age=31536000; Path=/; SameSite=Lax; Secure`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 max-w-lg w-full mx-4 bg-card border border-border/30 rounded-xl shadow-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-primary mb-1">We value your privacy</h3>
          <p className="text-xs text-secondary">
            We use cookies to authenticate your session, analyze site usage, and
            personalize your experience. You can manage your preferences at any time
            or read our{" "}
            <Link href="/privacy" className="text-accent hover:underline">
              Privacy Policy
            </Link>
            {" "}and{" "}
            <Link href="/terms" className="text-accent hover:underline">
              Terms of Service
            </Link>
            .
          </p>
        </div>
        <button
          onClick={close}
          className="text-secondary hover:text-primary p-1 rounded-lg hover:bg-secondary/10 transition-colors"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <Button size="sm" variant="primary" onClick={acceptAll} className="flex-1">
          Accept All
        </Button>
        <Button size="sm" variant="outline" onClick={acceptEssential} className="flex-1">
          Essential Only
        </Button>
      </div>
    </div>
  );
}
