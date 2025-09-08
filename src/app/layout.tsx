'use client'; // Mark as client component
import type { ReactNode } from 'react';
import Navbar from '@/components/Navbar';
import './globals.css';
import { ReduxProvider } from '@/redux/Provider';
import { PersistGate } from 'redux-persist/integration/react';
import AuthGuard from '@/components/auth/AuthGuard';
import ToasterProvider from '@/components/providers/ToasterProvider';
import { persistor } from '@/redux/store'; // Adjust path to your Redux store

// Define the layout component
function ClientLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ReduxProvider>
          <PersistGate loading={null} persistor={persistor}>
            <AuthGuard>
              <Navbar /> {/* Always visible if logged in */}
              <main className="pt-12">{children}</main>
            </AuthGuard>
            <ToasterProvider />
          </PersistGate>
        </ReduxProvider>
      </body>
    </html>
  );
}

// Export the layout wrapped in a client-only component
export default ClientLayout;