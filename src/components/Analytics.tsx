"use client";

import { useEffect } from "react";

export function Analytics() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;

    const consent = document.cookie
      .split("; ")
      .find((row) => row.startsWith("cookie-consent="));
    if (!consent) return;

    const consentValue = consent.split("=")[1];
    if (consentValue !== "all" && consentValue !== "essential") return;

    const analyticsId = process.env.NEXT_PUBLIC_ANALYTICS_ID;
    if (!analyticsId) return;
  }, []);

  return null;
}
