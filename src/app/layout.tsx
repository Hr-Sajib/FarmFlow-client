import type { Metadata } from "next";
import { Bricolage_Grotesque, Inter_Tight, JetBrains_Mono, Noto_Sans_Bengali } from "next/font/google";

import "./globals.css";
import { AppProviders } from "@/components/providers/AppProviders";

/** Display face — carries the brand voice, used at large sizes only. */
const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-bricolage",
  display: "swap",
});

/** Body face — tuned for dense UI text at small sizes. */
const interTight = Inter_Tight({
  subsets: ["latin"],
  variable: "--font-inter-tight",
  display: "swap",
});

/** Readouts — sensor values are instrument output and should read as such. */
const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

/** Advisory replies come back in Bangla; Latin faces render it poorly. */
const notoBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "FarmFlow — precision farming for controlled environments",
    template: "%s · FarmFlow",
  },
  description:
    "Live field monitoring, AI crop advice and verified expert support for greenhouse and high-value crop growers.",
};

/**
 * Server component. Only the provider tree below is client-side, so pages and
 * layouts can stay on the server unless they genuinely need interactivity.
 */
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${bricolage.variable} ${interTight.variable} ${jetbrains.variable} ${notoBengali.variable}`}
    >
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
