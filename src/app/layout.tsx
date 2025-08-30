
import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import './globals.css';
import { ReduxProvider } from '@/redux/Provider';
import AuthGuard from '@/components/auth/AuthGuard';
import ToasterProvider from '@/components/providers/ToasterProvider';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <AuthGuard>
            <Navbar /> {/* Always visible if logged in */}
            <main className="pt-12">{children}</main>
          </AuthGuard>
          <ToasterProvider/>
        </ReduxProvider>
      </body>
    </html>
  );
}
