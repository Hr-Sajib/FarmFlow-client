
'use client';

import { Toaster } from 'react-hot-toast';

export default function ToasterProvider() {
  return (
    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          marginTop: '4rem', // Equivalent to Tailwind mt-16
          background: '#fff',
          color: '#333',
          border: '2px solid #38a169',
        },
      }}
    />
  );
}
