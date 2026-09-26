import type { Metadata } from "next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "leaflet/dist/leaflet.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CookieConsentBanner } from "@/components/CookieConsent";
import { Analytics } from "@/components/Analytics";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "SafeRide School | Safe Journeys. Connected Families.",
    template: "%s | SafeRide School",
  },
  description:
    "A smarter and safer way for schools and parents to stay connected with school transportation. Real-time bus tracking, child safety monitoring, and smart notifications.",
  keywords: "school bus tracking, parent communication, real-time GPS, bus safety, school transportation",
  icons: {
    icon: "/favicon.svg",
  },
  manifest: "/manifest.json",
  metadataBase: new URL("https://saferide.edu"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://saferide.edu",
    title: "SafeRide School | Safe Journeys. Connected Families.",
    description:
      "A smarter and safer way for schools and parents to stay connected with school transportation.",
    images: [{ url: "/og-image.svg" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeRide School | Safe Journeys. Connected Families.",
    description:
      "A smarter and safer way for schools and parents to stay connected with school transportation.",
    images: [{ url: "/og-image.svg" }],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
     <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <AuthProvider>
        <CookieConsentBanner />
        <Analytics />
        {children}
        <SpeedInsights />
      </AuthProvider>
     </body>
    </html>
  );
}
