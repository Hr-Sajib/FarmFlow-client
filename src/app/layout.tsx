import type { ReactNode } from "react";
import Navbar from "@/components/Navbar";
import "./globals.css";
import { ReduxProvider } from "@/redux/Provider";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <Navbar /> {/* Always visible */}
          <main className="pt-12">{children}</main>
        </ReduxProvider>
      </body>
    </html>
  );
}
