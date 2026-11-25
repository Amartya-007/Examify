import type { Metadata, Viewport } from "next";
import "@fontsource-variable/bricolage-grotesque/standard.css";
import "@fontsource-variable/instrument-sans";
import { GeistMono } from "geist/font/mono";
import { SpeedInsights } from "@vercel/speed-insights/next";

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://examify-omil.vercel.app"),
  title: { default: "Examify: AI mock interviews with instant feedback", template: "%s · Examify" },
  description:
    "Practice real interviews out loud with an AI interviewer, then get a scored report across five categories with the full transcript. Practice smarter. Perform better.",
  openGraph: { title: "Examify: AI mock interviews", description: "Practice out loud with an AI interviewer and get scored feedback.", type: "website" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8f9fd" },
    { media: "(prefers-color-scheme: dark)", color: "#0b1024" },
  ],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistMono.variable}>
        <ThemeProvider>
          <TooltipProvider delayDuration={200}>
            {children}
            <Toaster position="top-center" richColors closeButton />
          </TooltipProvider>
        </ThemeProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
