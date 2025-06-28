import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ReduxProvider } from "@/redux/Provider";
import Navbar from "@/components/Navbar";
import { Kaushan_Script } from "next/font/google";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });


const kaushanScript = Kaushan_Script({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-kaushan-script", // for cleaner targeting
});

export const metadata: Metadata = {
  title: "FarmFlow",
  description: "Smart agriculture dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
<body className={`${geistSans.variable} ${geistMono.variable} ${kaushanScript.variable} antialiased`}>
        <ReduxProvider>
          <Navbar />
          <main className="pt-20">{children}</main>
        </ReduxProvider>
      </body>
    </html>
  );
}
