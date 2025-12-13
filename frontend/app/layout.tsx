import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from './context/authContext';

export const metadata: Metadata = {
  title: 'Restaurant Management System',
  description: 'A comprehensive restaurant management system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
